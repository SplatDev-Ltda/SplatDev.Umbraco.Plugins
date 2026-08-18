using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.Restricted.Models;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace SplatDev.Umbraco.Plugins.Restricted.Services;

public class RestrictedContentService : IRestrictedContentService
{
    private readonly IPublicAccessService _publicAccessService;
    private readonly IContentService _contentService;
    private readonly IMemberGroupService _memberGroupService;
    private readonly ILogger<RestrictedContentService> _logger;

    public RestrictedContentService(
        IPublicAccessService publicAccessService,
        IContentService contentService,
        IMemberGroupService memberGroupService,
        ILogger<RestrictedContentService> logger)
    {
        _publicAccessService = publicAccessService;
        _contentService = contentService;
        _memberGroupService = memberGroupService;
        _logger = logger;
    }

    // ── reference resolution ─────────────────────────────────────────────────

    /// <summary>
    /// Resolves an int id, a GUID key or a UDI to content.
    /// </summary>
    /// <remarks>
    /// One method rather than a per-backoffice contract: Umbraco 13's pickers return
    /// integer ids or UDIs, Umbraco 17's return GUID keys, and a hand-typed id should keep
    /// working for anyone who scripted against the old API.
    /// </remarks>
    internal IContent? Resolve(string? reference)
    {
        if (string.IsNullOrWhiteSpace(reference)) return null;
        var value = reference.Trim();

        if (int.TryParse(value, out var id))
            return id > 0 ? _contentService.GetById(id) : null;

        if (Guid.TryParse(value, out var key))
            return _contentService.GetById(key);

        if (UdiParser.TryParse(value, out var udi) && udi is GuidUdi guidUdi)
            return _contentService.GetById(guidUdi.Guid);

        return null;
    }

    private ContentRef ToRef(IContent content) => new()
    {
        Id = content.Id,
        Key = content.Key,
        Name = content.Name ?? $"Content {content.Id}",
        Path = BuildPath(content),
    };

    /// <summary>
    /// Ancestor names joined with " / ", so duplicates are distinguishable in a list.
    /// </summary>
    private string BuildPath(IContent content)
    {
        // content.Path is "-1,1050,1063" — ids only, which is what made the old dashboard
        // unreadable. Walk it into names, skipping the -1 root sentinel.
        var names = new List<string>();
        foreach (var segment in content.Path.Split(',', StringSplitOptions.RemoveEmptyEntries))
        {
            if (!int.TryParse(segment, out var id) || id <= 0) continue;
            if (id == content.Id) break;

            var ancestor = _contentService.GetById(id);
            if (ancestor?.Name is not null) names.Add(ancestor.Name);
        }

        return names.Count == 0 ? string.Empty : string.Join(" / ", names);
    }

    // ── member groups ────────────────────────────────────────────────────────

    public Task<IReadOnlyList<MemberGroupRef>> GetMemberGroupsAsync()
    {
        var groups = _memberGroupService.GetAll()
            .Select(g => new MemberGroupRef { Key = g.Key, Name = g.Name ?? string.Empty })
            .Where(g => !string.IsNullOrWhiteSpace(g.Name))
            .OrderBy(g => g.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return Task.FromResult<IReadOnlyList<MemberGroupRef>>(groups);
    }

    /// <summary>
    /// Maps picker keys or plain names onto real groups, dropping anything unknown.
    /// </summary>
    private List<MemberGroupRef> ResolveGroups(IEnumerable<string> refs, out List<string> unknown)
    {
        var all = _memberGroupService.GetAll()
            .Select(g => new MemberGroupRef { Key = g.Key, Name = g.Name ?? string.Empty })
            .ToList();

        var resolved = new List<MemberGroupRef>();
        unknown = [];

        foreach (var raw in refs.Select(r => r?.Trim()).Where(r => !string.IsNullOrWhiteSpace(r)))
        {
            var match = Guid.TryParse(raw, out var key)
                ? all.FirstOrDefault(g => g.Key == key)
                : all.FirstOrDefault(g => string.Equals(g.Name, raw, StringComparison.OrdinalIgnoreCase));

            if (match is null) unknown.Add(raw!);
            else if (!resolved.Any(r => r.Key == match.Key)) resolved.Add(match);
        }

        return resolved;
    }

    // ── reads ────────────────────────────────────────────────────────────────

    public Task<IReadOnlyList<RestrictedNode>> GetRestrictedNodesAsync(IEnumerable<MemberGroup> memberGroups = null)
    {
        var list = new List<RestrictedNode>();

        foreach (var entry in _publicAccessService.GetAll())
        {
            var content = _contentService.GetById(entry.ProtectedNodeId);
            if (content is null)
            {
                // A protected node that has since been deleted. Skip rather than surface a
                // row the editor cannot act on.
                _logger.LogDebug("Public access entry {EntryId} points at missing node {NodeId}.",
                    entry.Key, entry.ProtectedNodeId);
                continue;
            }

            list.Add(Describe(content, entry));
        }

        return Task.FromResult<IReadOnlyList<RestrictedNode>>(
            list.OrderBy(n => n.Node.Path, StringComparer.OrdinalIgnoreCase)
                .ThenBy(n => n.Node.Name, StringComparer.OrdinalIgnoreCase)
                .ToList());
    }

    public Task<RestrictedNode?> GetRestrictedNodeAsync(string nodeRef)
    {
        var content = Resolve(nodeRef);
        if (content is null) return Task.FromResult<RestrictedNode?>(null);

        var entry = _publicAccessService.GetEntryForContent(content);
        return Task.FromResult(entry is null ? null : Describe(content, entry));
    }

    private RestrictedNode Describe(IContent content, PublicAccessEntry entry)
    {
        var names = entry.Rules
            .Where(r => r.RuleType == Constants.Conventions.PublicAccess.MemberRoleRuleType)
            .Select(r => r.RuleValue)
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .ToList();

        var groups = ResolveGroups(names!, out var unknown);

        // A rule naming a group that no longer exists still gates the branch, so show it
        // rather than quietly dropping it — otherwise the UI implies access nobody has.
        groups.AddRange(unknown.Select(n => new MemberGroupRef { Key = Guid.Empty, Name = n }));

        var login = _contentService.GetById(entry.LoginNodeId);
        var error = _contentService.GetById(entry.NoAccessNodeId);

        return new RestrictedNode
        {
            Node = ToRef(content),
            LoginPage = login is null ? null : ToRef(login),
            ErrorPage = error is null ? null : ToRef(error),
            MemberGroups = groups,
        };
    }

    // ── writes ───────────────────────────────────────────────────────────────

    public Task<RestrictResult> RestrictNodeAsync(RestrictNodeRequest request)
    {
        var content = Resolve(request.Node);
        if (content is null)
            return Task.FromResult(RestrictResult.Fail("Pick the page to protect."));

        var login = Resolve(request.LoginPage);
        if (login is null)
            return Task.FromResult(RestrictResult.Fail("Pick a login page. Members are sent here when they are not signed in."));

        var error = Resolve(request.ErrorPage);
        if (error is null)
            return Task.FromResult(RestrictResult.Fail("Pick an error page. Members are sent here when they are signed in but not in an allowed group."));

        var groups = ResolveGroups(request.MemberGroups, out var unknown);
        if (unknown.Count > 0)
            return Task.FromResult(RestrictResult.Fail($"Unknown member group: {string.Join(", ", unknown)}."));
        if (groups.Count == 0)
            return Task.FromResult(RestrictResult.Fail("Choose at least one member group, otherwise nobody could reach the page."));

        var existing = _publicAccessService.GetEntryForContent(content);
        if (existing is not null) _publicAccessService.Delete(existing);

        var entryId = Guid.NewGuid();
        var rules = groups.Select(g => new PublicAccessRule(Guid.NewGuid(), entryId)
        {
            RuleType = Constants.Conventions.PublicAccess.MemberRoleRuleType,
            RuleValue = g.Name,
        });

        _publicAccessService.Save(new PublicAccessEntry(content, login, error, rules));

        _logger.LogInformation("Protected {Node} ({NodeId}) for groups: {Groups}",
            content.Name, content.Id, string.Join(", ", groups.Select(g => g.Name)));

        var saved = _publicAccessService.GetEntryForContent(content);
        return Task.FromResult(RestrictResult.Ok(
            $"\"{content.Name}\" and everything beneath it now requires {Describe(groups)}.",
            saved is null ? null : Describe(content, saved)));
    }

    private static string Describe(List<MemberGroupRef> groups) =>
        groups.Count == 1
            ? $"membership of {groups[0].Name}"
            : $"membership of one of: {string.Join(", ", groups.Select(g => g.Name))}";

    public Task<RestrictResult> UnrestrictNodeAsync(string nodeRef)
    {
        var content = Resolve(nodeRef);
        if (content is null)
            return Task.FromResult(RestrictResult.Fail("That page could not be found."));

        var existing = _publicAccessService.GetEntryForContent(content);
        if (existing is null)
            return Task.FromResult(RestrictResult.Ok($"\"{content.Name}\" was not protected."));

        _publicAccessService.Delete(existing);
        _logger.LogInformation("Removed protection from {Node} ({NodeId}).", content.Name, content.Id);

        return Task.FromResult(RestrictResult.Ok($"\"{content.Name}\" is now public."));
    }
}

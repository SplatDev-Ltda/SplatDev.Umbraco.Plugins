using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.HiddenContent.Models;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace SplatDev.Umbraco.Plugins.HiddenContent.Services;

public class HiddenContentService : IHiddenContentService
{
    private const string NaviHideAlias = "umbracoNaviHide";

    /// <summary>Page size for the descendant sweep. Large enough to be few round trips, small enough not to load a whole site into memory at once.</summary>
    private const int PageSize = 500;

    private readonly IContentService _contentService;
    private readonly ILogger<HiddenContentService> _logger;

    public HiddenContentService(IContentService contentService, ILogger<HiddenContentService> logger)
    {
        _contentService = contentService;
        _logger = logger;
    }

    // ── reference resolution ─────────────────────────────────────────────────

    /// <summary>Resolves an int id, a GUID key or a UDI to content.</summary>
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

    /// <summary>
    /// Reads umbracoNaviHide tolerantly.
    /// </summary>
    /// <remarks>
    /// It was compared against the literal string "1". umbracoNaviHide is a true/false
    /// property, and depending on how it was set — by an editor, by a package, by an older
    /// version of this plugin — the stored value can be "1", "true", or a boxed boolean.
    /// A node hidden through the content tree therefore did not register as hidden here.
    /// </remarks>
    internal static bool IsHidden(IContent content)
    {
        var raw = content.GetValue(NaviHideAlias);

        return raw switch
        {
            null => false,
            bool b => b,
            int i => i == 1,
            string s => s.Equals("1", StringComparison.Ordinal)
                     || s.Equals("true", StringComparison.OrdinalIgnoreCase),
            _ => false,
        };
    }

    private ContentRef ToRef(IContent content) => new()
    {
        Id = content.Id,
        Key = content.Key,
        Name = content.Name ?? $"Content {content.Id}",
        Path = BuildPath(content),
        IsHidden = IsHidden(content),
    };

    private string BuildPath(IContent content)
    {
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

    // ── reads ────────────────────────────────────────────────────────────────

    public Task<IReadOnlyList<ContentRef>> GetHiddenNodesAsync()
    {
        // Previously this recursed the tree, calling GetPagedChildren(id, 0, int.MaxValue)
        // once per node — an N+1 over every node on the site, each asking for unbounded
        // rows. GetPagedDescendants sweeps the whole tree from the root in flat pages
        // instead, so the cost is the size of the site rather than its shape.
        var hidden = new List<ContentRef>();
        long page = 0;

        while (true)
        {
            var batch = _contentService
                .GetPagedDescendants(Constants.System.Root, page, PageSize, out var total)
                .ToList();

            hidden.AddRange(batch.Where(IsHidden).Select(ToRef));

            page++;
            if (batch.Count == 0 || page * PageSize >= total) break;
        }

        return Task.FromResult<IReadOnlyList<ContentRef>>(
            hidden.OrderBy(n => n.Path, StringComparer.OrdinalIgnoreCase)
                  .ThenBy(n => n.Name, StringComparer.OrdinalIgnoreCase)
                  .ToList());
    }

    public Task<bool?> IsHiddenAsync(string nodeRef)
    {
        var content = Resolve(nodeRef);
        return Task.FromResult(content is null ? (bool?)null : IsHidden(content));
    }

    // ── writes ───────────────────────────────────────────────────────────────

    public Task<HiddenResult> HideAsync(IEnumerable<string> nodeRefs) =>
        SetHiddenAsync(nodeRefs, hidden: true);

    public Task<HiddenResult> ShowAsync(IEnumerable<string> nodeRefs) =>
        SetHiddenAsync(nodeRefs, hidden: false);

    private Task<HiddenResult> SetHiddenAsync(IEnumerable<string> nodeRefs, bool hidden)
    {
        var refs = nodeRefs?.Where(r => !string.IsNullOrWhiteSpace(r)).ToList() ?? [];
        if (refs.Count == 0)
            return Task.FromResult(HiddenResult.Fail("Choose at least one page."));

        var changed = new List<ContentRef>();
        var missing = new List<string>();
        var skippedUnpublished = new List<string>();

        foreach (var reference in refs)
        {
            var content = Resolve(reference);
            if (content is null) { missing.Add(reference); continue; }

            content.SetValue(NaviHideAlias, hidden);

            // Saving alone leaves the change invisible on the site until the next publish,
            // which looks like the button did nothing. Publish only what was already
            // published — publishing a draft here would push unrelated unreviewed edits live.
            if (content.Published)
            {
#if NET10_0_OR_GREATER
                _contentService.Publish(content, content.AvailableCultures.ToArray());
#else
                _contentService.SaveAndPublish(content);
#endif
            }
            else
            {
                _contentService.Save(content);
                skippedUnpublished.Add(content.Name ?? reference);
            }

            changed.Add(ToRef(content));
        }

        if (changed.Count == 0)
            return Task.FromResult(HiddenResult.Fail(
                $"None of those pages could be found: {string.Join(", ", missing)}."));

        var verb = hidden ? "hidden from" : "restored to";
        var message = changed.Count == 1
            ? $"\"{changed[0].Name}\" {verb} navigation."
            : $"{changed.Count} pages {verb} navigation.";

        if (missing.Count > 0)
            message += $" {missing.Count} could not be found.";

        if (skippedUnpublished.Count > 0)
            message += $" Saved but not published (still drafts): {string.Join(", ", skippedUnpublished)}.";

        _logger.LogInformation("{Count} node(s) {Verb} navigation.", changed.Count, verb);

        return Task.FromResult(HiddenResult.Ok(message, changed));
    }
}

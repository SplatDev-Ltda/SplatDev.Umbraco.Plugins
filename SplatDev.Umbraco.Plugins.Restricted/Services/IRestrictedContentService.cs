using Umbraco.Cms.Core.Models.Membership;
using SplatDev.Umbraco.Plugins.Restricted.Models;
using Umbraco.Cms.Core.Models;

namespace SplatDev.Umbraco.Plugins.Restricted.Services;

public interface IRestrictedContentService
{
    /// <summary>
    /// Every protected branch, resolved to names and paths.
    /// </summary>
    /// <remarks>
    /// This used to return bare integers, which the dashboard then listed as "1063" with
    /// no way to tell what that was. Resolving here rather than in the UI keeps the two
    /// backoffices from each having to reimplement it.
    /// </remarks>
    Task<IReadOnlyList<RestrictedNode>> GetRestrictedNodesAsync(IEnumerable<IMemberGroup>? memberGroups = null);

    /// <summary>The protection on one node, or null when it is not protected.</summary>
    Task<RestrictedNode?> GetRestrictedNodeAsync(string nodeRef);

    /// <summary>Protects a branch, replacing any existing rule on it.</summary>
    Task<RestrictResult> RestrictNodeAsync(RestrictNodeRequest request);

    /// <summary>Removes protection. Succeeds quietly when there was none.</summary>
    Task<RestrictResult> UnrestrictNodeAsync(string nodeRef);

    /// <summary>All member groups on the site, for the picker and for validation.</summary>
    Task<IReadOnlyList<MemberGroupRef>> GetMemberGroupsAsync();
}

/// <summary>
/// The outcome of a change, with a message meant for an editor rather than a log file.
/// </summary>
/// <remarks>
/// The previous service returned void and logged a warning when it gave up, so the
/// dashboard reported success for calls that had silently done nothing — a node id that
/// did not resolve, or a login page that did not exist, both looked identical to a save.
/// </remarks>
public sealed class RestrictResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public RestrictedNode? Node { get; init; }

    public static RestrictResult Ok(string message, RestrictedNode? node = null) =>
        new() { Success = true, Message = message, Node = node };

    public static RestrictResult Fail(string message) =>
        new() { Success = false, Message = message };
}

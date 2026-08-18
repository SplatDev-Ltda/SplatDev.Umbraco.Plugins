using SplatDev.Umbraco.Plugins.HiddenContent.Models;

namespace SplatDev.Umbraco.Plugins.HiddenContent.Services;

public interface IHiddenContentService
{
    /// <summary>Every node hidden from navigation, resolved to names and paths.</summary>
    Task<IReadOnlyList<ContentRef>> GetHiddenNodesAsync();

    /// <summary>Whether one node is hidden. Null when the node does not exist.</summary>
    Task<bool?> IsHiddenAsync(string nodeRef);

    /// <summary>Hides one or more nodes from navigation.</summary>
    Task<HiddenResult> HideAsync(IEnumerable<string> nodeRefs);

    /// <summary>Restores one or more nodes to navigation.</summary>
    Task<HiddenResult> ShowAsync(IEnumerable<string> nodeRefs);
}

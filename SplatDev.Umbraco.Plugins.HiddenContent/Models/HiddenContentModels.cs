namespace SplatDev.Umbraco.Plugins.HiddenContent.Models;

/// <summary>A content node, resolved enough to show a human being.</summary>
public sealed class ContentRef
{
    public int Id { get; set; }
    public Guid Key { get; set; }
    public string Name { get; set; } = string.Empty;

    /// <summary>Breadcrumb of ancestor names, so two pages with the same name are tellable apart.</summary>
    public string Path { get; set; } = string.Empty;

    public bool IsHidden { get; set; }
}

/// <summary>
/// A request naming one or more nodes.
/// </summary>
/// <remarks>
/// References are free-form strings: Umbraco 13's pickers hand back integer ids or UDIs,
/// Umbraco 17's <c>umb-input-document</c> hands back GUID keys, and a hand-typed id should
/// keep working for anyone who scripted the old endpoints.
/// </remarks>
public sealed class NodeRefsRequest
{
    public List<string> Nodes { get; set; } = [];
}

/// <summary>The outcome of a change, phrased for an editor rather than a log file.</summary>
public sealed class HiddenResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public List<ContentRef> Affected { get; init; } = [];

    public static HiddenResult Ok(string message, List<ContentRef>? affected = null) =>
        new() { Success = true, Message = message, Affected = affected ?? [] };

    public static HiddenResult Fail(string message) =>
        new() { Success = false, Message = message };
}

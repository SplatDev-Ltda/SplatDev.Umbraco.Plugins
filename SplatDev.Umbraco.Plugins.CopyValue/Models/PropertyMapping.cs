namespace SplatDev.Umbraco.Plugins.CopyValue.Models;

/// <summary>
/// A single property alias mapping pair, used when deserializing PropertyMappingsJson.
/// </summary>
public class PropertyMapping
{
    public string Source { get; set; } = string.Empty;
    public string Target { get; set; } = string.Empty;
}

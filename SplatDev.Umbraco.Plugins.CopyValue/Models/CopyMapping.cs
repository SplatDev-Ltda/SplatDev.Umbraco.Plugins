namespace SplatDev.Umbraco.Plugins.CopyValue.Models;

public class CopyMapping
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SourceDocTypeAlias { get; set; } = string.Empty;
    public string TargetDocTypeAlias { get; set; } = string.Empty;

    /// <summary>
    /// JSON array of { "source": "propAlias", "target": "propAlias" } pairs.
    /// </summary>
    public string PropertyMappingsJson { get; set; } = "[]";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

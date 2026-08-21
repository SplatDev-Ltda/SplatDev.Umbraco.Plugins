namespace SplatDev.Umbraco.Plugins.DefaultValue.Models;

public class DefaultValueRule
{
    public int Id { get; set; }
    public string DocumentTypeAlias { get; set; } = string.Empty;
    public string PropertyAlias { get; set; } = string.Empty;
    public string DefaultValue { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
    public int Priority { get; set; } = 0;
}

namespace SplatDev.Umbraco.Plugins.PropertiesReport.Models;

public class PropertyReportItem
{
    public string ContentTypeName { get; set; } = string.Empty;
    public string ContentTypeAlias { get; set; } = string.Empty;
    public string PropertyName { get; set; } = string.Empty;
    public string PropertyAlias { get; set; } = string.Empty;
    public string PropertyEditorAlias { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
}

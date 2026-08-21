namespace SplatDev.Umbraco.Plugins.PropertiesReport.Models;

public class PropertiesReportResult
{
    public List<PropertyReportItem> Items { get; set; } = new();
    public int TotalProperties { get; set; }
    public int TotalContentTypes { get; set; }
}

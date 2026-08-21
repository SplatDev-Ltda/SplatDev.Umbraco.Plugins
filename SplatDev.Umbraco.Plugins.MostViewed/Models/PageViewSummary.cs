namespace SplatDev.Umbraco.Plugins.MostViewed.Models;

/// <summary>Computed summary of views for a single content node.</summary>
public class PageViewSummary
{
    public Guid ContentKey { get; set; }
    public string NodeName { get; set; } = string.Empty;
    public string NodeUrl { get; set; } = string.Empty;
    public int ViewCount { get; set; }
}

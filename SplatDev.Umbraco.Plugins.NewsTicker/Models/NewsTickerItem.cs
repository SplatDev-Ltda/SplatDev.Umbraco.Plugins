namespace SplatDev.Umbraco.Plugins.NewsTicker.Models;

public class NewsTickerItem
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? Url { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
}

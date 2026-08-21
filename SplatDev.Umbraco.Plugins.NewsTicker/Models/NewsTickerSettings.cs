namespace SplatDev.Umbraco.Plugins.NewsTicker.Models;

public class NewsTickerSettings
{
    public const string SectionKey = "UmbracoCms:NewsTicker";

    public int Speed { get; set; } = 50;
    public string Direction { get; set; } = "left";
    public string BackgroundColor { get; set; } = "#1a1a1a";
    public string TextColor { get; set; } = "#ffffff";
}

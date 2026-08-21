namespace SplatDev.Umbraco.Plugins.Slider.Models;

public class Slide
{
    public int Id { get; set; }
    public int SliderId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string? LinkText { get; set; }
    public int SortOrder { get; set; }
    public SliderConfig Slider { get; set; } = null!;
}

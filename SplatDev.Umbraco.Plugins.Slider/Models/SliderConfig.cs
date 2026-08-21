namespace SplatDev.Umbraco.Plugins.Slider.Models;

public class SliderConfig
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool Autoplay { get; set; } = true;
    public int AutoplayDelay { get; set; } = 5000;
    public bool Loop { get; set; } = true;
    public string Effect { get; set; } = "slide";
    public List<Slide> Slides { get; set; } = new();
}

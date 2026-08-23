namespace SplatDev.Umbraco.Plugins.Slider.Models;

/// <summary>
/// A slider as the API returns it.
/// </summary>
/// <remarks>
/// The endpoints used to serialize the <see cref="SliderConfig"/> entity straight out of
/// EF. Because the queries Include the slides, and every <see cref="Slide"/> carries a
/// Slider back-reference, System.Text.Json walked Slider to Slide to Slider and gave up:
///
///     A possible object cycle was detected.
///
/// A slider with no slides serialized fine, so an empty install looked healthy and the
/// dashboard broke the moment someone added the first slide — which is the only reason
/// to have the plugin at all.
///
/// Projecting is the fix rather than a serializer setting: nothing outside this shape
/// can leak, and the shape is what the dashboard and the picker actually need.
/// </remarks>
public class SliderDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool Autoplay { get; set; }
    public int AutoplayDelay { get; set; }
    public bool Loop { get; set; }
    public string Effect { get; set; } = "slide";
    public int SlideCount { get; set; }
    public List<SlideDto> Slides { get; set; } = new();

    public static SliderDto From(SliderConfig slider) => new()
    {
        Id = slider.Id,
        Name = slider.Name,
        Autoplay = slider.Autoplay,
        AutoplayDelay = slider.AutoplayDelay,
        Loop = slider.Loop,
        Effect = slider.Effect,
        SlideCount = slider.Slides?.Count ?? 0,
        Slides = slider.Slides?
            .OrderBy(s => s.SortOrder)
            .Select(SlideDto.From)
            .ToList() ?? new List<SlideDto>(),
    };
}

/// <summary>One slide, without the back-reference to its slider.</summary>
public class SlideDto
{
    public int Id { get; set; }
    public int SliderId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string? LinkText { get; set; }
    public int SortOrder { get; set; }

    public static SlideDto From(Slide slide) => new()
    {
        Id = slide.Id,
        SliderId = slide.SliderId,
        Title = slide.Title,
        Subtitle = slide.Subtitle,
        ImageUrl = slide.ImageUrl,
        LinkUrl = slide.LinkUrl,
        LinkText = slide.LinkText,
        SortOrder = slide.SortOrder,
    };
}

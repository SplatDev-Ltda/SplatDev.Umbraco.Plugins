using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.Slider.Models;
using SplatDev.Umbraco.Plugins.Slider.Services;

namespace SplatDev.Umbraco.Plugins.Slider.ViewComponents;

/// <summary>
/// Renders a slider on the front end.
/// </summary>
/// <remarks>
/// The plugin could build sliders in the backoffice and pick one on a document, but had
/// no way to put the result on a page — the picker chose an id nothing consumed.
/// </remarks>
public class SliderViewComponent : ViewComponent
{
    private readonly ISliderService _service;

    public SliderViewComponent(ISliderService service) => _service = service;

    /// <param name="sliderId">
    /// The slider to show. Omitted, the first slider is used, which is the common case
    /// on a site with one.
    /// </param>
    public async Task<IViewComponentResult> InvokeAsync(int? sliderId = null)
    {
        var slider = sliderId.HasValue
            ? await _service.GetSliderAsync(sliderId.Value)
            : (await _service.GetSlidersAsync()).FirstOrDefault();

        if (slider is null)
        {
            return View(new SliderViewModel(null, []));
        }

        var slides = (await _service.GetSlidesAsync(slider.Id))
            .OrderBy(s => s.SortOrder)
            .ToList();

        return View(new SliderViewModel(slider, slides));
    }
}

public record SliderViewModel(SliderConfig? Slider, IReadOnlyList<Slide> Slides);

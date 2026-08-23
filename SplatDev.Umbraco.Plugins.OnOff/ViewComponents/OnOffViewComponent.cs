using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.OnOff.Services;

namespace SplatDev.Umbraco.Plugins.OnOff.ViewComponents;

public class OnOffViewComponent : ViewComponent
{
    private readonly IOnOffService _service;

    public OnOffViewComponent(IOnOffService service)
    {
        _service = service;
    }

    public async Task<IViewComponentResult> InvokeAsync(string? alias = null)
    {
        if (alias is not null)
        {
            var feature = await _service.GetFeatureAsync(alias);
            return View(feature is not null ? new[] { feature } : Array.Empty<Models.FeatureToggle>());
        }

        var features = await _service.GetAllFeaturesAsync();
        return View(features);
    }
}

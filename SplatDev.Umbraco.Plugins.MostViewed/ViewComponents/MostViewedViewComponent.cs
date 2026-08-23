using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.MostViewed.Models;
using SplatDev.Umbraco.Plugins.MostViewed.Services;

namespace SplatDev.Umbraco.Plugins.MostViewed.ViewComponents;

public class MostViewedViewComponent : ViewComponent
{
    private readonly IMostViewedService _service;

    public MostViewedViewComponent(IMostViewedService service) => _service = service;

    public async Task<IViewComponentResult> InvokeAsync(int count = 5, int days = 30)
    {
        var items = await _service.GetMostViewedAsync(count, days);
        return View(items);
    }
}

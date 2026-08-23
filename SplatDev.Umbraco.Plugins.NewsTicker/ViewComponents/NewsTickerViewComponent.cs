using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.NewsTicker.Models;
using SplatDev.Umbraco.Plugins.NewsTicker.Services;

namespace SplatDev.Umbraco.Plugins.NewsTicker.ViewComponents;

public class NewsTickerViewComponent : ViewComponent
{
    private readonly INewsTickerService _service;
    private readonly NewsTickerSettings _settings;

    public NewsTickerViewComponent(
        INewsTickerService service,
        IOptions<NewsTickerSettings> settings)
    {
        _service = service;
        _settings = settings.Value;
    }

    public async Task<IViewComponentResult> InvokeAsync()
    {
        var items = await _service.GetActiveItemsAsync();
        ViewData["Settings"] = _settings;
        return View(items);
    }
}

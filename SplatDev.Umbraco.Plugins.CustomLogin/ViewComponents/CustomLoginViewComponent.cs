using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.CustomLogin.Services;

namespace SplatDev.Umbraco.Plugins.CustomLogin.ViewComponents;

public class CustomLoginViewComponent : ViewComponent
{
    private readonly ICustomLoginService _service;

    public CustomLoginViewComponent(ICustomLoginService service)
    {
        _service = service;
    }

    public async Task<IViewComponentResult> InvokeAsync()
    {
        var settings = await _service.GetSettingsAsync();
        return View(settings);
    }
}

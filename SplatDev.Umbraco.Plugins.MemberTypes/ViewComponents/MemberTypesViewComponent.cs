using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.MemberTypes.Services;

namespace SplatDev.Umbraco.Plugins.MemberTypes.ViewComponents;

public class MemberTypesViewComponent : ViewComponent
{
    private readonly IMemberTypesService _service;

    public MemberTypesViewComponent(IMemberTypesService service)
    {
        _service = service;
    }

    public async Task<IViewComponentResult> InvokeAsync()
    {
        var types = await _service.GetAllAsync();
        return View(types);
    }
}

using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.DefaultValue.Services;

namespace SplatDev.Umbraco.Plugins.DefaultValue.ViewComponents;

public class DefaultValueViewComponent : ViewComponent
{
    private readonly IDefaultValueService _service;

    public DefaultValueViewComponent(IDefaultValueService service)
    {
        _service = service;
    }

    public async Task<IViewComponentResult> InvokeAsync(string? documentTypeAlias = null)
    {
        var rules = documentTypeAlias is not null
            ? await _service.GetRulesForTypeAsync(documentTypeAlias)
            : await _service.GetRulesAsync();

        ViewBag.DocumentTypeAlias = documentTypeAlias;
        return View(rules);
    }
}

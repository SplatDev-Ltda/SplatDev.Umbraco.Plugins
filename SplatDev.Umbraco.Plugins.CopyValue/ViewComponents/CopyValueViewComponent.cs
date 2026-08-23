using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.CopyValue.Services;

namespace SplatDev.Umbraco.Plugins.CopyValue.ViewComponents;

public class CopyValueViewComponent : ViewComponent
{
    private readonly ICopyValueService _service;

    public CopyValueViewComponent(ICopyValueService service)
    {
        _service = service;
    }

    public async Task<IViewComponentResult> InvokeAsync(int? mappingId = null)
    {
        if (mappingId.HasValue)
        {
            var mapping = await _service.GetMappingAsync(mappingId.Value);
            return View(mapping is not null ? new[] { mapping } : Array.Empty<Models.CopyMapping>());
        }

        var mappings = await _service.GetMappingsAsync();
        return View(mappings);
    }
}

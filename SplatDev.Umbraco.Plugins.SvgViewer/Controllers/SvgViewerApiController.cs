using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.SvgViewer.Services;

namespace SplatDev.Umbraco.Plugins.SvgViewer.Controllers;

[Route("umbraco/api/svgviewer/[action]")]
public class SvgViewerApiController : ControllerBase
{
    private readonly ISvgViewerService _service;

    public SvgViewerApiController(ISvgViewerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetSvg([FromQuery] Guid mediaKey)
    {
        var info = await _service.GetSvgAsync(mediaKey);
        if (info == null)
            return NotFound($"SVG media item with key '{mediaKey}' not found.");

        return Ok(info);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSvg()
    {
        var items = await _service.GetAllSvgMediaAsync();
        return Ok(items);
    }
}

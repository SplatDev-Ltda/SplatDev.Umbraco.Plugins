using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.VideoPreview.Services;

namespace SplatDev.Umbraco.Plugins.VideoPreview.Controllers;

[Route("umbraco/api/videopreview/[action]")]
public class VideoPreviewApiController : ControllerBase
{
    private readonly IVideoPreviewService _service;

    public VideoPreviewApiController(IVideoPreviewService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetVideoInfo([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return BadRequest("Video URL is required.");

        var info = await _service.GetVideoInfoAsync(url);
        if (info is null)
            return NotFound("Could not extract video info from the provided URL.");

        return Ok(info);
    }
}

using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.LiveVideo.Models;
using SplatDev.Umbraco.Plugins.LiveVideo.Services;

namespace SplatDev.Umbraco.Plugins.LiveVideo.Controllers;

[Route("umbraco/api/livevideo/[action]")]
public class LiveVideoApiController : ControllerBase
{
    private readonly ILiveVideoService _service;

    public LiveVideoApiController(ILiveVideoService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetEmbed([FromQuery] string platform, [FromQuery] string channelId)
    {
        if (string.IsNullOrWhiteSpace(channelId))
            return BadRequest("Channel ID is required.");

        if (!Enum.TryParse<LiveVideoPlatform>(platform, ignoreCase: true, out var parsedPlatform))
            return BadRequest($"Invalid platform '{platform}'. Valid values: YouTube, Twitch, Vimeo.");

        var embed = _service.GetEmbedUrl(parsedPlatform, channelId);
        return Ok(embed);
    }
}

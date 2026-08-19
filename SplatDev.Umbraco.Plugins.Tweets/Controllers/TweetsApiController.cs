using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Tweets.Services;

namespace SplatDev.Umbraco.Plugins.Tweets.Controllers;

/// <remarks>
/// Previously anonymous. Refresh calls the upstream Twitter API on demand, so an anonymous caller could burn the API quota or the bill. Reading cached tweets stays open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/tweets")]
public class TweetsApiController : ControllerBase
{
    private readonly ITweetsService _service;

    public TweetsApiController(ITweetsService service)
    {
        _service = service;
    }

    [AllowAnonymous]
    [HttpGet("feed")]
    public async Task<IActionResult> GetTweets()
    {
        var tweets = await _service.GetCachedTweetsAsync();
        return Ok(tweets);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        try
        {
            await _service.RefreshFromApiAsync();
            var tweets = await _service.GetCachedTweetsAsync();
            return Ok(new { success = true, count = tweets.Count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }
}

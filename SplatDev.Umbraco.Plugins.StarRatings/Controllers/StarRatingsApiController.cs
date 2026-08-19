using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.StarRatings.Services;

namespace SplatDev.Umbraco.Plugins.StarRatings.Controllers;

/// <remarks>
/// Previously anonymous. Entirely public by design; recorded here so the next audit does not have to work that out again.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/starratings/[action]")]
public class StarRatingsApiController : ControllerBase
{
    private readonly IStarRatingsService _service;

    public StarRatingsApiController(IStarRatingsService service) => _service = service;

    /// <summary>GET /umbraco/api/starratings/GetRating?contentKey={guid}</summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetRating([FromQuery] Guid contentKey)
    {
        var average = await _service.GetAverageAsync(contentKey);
        var count = await _service.GetVoteCountAsync(contentKey);
        return Ok(new { contentKey, average, count });
    }

    /// <summary>POST /umbraco/api/starratings/Rate</summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Rate([FromBody] RateRequest request)
    {
        if (request.Rating < 1 || request.Rating > 5)
            return BadRequest("Rating must be between 1 and 5.");

        var voterIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        try
        {
            await _service.RateAsync(request.ContentKey, request.Rating, voterIp);
            var average = await _service.GetAverageAsync(request.ContentKey);
            var count = await _service.GetVoteCountAsync(request.ContentKey);
            return Ok(new { request.ContentKey, average, count });
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>GET /umbraco/api/starratings/GetTopRated?count=10</summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetTopRated([FromQuery] int count = 10)
    {
        if (count < 1 || count > 100) count = 10;
        var results = await _service.GetTopRatedAsync(count);
        return Ok(results);
    }
}

public record RateRequest(Guid ContentKey, int Rating);

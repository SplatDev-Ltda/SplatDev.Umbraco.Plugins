using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.MostViewed.Services;

namespace SplatDev.Umbraco.Plugins.MostViewed.Controllers;

[Route("umbraco/api/mostviewed/[action]")]
public class MostViewedApiController : ControllerBase
{
    private readonly IMostViewedService _service;

    public MostViewedApiController(IMostViewedService service) => _service = service;

    /// <summary>GET /umbraco/api/mostviewed/GetMostViewed?count=10&amp;days=30</summary>
    [HttpGet]
    public async Task<IActionResult> GetMostViewed(
        [FromQuery] int count = 10,
        [FromQuery] int days = 30)
    {
        if (count < 1 || count > 100) count = 10;
        if (days < 1 || days > 365) days = 30;

        var results = await _service.GetMostViewedAsync(count, days);
        return Ok(results);
    }

    /// <summary>GET /umbraco/api/mostviewed/GetViewCount?contentKey={guid}</summary>
    [HttpGet]
    public async Task<IActionResult> GetViewCount([FromQuery] Guid contentKey)
    {
        var count = await _service.GetViewCountAsync(contentKey);
        return Ok(new { contentKey, count });
    }
}

using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.VisitorCounter.Services;

namespace SplatDev.Umbraco.Plugins.VisitorCounter.Controllers;

[Route("umbraco/api/visitorcounter/[action]")]
public class VisitorCounterApiController : ControllerBase
{
    private readonly IVisitorCounterService _service;

    public VisitorCounterApiController(IVisitorCounterService service) => _service = service;

    /// <summary>GET /umbraco/api/visitorcounter/GetStats?days=30</summary>
    [HttpGet]
    public async Task<IActionResult> GetStats([FromQuery] int days = 30)
    {
        if (days < 1 || days > 365) days = 30;

        var total = await _service.GetTotalVisitsAsync();
        var unique = await _service.GetUniqueVisitsAsync(days);

        return Ok(new
        {
            totalVisits = total,
            uniqueVisits = unique,
            periodDays = days
        });
    }

    /// <summary>GET /umbraco/api/visitorcounter/GetDailyCounts?days=30</summary>
    [HttpGet]
    public async Task<IActionResult> GetDailyCounts([FromQuery] int days = 30)
    {
        if (days < 1 || days > 365) days = 30;

        var counts = await _service.GetDailyCountsAsync(days);

        return Ok(counts.Select(d => new
        {
            date = d.Date.ToString("yyyy-MM-dd"),
            totalVisits = d.TotalVisits,
            uniqueVisits = d.UniqueVisits
        }));
    }
}

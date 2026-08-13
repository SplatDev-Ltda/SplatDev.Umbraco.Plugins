using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.Analytics.Models;
using SplatDev.Umbraco.Plugins.Analytics.Services;

namespace SplatDev.Umbraco.Plugins.Analytics.Controllers;

[ApiController]
[Route("umbraco/api/analytics/[action]")]
public sealed class AnalyticsApiController(IAnalyticsService service) : ControllerBase
{
    [HttpGet]
    public Task<AnalyticsSummary> Summary([FromQuery] int days = 30, CancellationToken cancellationToken = default) => service.GetSummaryAsync(days, cancellationToken);

    [HttpGet]
    public Task<AnalyticsSettings> GetSettings(CancellationToken cancellationToken = default) => service.GetSettingsAsync(cancellationToken);

    [HttpPost]
    public async Task<IActionResult> Record([FromBody] AnalyticsVisit visit, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(visit.VisitorId) || string.IsNullOrWhiteSpace(visit.Path)) return BadRequest("VisitorId and Path are required.");
        visit.VisitedAtUtc = visit.VisitedAtUtc == default ? DateTime.UtcNow : visit.VisitedAtUtc.ToUniversalTime();
        await service.RecordVisitAsync(visit, cancellationToken);
        return Accepted();
    }
}

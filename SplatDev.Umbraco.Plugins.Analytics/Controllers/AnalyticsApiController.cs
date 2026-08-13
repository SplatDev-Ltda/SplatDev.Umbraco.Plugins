using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Attributes;
using SplatDev.Umbraco.Plugins.Analytics.Models;
using SplatDev.Umbraco.Plugins.Analytics.Services;

namespace SplatDev.Umbraco.Plugins.Analytics.Controllers;

[ApiController]
[IsBackOffice]
[Route("umbraco/api/analytics/[action]")]
public sealed class AnalyticsApiController(IAnalyticsService service) : ControllerBase
{
    [HttpGet]
    public Task<AnalyticsSummary> Summary([FromQuery] int days = 30, CancellationToken cancellationToken = default) => service.GetSummaryAsync(days, cancellationToken);

    [HttpGet]
    public Task<AnalyticsSettings> GetSettings(CancellationToken cancellationToken = default) => service.GetSettingsAsync(cancellationToken);
}

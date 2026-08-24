using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.Analytics.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.Analytics.Controllers;

/// <summary>
/// The statistics the backoffice dashboard reads.
/// </summary>
/// <remarks>
/// Authorised: these expose visitor addresses and browsing paths, which is not something to
/// serve anonymously. The v7 build's equivalent endpoints had no authorization at all.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
#if NET10_0_OR_GREATER
[Route("umbraco/api/analyticsstats")]
#endif
[Route("umbraco/backoffice/api/AnalyticsApi")]
public class AnalyticsApiController : ControllerBase
{
    private readonly IAnalyticsService _service;

    public AnalyticsApiController(IAnalyticsService service) => _service = service;

    /// <summary>Everything the dashboard's headline row and chart need, in one request.</summary>
    [HttpGet("summary")]
    public async Task<IActionResult> Summary([FromQuery] int days = 30, CancellationToken ct = default) =>
        Ok(await _service.GetSummaryAsync(days, ct));

    [HttpGet("total-visits")]
    public async Task<IActionResult> TotalVisits(CancellationToken ct) =>
        Ok(await _service.GetTotalVisitsAsync(false, ct));

    [HttpGet("recurring-visits")]
    public async Task<IActionResult> RecurringVisits(CancellationToken ct) =>
        Ok(await _service.GetRecurringVisitsAsync(false, ct));

    [HttpGet("real-time-visits")]
    public async Task<IActionResult> RealTimeVisits(CancellationToken ct) =>
        Ok(await _service.GetRealTimeVisitsAsync(ct));

    [HttpGet("results-by-date")]
    public async Task<IActionResult> ResultsByDate([FromQuery] DateTime date, CancellationToken ct) =>
        Ok(await _service.GetResultsByDateAsync(DateOnly.FromDateTime(date), ct));

    [HttpGet("results-for-days")]
    public async Task<IActionResult> ResultsForDays([FromQuery] int days = 30, CancellationToken ct = default) =>
        Ok(await _service.GetResultsForDaysAsync(days, ct));

    [HttpGet("by-entry-url")]
    public async Task<IActionResult> ByEntryUrl([FromQuery] int take = 20, CancellationToken ct = default) =>
        Ok(await _service.GetVisitsByEntryUrlAsync(take, ct));

    [HttpGet("by-exit-url")]
    public async Task<IActionResult> ByExitUrl([FromQuery] int take = 20, CancellationToken ct = default) =>
        Ok(await _service.GetVisitsByExitUrlAsync(take, ct));

    /// <summary>Groups visits by one of: entryUrl, exitUrl, country, city, resolution, ip.</summary>
    [HttpGet("results-by")]
    public async Task<IActionResult> ResultsBy([FromQuery] string filter, [FromQuery] int take = 20, CancellationToken ct = default) =>
        Ok(await _service.GetResultsByAsync(filter, take, ct));

    [HttpGet("visits-by-node")]
    public async Task<IActionResult> VisitsByNode([FromQuery] int nodeId, [FromQuery] int take = 100, CancellationToken ct = default) =>
        Ok(await _service.GetVisitsByNodeIdAsync(nodeId, take, ct));

    [HttpGet("visits")]
    public async Task<IActionResult> Visits(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? ipAddress = null,
        [FromQuery] bool includeBots = false,
        CancellationToken ct = default) =>
        Ok(await _service.GetPagedResultsAsync(page, pageSize, ipAddress, includeBots, ct));

    /// <summary>Runs the retention sweep now, rather than waiting for the background pass.</summary>
    [HttpPost("purge")]
    public async Task<IActionResult> Purge(CancellationToken ct) =>
        Ok(new { removed = await _service.PurgeExpiredAsync(ct) });
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Analytics.Configuration;
using SplatDev.Umbraco.Plugins.Analytics.Models;
using SplatDev.Umbraco.Plugins.Analytics.Services;

namespace SplatDev.Umbraco.Plugins.Analytics.Controllers;

/// <summary>
/// The endpoints visitors' browsers call. Anonymous by necessity — these are hit by the
/// public site.
/// </summary>
/// <remarks>
/// The v13 convention is <c>/umbraco/backoffice/api/&lt;Controller&gt;/&lt;Action&gt;</c>,
/// which Umbraco 17 does not route by convention at all, so the explicit route is added for
/// net10.0 only and the v13 bundle keeps calling the old url.
/// </remarks>
[AllowAnonymous]
#if NET10_0_OR_GREATER
[Route("umbraco/api/analytics")]
#endif
[Route("umbraco/backoffice/api/AnalyticsTracking")]
public class AnalyticsTrackingController : ControllerBase
{
    private readonly IAnalyticsService _service;
    private readonly AnalyticsOptions _options;

    public AnalyticsTrackingController(IAnalyticsService service, IOptions<AnalyticsOptions> options)
    {
        _service = service;
        _options = options.Value;
    }

    /// <summary>Records a page view. Returns the visit id, which the exit call needs.</summary>
    [HttpPost("record")]
    public async Task<IActionResult> Record([FromBody] RecordVisitRequest request, CancellationToken ct)
    {
        if (request is null)
            return BadRequest();

        var userAgent = Request.Headers.UserAgent.ToString();
        var isBot = BotDetector.IsBot(userAgent);

        if (isBot && !_options.RecordBots)
            return Ok(new { recorded = false, reason = "bot" });

        if (_options.IgnoreBackofficeUsers && IsBackofficeUser())
            return Ok(new { recorded = false, reason = "backoffice" });

        // Trusting a client-supplied address is a deliberate setting: it is what the v8
        // plugin did, and it is why IpSource exists. On Server the connection wins, and a
        // payload claiming otherwise is ignored.
        var ipAddress = _options.IpSource == IpSource.Server || string.IsNullOrWhiteSpace(request.IpAddress)
            ? HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0"
            : request.IpAddress!;

        var visit = await _service.RecordVisitAsync(request, ipAddress, userAgent, isBot, ct);
        return Ok(new { recorded = true, visitId = visit.Id, recurring = visit.RecurringVisit });
    }

    /// <summary>Closes a visit when the visitor leaves, recording where they went from.</summary>
    [HttpPost("exit")]
    public async Task<IActionResult> Exit([FromBody] RecordExitRequest request, CancellationToken ct)
    {
        if (request is null || request.VisitId <= 0)
            return BadRequest();

        var updated = await _service.RecordExitAsync(request, ct);
        return updated ? Ok(new { recorded = true }) : NotFound();
    }

    /// <summary>
    /// How many times this node has been visited. The old plugin exposed this so a template
    /// could show a visit count on the page itself.
    /// </summary>
    [HttpGet("visit-count")]
    public async Task<IActionResult> VisitCount([FromQuery] int nodeId, CancellationToken ct) =>
        Ok(await _service.GetVisitCountAsync(nodeId, ct));

    private bool IsBackofficeUser() =>
        User?.Identity?.IsAuthenticated == true;
}

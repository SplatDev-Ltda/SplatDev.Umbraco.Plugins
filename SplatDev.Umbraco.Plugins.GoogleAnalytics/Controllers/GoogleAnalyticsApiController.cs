using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.GoogleAnalytics.Models;
using SplatDev.Umbraco.Plugins.GoogleAnalytics.Services;

namespace SplatDev.Umbraco.Plugins.GoogleAnalytics.Controllers;

/// <remarks>
/// Previously anonymous. SaveSettings rewrote the analytics configuration and GetPageViews disclosed traffic data.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/analytics/[action]")]
public class GoogleAnalyticsApiController : ControllerBase
{
    private readonly IGoogleAnalyticsService _service;

    public GoogleAnalyticsApiController(IGoogleAnalyticsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _service.GetSettingsAsync();
        return Ok(settings);
    }

    [HttpPost]
    public async Task<IActionResult> SaveSettings([FromBody] GoogleAnalyticsSettings settings)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        await _service.SaveSettingsAsync(settings);
        return Ok(new { message = "Settings saved." });
    }

    [HttpGet]
    public async Task<IActionResult> GetPageViews([FromQuery] string? measurementId = null)
    {
        if (string.IsNullOrWhiteSpace(measurementId))
        {
            var current = await _service.GetSettingsAsync();
            measurementId = current.MeasurementId;
        }

        if (string.IsNullOrWhiteSpace(measurementId))
            return BadRequest("Measurement ID is required.");

        var views = await _service.GetPageViewsAsync(measurementId);
        return Ok(views);
    }
}

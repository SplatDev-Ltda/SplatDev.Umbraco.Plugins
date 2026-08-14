using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.OnOff.Models;
using SplatDev.Umbraco.Plugins.OnOff.Services;

namespace SplatDev.Umbraco.Plugins.OnOff.Controllers;

/// <remarks>
/// Previously anonymous. Feature flags. Anyone could read every flag and flip it — Enable, Disable, Delete — which is a remote switch for whatever the flags gate.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/onoff/[action]")]
public class OnOffApiController : ControllerBase
{
    private readonly IOnOffService _service;

    public OnOffApiController(IOnOffService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var features = await _service.GetAllFeaturesAsync();
        return Ok(features);
    }

    [HttpGet]
    public async Task<IActionResult> GetFeature([FromQuery] string alias)
    {
        if (string.IsNullOrWhiteSpace(alias))
            return BadRequest("Alias is required.");

        var feature = await _service.GetFeatureAsync(alias);
        if (feature is null)
            return NotFound();

        return Ok(feature);
    }

    [HttpPost]
    public async Task<IActionResult> UpsertFeature([FromBody] FeatureToggle feature)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.UpsertFeatureAsync(feature);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Enable([FromQuery] string alias)
    {
        if (string.IsNullOrWhiteSpace(alias))
            return BadRequest("Alias is required.");

        try
        {
            var result = await _service.EnableFeatureAsync(alias);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Disable([FromQuery] string alias)
    {
        if (string.IsNullOrWhiteSpace(alias))
            return BadRequest("Alias is required.");

        try
        {
            var result = await _service.DisableFeatureAsync(alias);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Schedule(
        [FromQuery] string alias,
        [FromQuery] DateTime? enableAt = null,
        [FromQuery] DateTime? disableAt = null)
    {
        if (string.IsNullOrWhiteSpace(alias))
            return BadRequest("Alias is required.");

        try
        {
            var result = await _service.ScheduleFeatureAsync(alias, enableAt, disableAt);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromQuery] int id)
    {
        await _service.DeleteFeatureAsync(id);
        return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> ApplyScheduled()
    {
        await _service.ApplyScheduledChangesAsync();
        return Ok(new { message = "Scheduled changes applied." });
    }
}

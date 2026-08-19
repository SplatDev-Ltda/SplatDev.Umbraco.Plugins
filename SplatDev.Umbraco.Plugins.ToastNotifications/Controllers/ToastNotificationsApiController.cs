using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.ToastNotifications.Models;
using SplatDev.Umbraco.Plugins.ToastNotifications.Services;

namespace SplatDev.Umbraco.Plugins.ToastNotifications.Controllers;

/// <remarks>
/// Previously anonymous. Create, Update and Delete on the notifications shown to editors.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/toastnotifications/[action]")]
public class ToastNotificationsApiController : ControllerBase
{
    private readonly IToastNotificationsService _service;

    public ToastNotificationsApiController(IToastNotificationsService service)
    {
        _service = service;
    }

    /// <summary>Every toast, for the management dashboard.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var toasts = await _service.GetAllToastsAsync();
        return Ok(toasts);
    }

    /// <summary>Only what should be showing now — what a front-end widget asks for.</summary>
    [HttpGet]
    public async Task<IActionResult> GetActive()
    {
        var toasts = await _service.GetActiveToastsAsync();
        return Ok(toasts);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ToastMessage toast)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var created = await _service.CreateToastAsync(toast);
        return Ok(created);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromQuery] int id, [FromBody] ToastMessage toast)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updated = await _service.UpdateToastAsync(id, toast);
        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromQuery] int id)
    {
        var deleted = await _service.DeleteToastAsync(id);
        if (!deleted)
            return NotFound();

        return Ok(new { message = "Toast deleted." });
    }
}

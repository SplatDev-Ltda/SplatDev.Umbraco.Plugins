using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.EmailNotifications.Services;

namespace SplatDev.Umbraco.Plugins.EmailNotifications.Controllers;

/// <summary>Member-facing notification endpoints. Callers must supply memberId.</summary>
/// <remarks>
/// Previously anonymous. Editor notifications, including MarkAllRead across them.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/notifications")]
public class NotificationsController(INotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string memberId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(memberId))
            return BadRequest("memberId is required.");

        return Ok(await notificationService.GetAllAsync(memberId, ct));
    }

    [HttpGet("unread")]
    public async Task<IActionResult> GetUnread([FromQuery] string memberId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(memberId))
            return BadRequest("memberId is required.");

        return Ok(await notificationService.GetUnreadAsync(memberId, ct));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount([FromQuery] string memberId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(memberId))
            return BadRequest("memberId is required.");

        var count = await notificationService.GetUnreadCountAsync(memberId, ct);
        return Ok(new { count });
    }

    [HttpPost("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id, CancellationToken ct)
    {
        var result = await notificationService.MarkReadAsync(id, ct);
        return result ? NoContent() : NotFound();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead([FromQuery] string memberId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(memberId))
            return BadRequest("memberId is required.");

        var count = await notificationService.MarkAllReadAsync(memberId, ct);
        return Ok(new { markedRead = count });
    }
}

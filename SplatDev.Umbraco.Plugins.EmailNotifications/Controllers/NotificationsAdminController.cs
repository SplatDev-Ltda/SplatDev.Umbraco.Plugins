using Microsoft.AspNetCore.Mvc;
#if NET10_0_OR_GREATER
using Umbraco.Cms.Api.Management.Controllers;
#else
using Umbraco.Cms.Web.BackOffice.Controllers;
#endif
using SplatDev.Umbraco.Plugins.EmailNotifications.Models;
using SplatDev.Umbraco.Plugins.EmailNotifications.Services;

namespace SplatDev.Umbraco.Plugins.EmailNotifications.Controllers;

/// <summary>Admin-facing controller for managing and creating member notifications from the backoffice.</summary>
[Route("umbraco/api/admin/notifications")]
#if NET10_0_OR_GREATER
public class NotificationsAdminController(
    INotificationService notificationService,
    EmailNotificationsDbContext db) : ManagementApiControllerBase
#else
public class NotificationsAdminController(
    INotificationService notificationService,
    EmailNotificationsDbContext db) : UmbracoAuthorizedApiController
#endif
{
    public record CreateNotificationRequest(string MemberId, NotificationType Type, string Message);

    [HttpGet("")]
    public async Task<IActionResult> GetForMember([FromQuery] string memberId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(memberId))
            return BadRequest("memberId is required.");

        return Ok(await notificationService.GetAllAsync(memberId, ct));
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreateNotificationRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.MemberId) || string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("MemberId and Message are required.");

        var notification = await notificationService.CreateAsync(request.MemberId, request.Type, request.Message, ct);
        return Ok(notification);
    }

    [HttpPost("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id, CancellationToken ct)
    {
        var result = await notificationService.MarkReadAsync(id, ct);
        return result ? NoContent() : NotFound();
    }

    [HttpPost("{memberId}/read-all")]
    public async Task<IActionResult> MarkAllRead(string memberId, CancellationToken ct)
    {
        var count = await notificationService.MarkAllReadAsync(memberId, ct);
        return Ok(new { markedRead = count });
    }
}

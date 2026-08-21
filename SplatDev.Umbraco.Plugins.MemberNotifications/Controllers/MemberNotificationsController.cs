using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Web.Common.Filters;
using SplatDev.Umbraco.Plugins.MemberNotifications.Services;

namespace SplatDev.Umbraco.Plugins.MemberNotifications.Controllers;

[ApiController]
[Route("api/member/notifications")]
[UmbracoMemberAuthorize]
public class MemberNotificationsController(
    INotificationService notificationService,
    IMemberManager memberManager,
    ILogger<MemberNotificationsController> logger) : ControllerBase
{
    /// <summary>Returns the authenticated member's notifications, newest-first, paginated.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var memberKey = await GetMemberKeyAsync();
        if (memberKey == Guid.Empty)
            return Unauthorized();

        var (items, total) = notificationService.GetPaged(memberKey, page, pageSize);
        return Ok(new
        {
            items,
            total,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(total / (double)pageSize),
        });
    }

    /// <summary>Returns count of unread notifications for the authenticated member.</summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct = default)
    {
        var memberKey = await GetMemberKeyAsync();
        if (memberKey == Guid.Empty)
            return Unauthorized();

        return Ok(new { count = notificationService.GetUnreadCount(memberKey) });
    }

    /// <summary>Marks specified notifications (or all if ids is empty) as read.</summary>
    [HttpPost("mark-read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> MarkRead(
        [FromBody] MarkReadRequest? req,
        CancellationToken ct = default)
    {
        var memberKey = await GetMemberKeyAsync();
        if (memberKey == Guid.Empty)
            return Unauthorized();

        int marked;
        if (req?.Ids is { Count: > 0 })
            marked = notificationService.MarkRead(memberKey, req.Ids);
        else
            marked = notificationService.MarkAllRead(memberKey);

        return Ok(new { marked });
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private async Task<Guid> GetMemberKeyAsync()
    {
        var member = await memberManager.GetCurrentMemberAsync();
        return member?.Key ?? Guid.Empty;
    }
}

public sealed record MarkReadRequest(IReadOnlyList<int>? Ids = null);

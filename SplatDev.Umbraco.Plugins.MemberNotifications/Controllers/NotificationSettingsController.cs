#if NET10_0_OR_GREATER
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.MemberNotifications.Models;
using SplatDev.Umbraco.Plugins.MemberNotifications.Services;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.MemberNotifications.Controllers;

/// <summary>
/// Backs the notification configuration screen.
/// </summary>
/// <remarks>
/// Separate from MemberNotificationsController, which is the members' own inbox and is
/// deliberately member-authenticated. This one configures the site and is backoffice-only;
/// sharing a controller would have meant sharing an authorisation policy between two
/// audiences that must not overlap.
/// </remarks>
[Route("umbraco/api/membernotifications/[action]")]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
public class NotificationSettingsController(
    INotificationSettingsStore store,
    IMemberGroupService memberGroups) : ControllerBase
{
    /// <summary>The rules as configured, alongside the catalogue that describes them.</summary>
    [HttpGet]
    public IActionResult Settings()
    {
        var settings = store.Get();

        return Ok(new
        {
            settings.Enabled,
            settings.RetentionDays,
            rules = settings.Rules,
            events = NotificationEvents.All.Select(e => new
            {
                e.Key,
                e.Label,
                e.Category,
                e.Description,
                e.SupportsSelf,
                e.Tokens,
            }),
        });
    }

    /// <summary>Member groups available as recipients.</summary>
    [HttpGet]
    public async Task<IActionResult> MemberGroups()
    {
        var groups = await memberGroups.GetAllAsync();
        return Ok(groups.Select(g => g.Name).Where(n => !string.IsNullOrWhiteSpace(n)).OrderBy(n => n));
    }

    [HttpPost]
    public IActionResult Save([FromBody] NotificationSettings settings)
    {
        if (settings is null)
        {
            return BadRequest();
        }

        // Clamped rather than trusted: a negative retention would be read as "keep nothing"
        // by any cleanup that compares dates, quietly emptying every member's inbox.
        settings.RetentionDays = Math.Clamp(settings.RetentionDays, 0, 3650);

        // Drop rules for events this build does not know about, so a downgrade cannot leave
        // orphaned configuration that the screen shows but nothing acts on.
        settings.Rules = settings.Rules
            .Where(r => NotificationEvents.Find(r.Key) is not null)
            .ToDictionary(r => r.Key, r => r.Value);

        // A backoffice-user event has no member behind it, so "notify the person it happened
        // to" cannot mean anything. Clearing it here stops the stored document claiming
        // something the dispatcher will never do.
        foreach (var (key, rule) in settings.Rules)
        {
            if (NotificationEvents.Find(key) is { SupportsSelf: false })
            {
                rule.NotifySelf = false;
            }
        }

        store.Save(settings.WithDefaults());
        return Ok(new { saved = true });
    }
}
#endif

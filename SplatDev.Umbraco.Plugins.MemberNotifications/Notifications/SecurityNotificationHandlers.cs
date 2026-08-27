#if NET10_0_OR_GREATER
using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.MemberNotifications.Models;
using SplatDev.Umbraco.Plugins.MemberNotifications.Services;
using PluginNotificationService = SplatDev.Umbraco.Plugins.MemberNotifications.Services.INotificationService;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace SplatDev.Umbraco.Plugins.MemberNotifications.Notifications;

/// <summary>
/// Turns Umbraco's security events into in-app notifications, according to the configured rules.
/// </summary>
/// <remarks>
/// Everything routes through <see cref="RaiseAsync"/> so the enabled check, the recipient
/// resolution and the failure handling exist once. A handler that throws takes the event with
/// it - a failed sign-in that also breaks sign-in is a considerably worse outcome than a
/// missing notification - so nothing is allowed to escape.
///
/// Only events this Umbraco version actually publishes are handled. The member login
/// notifications arrived in 17.4; on 17.3 they do not exist, which is why the package now
/// requires 17.4.
/// </remarks>
public sealed class SecurityNotificationDispatcher(
    PluginNotificationService notifications,
    INotificationSettingsStore settings,
    IMemberService memberService,
    IUserService userService,
    ILogger<SecurityNotificationDispatcher> logger)
{
    public async Task RaiseAsync(
        string eventKey,
        Guid? subjectMemberKey,
        IReadOnlyDictionary<string, string?> tokens,
        CancellationToken ct = default)
    {
        try
        {
            var config = settings.Get();
            if (!config.Enabled || !config.Rules.TryGetValue(eventKey, out var rule) || !rule.Enabled)
            {
                return;
            }

            var recipients = new HashSet<Guid>();

            if (rule.NotifySelf && subjectMemberKey is { } key && key != Guid.Empty)
            {
                recipients.Add(key);
            }

            foreach (var group in rule.NotifyMemberGroups)
            {
                foreach (var member in memberService.GetMembersByGroup(group))
                {
                    recipients.Add(member.Key);
                }
            }

            if (recipients.Count == 0)
            {
                return;
            }

            var title = Fill(rule.Title, tokens);
            var body = Fill(rule.Body, tokens);

            foreach (var recipient in recipients)
            {
                await notifications.CreateAsync(recipient, eventKey, title, body, null, ct);
            }
        }
        catch (Exception ex)
        {
            // Never let a notification failure break the security event that caused it.
            logger.LogError(ex, "Could not raise member notifications for {EventKey}.", eventKey);
        }
    }

    /// <summary>Resolves a member's display name for use in a message.</summary>
    public string MemberName(Guid? key)
    {
        if (key is not { } k || k == Guid.Empty)
        {
            return "a member";
        }

        return memberService.GetByKey(k)?.Name ?? "a member";
    }

    /// <summary>Resolves a backoffice user's display name from whatever identifier the event carried.</summary>
    public string UserName(string? id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return "a backoffice user";
        }

        if (Guid.TryParse(id, out var guid))
        {
            return userService.GetAsync(guid).GetAwaiter().GetResult()?.Name ?? id;
        }

        return int.TryParse(id, out var numeric)
            ? userService.GetUserById(numeric)?.Name ?? id
            : id;
    }

    private static string Fill(string template, IReadOnlyDictionary<string, string?> tokens)
    {
        var result = template;
        foreach (var (token, value) in tokens)
        {
            result = result.Replace(token, value ?? "", StringComparison.OrdinalIgnoreCase);
        }

        return result;
    }

    internal static Dictionary<string, string?> Tokens(string who, string? ip) => new()
    {
        ["{member}"] = who,
        ["{user}"] = who,
        ["{when}"] = DateTime.UtcNow.ToString("u"),
        ["{ip}"] = string.IsNullOrWhiteSpace(ip) ? "an unknown address" : ip,
    };
}

/// <summary>Member sign-in, sign-out and second-factor events.</summary>
public sealed class MemberSecurityHandlers(SecurityNotificationDispatcher dispatcher) :
    INotificationAsyncHandler<MemberLoginSuccessNotification>,
    INotificationAsyncHandler<MemberLoginFailedNotification>,
    INotificationAsyncHandler<MemberLogoutSuccessNotification>,
    INotificationAsyncHandler<MemberTwoFactorRequestedNotification>
{
    public Task HandleAsync(MemberLoginSuccessNotification n, CancellationToken ct) =>
        dispatcher.RaiseAsync(NotificationEvents.MemberLoginSuccess, n.MemberKey,
            SecurityNotificationDispatcher.Tokens(dispatcher.MemberName(n.MemberKey), n.IpAddress), ct);

    public Task HandleAsync(MemberLoginFailedNotification n, CancellationToken ct) =>
        dispatcher.RaiseAsync(NotificationEvents.MemberLoginFailed, n.MemberKey,
            SecurityNotificationDispatcher.Tokens(dispatcher.MemberName(n.MemberKey), n.IpAddress), ct);

    public Task HandleAsync(MemberLogoutSuccessNotification n, CancellationToken ct) =>
        dispatcher.RaiseAsync(NotificationEvents.MemberLogout, n.MemberKey,
            SecurityNotificationDispatcher.Tokens(dispatcher.MemberName(n.MemberKey), n.IpAddress), ct);

    public Task HandleAsync(MemberTwoFactorRequestedNotification n, CancellationToken ct) =>
        dispatcher.RaiseAsync(NotificationEvents.MemberTwoFactorRequested, n.MemberKey,
            SecurityNotificationDispatcher.Tokens(dispatcher.MemberName(n.MemberKey), null), ct);
}

/// <summary>Member role changes.</summary>
public sealed class MemberRoleHandlers(SecurityNotificationDispatcher dispatcher, IMemberService members) :
    INotificationAsyncHandler<AssignedMemberRolesNotification>,
    INotificationAsyncHandler<RemovedMemberRolesNotification>
{
    public Task HandleAsync(AssignedMemberRolesNotification n, CancellationToken ct) =>
        RaiseForEachAsync(NotificationEvents.MemberRolesAssigned, n.MemberIds, n.Roles, ct);

    public Task HandleAsync(RemovedMemberRolesNotification n, CancellationToken ct) =>
        RaiseForEachAsync(NotificationEvents.MemberRolesRemoved, n.MemberIds, n.Roles, ct);

    private async Task RaiseForEachAsync(string key, int[] memberIds, string[] roles, CancellationToken ct)
    {
        foreach (var id in memberIds)
        {
            var member = members.GetById(id);
            if (member is null)
            {
                continue;
            }

            var tokens = SecurityNotificationDispatcher.Tokens(member.Name ?? "a member", null);
            tokens["{roles}"] = string.Join(", ", roles);
            await dispatcher.RaiseAsync(key, member.Key, tokens, ct);
        }
    }
}

/// <summary>
/// Backoffice user events.
/// </summary>
/// <remarks>
/// These have no member behind them, so they can only reach a member group - which is why the
/// configuration screen disables "notify the person it happened to" for this whole category
/// rather than offering a setting that would quietly do nothing.
/// </remarks>
public sealed class UserSecurityHandlers(SecurityNotificationDispatcher dispatcher) :
    INotificationAsyncHandler<UserLoginSuccessNotification>,
    INotificationAsyncHandler<UserLoginFailedNotification>,
    INotificationAsyncHandler<UserPasswordChangedNotification>,
    INotificationAsyncHandler<UserPasswordResetNotification>,
    INotificationAsyncHandler<UserForgotPasswordRequestedNotification>,
    INotificationAsyncHandler<UserTwoFactorRequestedNotification>,
    INotificationAsyncHandler<UserLockedNotification>,
    INotificationAsyncHandler<UserUnlockedNotification>
{
    public Task HandleAsync(UserLoginSuccessNotification n, CancellationToken ct) =>
        Raise(NotificationEvents.UserLoginSuccess, n.AffectedUserId, n.IpAddress, ct);

    public Task HandleAsync(UserLoginFailedNotification n, CancellationToken ct) =>
        Raise(NotificationEvents.UserLoginFailed, n.AffectedUserId, n.IpAddress, ct);

    public Task HandleAsync(UserPasswordChangedNotification n, CancellationToken ct) =>
        Raise(NotificationEvents.UserPasswordChanged, n.AffectedUserId, n.IpAddress, ct);

    public Task HandleAsync(UserPasswordResetNotification n, CancellationToken ct) =>
        Raise(NotificationEvents.UserPasswordReset, n.AffectedUserId, n.IpAddress, ct);

    public Task HandleAsync(UserForgotPasswordRequestedNotification n, CancellationToken ct) =>
        Raise(NotificationEvents.UserForgotPasswordRequested, n.AffectedUserId, n.IpAddress, ct);

    // This one carries only the user's key - no ip, no affected-user string like its siblings.
    public Task HandleAsync(UserTwoFactorRequestedNotification n, CancellationToken ct) =>
        Raise(NotificationEvents.UserTwoFactorRequested, n.UserKey.ToString(), null, ct);

    public Task HandleAsync(UserLockedNotification n, CancellationToken ct) =>
        Raise(NotificationEvents.UserLocked, n.AffectedUserId, n.IpAddress, ct);

    public Task HandleAsync(UserUnlockedNotification n, CancellationToken ct) =>
        Raise(NotificationEvents.UserUnlocked, n.AffectedUserId, n.IpAddress, ct);

    private Task Raise(string key, string? affectedUserId, string? ip, CancellationToken ct) =>
        dispatcher.RaiseAsync(key, null,
            SecurityNotificationDispatcher.Tokens(dispatcher.UserName(affectedUserId), ip), ct);
}
#endif

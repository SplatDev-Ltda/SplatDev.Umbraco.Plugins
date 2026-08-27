using System.Text.Json.Serialization;

namespace SplatDev.Umbraco.Plugins.MemberNotifications.Models;

/// <summary>
/// Which events raise an in-app notification, and who receives it.
/// </summary>
/// <remarks>
/// Stored as JSON through IKeyValueService rather than in a table of its own. This is one
/// small document read on nearly every request, and giving it a table means a migration, a
/// DbContext and the table-naming trap that has bitten several plugins here - for settings
/// that fit in a paragraph.
/// </remarks>
public class NotificationSettings
{
    public const string StorageKey = "SplatDev.Umbraco.Plugins.MemberNotifications/settings";

    /// <summary>Master switch. Off means no handler writes anything, whatever the rules say.</summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Drop notifications older than this. 0 keeps them forever.
    /// </summary>
    /// <remarks>
    /// Failed-login events in particular accumulate quickly on a public site, and an inbox
    /// nobody prunes is the thing that eventually makes the members section slow.
    /// </remarks>
    public int RetentionDays { get; set; } = 90;

    public Dictionary<string, NotificationRule> Rules { get; set; } = [];

    /// <summary>Fills in any event the stored document predates, so a new release is not silently inert.</summary>
    public NotificationSettings WithDefaults()
    {
        foreach (var definition in NotificationEvents.All)
        {
            if (!Rules.ContainsKey(definition.Key))
            {
                Rules[definition.Key] = new NotificationRule
                {
                    Enabled = definition.EnabledByDefault,
                    NotifySelf = definition.SupportsSelf,
                    Title = definition.DefaultTitle,
                    Body = definition.DefaultBody,
                };
            }
        }

        return this;
    }
}

/// <summary>What happens when one event fires.</summary>
public class NotificationRule
{
    public bool Enabled { get; set; }

    /// <summary>
    /// Notify the member the event is about. Meaningless for backoffice user events, which
    /// have no member behind them - see <see cref="NotificationEventDefinition.SupportsSelf"/>.
    /// </summary>
    public bool NotifySelf { get; set; }

    /// <summary>Member group names whose members also receive it - a security team, say.</summary>
    public List<string> NotifyMemberGroups { get; set; } = [];

    /// <summary>Supports the tokens listed on the event definition.</summary>
    public string Title { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;
}

/// <summary>One event the plugin can react to.</summary>
public record NotificationEventDefinition(
    string Key,
    string Label,
    string Category,
    string Description,
    bool SupportsSelf,
    bool EnabledByDefault,
    string DefaultTitle,
    string DefaultBody,
    IReadOnlyList<string> Tokens);

/// <summary>
/// The events this plugin can raise a notification for.
/// </summary>
/// <remarks>
/// Every one of these maps to a notification Umbraco actually publishes - checked against the
/// shipped assembly rather than assumed, because a handler for an event that does not exist
/// compiles perfectly and simply never fires.
/// </remarks>
public static class NotificationEvents
{
    public const string MemberLoginSuccess = "member.login.success";
    public const string MemberLoginFailed = "member.login.failed";
    public const string MemberLogout = "member.logout";
    public const string MemberTwoFactorRequested = "member.twofactor.requested";
    public const string MemberRolesAssigned = "member.roles.assigned";
    public const string MemberRolesRemoved = "member.roles.removed";

    public const string UserLoginSuccess = "user.login.success";
    public const string UserLoginFailed = "user.login.failed";
    public const string UserPasswordChanged = "user.password.changed";
    public const string UserPasswordReset = "user.password.reset";
    public const string UserForgotPasswordRequested = "user.forgotpassword.requested";
    public const string UserTwoFactorRequested = "user.twofactor.requested";
    public const string UserLocked = "user.locked";
    public const string UserUnlocked = "user.unlocked";

    private static readonly string[] MemberTokens = ["{member}", "{email}", "{when}", "{ip}"];
    private static readonly string[] UserTokens = ["{user}", "{email}", "{when}", "{ip}"];

    public static readonly IReadOnlyList<NotificationEventDefinition> All =
    [
        new(MemberLoginSuccess, "Signed in", "Member", "A member signed in successfully.",
            true, false, "New sign-in", "Your account was signed in on {when}.", MemberTokens),

        new(MemberLoginFailed, "Failed sign-in", "Member",
            "A sign-in attempt for a member account was refused. Noisy on a public site - see retention.",
            true, true, "Failed sign-in attempt",
            "Someone tried to sign in to your account on {when} and the password was wrong.", MemberTokens),

        new(MemberLogout, "Signed out", "Member", "A member signed out.",
            true, false, "Signed out", "Your account was signed out on {when}.", MemberTokens),

        new(MemberTwoFactorRequested, "Two-factor requested", "Member",
            "A second factor was requested during a member sign-in.",
            true, true, "Two-factor verification requested",
            "A verification code was requested for your account on {when}.", MemberTokens),

        new(MemberRolesAssigned, "Roles assigned", "Member", "A member was added to one or more roles.",
            true, true, "Your access changed", "You were added to: {roles}.", [.. MemberTokens, "{roles}"]),

        new(MemberRolesRemoved, "Roles removed", "Member", "A member was removed from one or more roles.",
            true, true, "Your access changed", "You were removed from: {roles}.", [.. MemberTokens, "{roles}"]),

        new(UserLoginSuccess, "Backoffice sign-in", "Backoffice user",
            "A backoffice user signed in. Has no member behind it, so it can only go to a group.",
            false, false, "Backoffice sign-in", "{user} signed in to the backoffice on {when}.", UserTokens),

        new(UserLoginFailed, "Failed backoffice sign-in", "Backoffice user",
            "A backoffice sign-in was refused. Worth watching - this is the one that precedes a breach.",
            false, true, "Failed backoffice sign-in",
            "A backoffice sign-in for {user} was refused on {when}.", UserTokens),

        new(UserPasswordChanged, "Password changed", "Backoffice user", "A backoffice user's password changed.",
            false, true, "Backoffice password changed", "The password for {user} was changed on {when}.", UserTokens),

        new(UserPasswordReset, "Password reset", "Backoffice user", "A backoffice user's password was reset.",
            false, true, "Backoffice password reset", "The password for {user} was reset on {when}.", UserTokens),

        new(UserForgotPasswordRequested, "Password reset requested", "Backoffice user",
            "Someone asked for a backoffice password reset link.",
            false, true, "Backoffice password reset requested",
            "A password reset was requested for {user} on {when}.", UserTokens),

        new(UserTwoFactorRequested, "Two-factor requested", "Backoffice user",
            "A second factor was requested during a backoffice sign-in.",
            false, false, "Backoffice two-factor requested",
            "A verification code was requested for {user} on {when}.", UserTokens),

        new(UserLocked, "Account locked", "Backoffice user",
            "A backoffice account was locked, usually after repeated failures.",
            false, true, "Backoffice account locked", "The account {user} was locked on {when}.", UserTokens),

        new(UserUnlocked, "Account unlocked", "Backoffice user", "A locked backoffice account was released.",
            false, true, "Backoffice account unlocked", "The account {user} was unlocked on {when}.", UserTokens),
    ];

    public static NotificationEventDefinition? Find(string key) =>
        All.FirstOrDefault(e => e.Key == key);
}

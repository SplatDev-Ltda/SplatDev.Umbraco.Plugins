using SplatDev.Umbraco.Plugins.WhatsApp.Models;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Services;

/// <summary>
/// Emails an administrator when an inbound WhatsApp message arrives and nobody has the
/// dashboard open.
/// </summary>
public interface INewMessageNotifier
{
    /// <summary>
    /// Notifies if warranted. Decides internally whether to send — callers should not
    /// have to know the presence or cooldown rules.
    /// </summary>
    /// <returns>True when an email was actually sent.</returns>
    Task<bool> NotifyIfUnattendedAsync(
        string waId, string? profileName, string? preview, CancellationToken ct = default);
}

using SplatDev.Umbraco.Plugins.ContentPackages.Entities;
using SplatDev.Umbraco.Plugins.ContentPackages.Models;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Services;

/// <summary>Outcome of a confirmation attempt.</summary>
public enum ConfirmResult
{
    Confirmed = 0,

    /// <summary>
    /// Already confirmed and still inside the token TTL. Treated as success —
    /// mail scanners pre-fetch links and would otherwise burn a single-use token
    /// before the human clicks it.
    /// </summary>
    AlreadyConfirmed = 1,

    InvalidToken = 2,
    Expired = 3,
}

/// <summary>Owns the signup → confirm → deliver state machine.</summary>
/// <remarks>
/// Double opt-in lives here rather than in the Newsletter plugin: today
/// <c>INewsletterService.Subscribe</c> writes an active subscriber immediately and
/// <c>Subscriber</c> has no status column, so there is no pending state to borrow.
/// A confirmed lead is handed to the Newsletter plugin only once it is genuinely opted in.
/// </remarks>
public interface ILeadService
{
    /// <summary>
    /// Registers a signup and sends the confirmation email.
    /// </summary>
    /// <remarks>
    /// Callers must not vary their response on the outcome — see the enumeration note in
    /// <c>SPEC.md</c>. Returns void-ish state for logging only.
    /// </remarks>
    Task SubscribeAsync(string email, string? name, string slug, string? ip, CancellationToken ct = default);

    /// <summary>Confirms an address and triggers the welcome email.</summary>
    Task<ConfirmResult> ConfirmAsync(string token, CancellationToken ct = default);

    Task<PackageLead?> GetByPublicIdAsync(string publicId, CancellationToken ct = default);

    /// <summary>True when the lead may still be served this asset.</summary>
    Task<bool> CanDownloadAsync(PackageLead lead, string slug, AssetKind kind, CancellationToken ct = default);

    Task RecordDownloadAsync(
        PackageLead lead, string slug, AssetKind kind, string? ip, string? userAgent, CancellationToken ct = default);

    Task RevokeAsync(int leadId, CancellationToken ct = default);

    Task ResendWelcomeAsync(int leadId, CancellationToken ct = default);
}

using SplatDev.Umbraco.Plugins.ContentPackages.Entities;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Services;

/// <summary>
/// Sends the two transactional emails. Kept behind an interface so Phase 3 (state
/// machine) can be built and tested before Phase 4 (templates and delivery) exists.
/// </summary>
public interface IPackageEmailSender
{
    /// <summary>Double opt-in email carrying the single-use confirm link.</summary>
    Task SendConfirmAsync(PackageLead lead, string confirmUrl, CancellationToken ct = default);

    /// <summary>Welcome email carrying the signed asset links, keyed by asset kind.</summary>
    Task SendWelcomeAsync(
        PackageLead lead, IReadOnlyDictionary<string, string> assetUrls, CancellationToken ct = default);
}

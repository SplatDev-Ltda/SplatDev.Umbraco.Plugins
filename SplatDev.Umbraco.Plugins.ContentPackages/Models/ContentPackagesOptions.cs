namespace SplatDev.Umbraco.Plugins.ContentPackages.Models;

/// <summary>
/// Configuration for gated content packages. Bound from <c>SplatDev:ContentPackages</c>.
/// </summary>
public class ContentPackagesOptions
{
    public const string SectionName = "SplatDev:ContentPackages";

    /// <summary>Folder containing one subfolder per package.</summary>
    public string Root { get; set; } = string.Empty;

    /// <summary>
    /// HMAC key for signing asset links. **Secret** — user-secrets or environment only.
    /// Rotating it invalidates every outstanding download link.
    /// </summary>
    public string SigningKey { get; set; } = string.Empty;

    /// <summary>Lifetime of an asset download link.</summary>
    public int TokenTtlDays { get; set; } = 30;

    /// <summary>Lifetime of the single-use email confirmation link.</summary>
    public int ConfirmTokenTtlHours { get; set; } = 72;

    /// <summary>Per-asset download cap for one lead. Zero means unlimited.</summary>
    public int MaxDownloadsPerAsset { get; set; }

    /// <summary>Newsletter list that confirmed leads are subscribed to.</summary>
    public int NewsletterListId { get; set; }

    /// <summary>
    /// Absolute base URL used to build links in emails. Set explicitly — the request host
    /// is not trustworthy behind a reverse proxy, and a wrong host produces dead links in
    /// mail that has already been sent.
    /// </summary>
    public string PublicBaseUrl { get; set; } = string.Empty;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Root) && !string.IsNullOrWhiteSpace(SigningKey);
}

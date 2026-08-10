using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Entities;

public enum LeadStatus
{
    /// <summary>Signed up, confirmation email sent, not yet confirmed.</summary>
    Pending = 0,

    /// <summary>Confirmed. Download links are live.</summary>
    Confirmed = 1,

    /// <summary>Links killed by an editor.</summary>
    Revoked = 2,
}

/// <summary>Someone who asked for a package.</summary>
public class PackageLead
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Opaque id embedded in download links. Separate from <see cref="Id"/> so links
    /// do not leak how many leads exist or allow guessing another lead's URL.
    /// </summary>
    [MaxLength(64)]
    public string PublicId { get; set; } = string.Empty;

    [MaxLength(320)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Name { get; set; }

    /// <summary>Package the lead signed up for.</summary>
    [MaxLength(128)]
    public string Slug { get; set; } = string.Empty;

    public LeadStatus Status { get; set; } = LeadStatus.Pending;

    /// <summary>
    /// SHA-256 of the confirmation token. The raw token only ever exists in the email,
    /// so a database leak cannot be replayed to confirm addresses.
    /// </summary>
    [MaxLength(128)]
    public string? ConfirmTokenHash { get; set; }

    public DateTime? ConfirmTokenExpiresUtc { get; set; }

    public DateTime? ConfirmedUtc { get; set; }

    /// <summary>Retained for the consent record.</summary>
    [MaxLength(64)]
    public string? SignupIp { get; set; }

    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}

using System.ComponentModel.DataAnnotations;

using SplatDev.Umbraco.Plugins.ContentPackages.Models;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Entities;

/// <summary>One served asset. Backs the per-asset download cap and the leads report.</summary>
public class PackageDownload
{
    [Key]
    public int Id { get; set; }

    public int LeadId { get; set; }

    [MaxLength(128)]
    public string Slug { get; set; } = string.Empty;

    public AssetKind Kind { get; set; }

    [MaxLength(64)]
    public string? Ip { get; set; }

    [MaxLength(512)]
    public string? UserAgent { get; set; }

    public DateTime DownloadedUtc { get; set; } = DateTime.UtcNow;
}

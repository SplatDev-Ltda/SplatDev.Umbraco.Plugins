using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SplatDev.Umbraco.Plugins.Analytics.Models;

/// <summary>A first-party visit recorded by Analytics 3.x. Raw IP addresses are never persisted.</summary>
[Table("Analytics_Visit")]
public sealed class AnalyticsVisit
{
    [Key] public long Id { get; set; }
    [MaxLength(64)] public string VisitorId { get; set; } = string.Empty;
    [MaxLength(512)] public string Path { get; set; } = "/";
    [MaxLength(512)] public string? Referrer { get; set; }
    [MaxLength(128)] public string? Country { get; set; }
    [MaxLength(128)] public string? City { get; set; }
    [MaxLength(128)] public string? Browser { get; set; }
    [MaxLength(128)] public string? OperatingSystem { get; set; }
    [MaxLength(32)] public string? Device { get; set; }
    [MaxLength(32)] public string? Resolution { get; set; }
    public DateTime VisitedAtUtc { get; set; }
}

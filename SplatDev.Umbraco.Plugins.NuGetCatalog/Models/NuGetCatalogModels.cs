using System.Text.Json.Serialization;

namespace SplatDev.Umbraco.Plugins.NuGetCatalog.Models;

/// <summary>
/// Configuration defaults, under "SplatDev:NuGetCatalog".
/// </summary>
/// <remarks>
/// These seed the settings file on first run only. After that the file is what the
/// dashboard edits, so changing configuration does not silently undo someone's clicks.
/// </remarks>
public class NuGetCatalogOptions
{
    public const string SectionName = "SplatDev:NuGetCatalog";

    /// <summary>NuGet owner accounts to list packages for.</summary>
    public List<string> Owners { get; set; } = [];

    /// <summary>Package ids to include on top of the owners' packages.</summary>
    public List<string> Packages { get; set; } = [];

    /// <summary>How long a fetched catalog stays warm before a refresh re-reads NuGet.</summary>
    public int CacheMinutes { get; set; } = 60;

    /// <summary>Characters kept in the row summary before the ellipsis.</summary>
    public int SummaryLength { get; set; } = 50;
}

/// <summary>
/// The persisted catalog settings - what the dashboard edits.
/// </summary>
public class CatalogSettings
{
    public List<string> Owners { get; set; } = [];
    public List<string> Added { get; set; } = [];
    public List<string> Hidden { get; set; } = [];
}

/// <summary>
/// One row of the catalog, already shaped for display.
/// </summary>
/// <remarks>
/// A record so the service can derive a row from a fetched one with `with` - marking it
/// hidden or explicit - without a mutable model or a hand-written clone.
/// </remarks>
public record PackageView
{
    public required string Id { get; init; }
    public string? Version { get; init; }
    public long TotalDownloads { get; init; }

    /// <summary>The summary truncated for display, ellipsis included.</summary>
    public string Summary { get; init; } = "—";

    /// <summary>The untruncated text, for a tooltip.</summary>
    public string? FullSummary { get; init; }

    public string? IconUrl { get; init; }
    public string? ProjectUrl { get; init; }
    public string NuGetUrl => $"https://www.nuget.org/packages/{Id}";

    /// <summary>True when this came from an explicit add rather than an owner search.</summary>
    public bool IsExplicit { get; init; }

    public bool IsHidden { get; init; }
    public bool IsDeprecated { get; init; }
    public int VulnerabilityCount { get; init; }
}

/// <summary>
/// What the dashboard renders: the rows plus how old they are.
/// </summary>
public class CatalogResponse
{
    public List<PackageView> Packages { get; init; } = [];
    public List<PackageView> Hidden { get; init; } = [];
    public List<string> Owners { get; init; } = [];
    public List<string> Added { get; init; } = [];

    /// <summary>When the underlying NuGet data was fetched. Null when nothing is cached.</summary>
    public DateTime? RefreshedUtc { get; init; }

    /// <summary>
    /// Set when NuGet could not be reached. The rows may still be populated from a warm
    /// cache, so this is a banner rather than an error response.
    /// </summary>
    public string? Warning { get; init; }
}

// --- NuGet Search API response ---------------------------------------------------
// Only the fields actually used. The API returns a good deal more.

internal class NuGetSearchResponse
{
    [JsonPropertyName("totalHits")] public int TotalHits { get; set; }
    [JsonPropertyName("data")] public List<NuGetSearchResult> Data { get; set; } = [];
}

internal class NuGetSearchResult
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("version")] public string? Version { get; set; }
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("summary")] public string? Summary { get; set; }
    [JsonPropertyName("title")] public string? Title { get; set; }
    [JsonPropertyName("iconUrl")] public string? IconUrl { get; set; }
    [JsonPropertyName("projectUrl")] public string? ProjectUrl { get; set; }
    [JsonPropertyName("totalDownloads")] public long TotalDownloads { get; set; }
    [JsonPropertyName("deprecation")] public object? Deprecation { get; set; }
    [JsonPropertyName("vulnerabilities")] public List<object>? Vulnerabilities { get; set; }
}

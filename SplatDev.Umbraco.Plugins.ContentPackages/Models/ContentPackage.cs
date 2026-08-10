using System.Text.Json.Serialization;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Models;

/// <summary>The four renderings of one piece of content.</summary>
public enum AssetKind
{
    /// <summary>Reading view, served inline.</summary>
    Html = 0,

    Pdf = 1,

    Pptx = 2,

    /// <summary>Source markdown, intended for LLM ingestion.</summary>
    Markdown = 3,
}

/// <summary>Health of a scanned package folder.</summary>
public enum PackageHealth
{
    Ok = 0,

    /// <summary>At least one expected asset kind is absent.</summary>
    MissingAsset = 1,

    /// <summary>
    /// Two or more files map to the same kind. Reported rather than guessed — picking
    /// the wrong one would email the wrong file.
    /// </summary>
    Ambiguous = 2,
}

/// <summary>A content package: one folder, one slug, up to four assets.</summary>
public class ContentPackage
{
    public string Slug { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Summary { get; set; }

    public string Version { get; set; } = "1";

    public DateTime? PublishedUtc { get; set; }

    /// <summary>Absolute path to the package folder. Never sent to the browser.</summary>
    [JsonIgnore]
    public string FolderPath { get; set; } = string.Empty;

    public Dictionary<AssetKind, PackageAsset> Assets { get; set; } = new();

    public PackageHealth Health { get; set; } = PackageHealth.Ok;

    /// <summary>Human-readable explanation when <see cref="Health"/> is not Ok.</summary>
    public List<string> Issues { get; set; } = new();
}

public class PackageAsset
{
    public AssetKind Kind { get; set; }

    public string FileName { get; set; } = string.Empty;

    /// <summary>Absolute path. Resolved from the catalogue only — never from user input.</summary>
    [JsonIgnore]
    public string FullPath { get; set; } = string.Empty;

    public long SizeBytes { get; set; }

    public string ContentType => Kind switch
    {
        AssetKind.Html => "text/html; charset=utf-8",
        AssetKind.Pdf => "application/pdf",
        AssetKind.Pptx => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        AssetKind.Markdown => "text/markdown; charset=utf-8",
        _ => "application/octet-stream",
    };

    /// <summary>HTML is read in the browser; everything else downloads.</summary>
    public bool ServeInline => Kind == AssetKind.Html;
}

/// <summary>Shape of the generated <c>package.json</c> manifest.</summary>
public class PackageManifest
{
    [JsonPropertyName("slug")]
    public string? Slug { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [JsonPropertyName("version")]
    public string? Version { get; set; }

    [JsonPropertyName("publishedUtc")]
    public DateTime? PublishedUtc { get; set; }

    [JsonPropertyName("assets")]
    public Dictionary<string, string>? Assets { get; set; }
}

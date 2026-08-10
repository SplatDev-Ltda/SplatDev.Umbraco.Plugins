using System.Text.Json;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.ContentPackages.Models;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Services;

/// <inheritdoc />
public class PackageCatalog : IPackageCatalog
{
    private static readonly Dictionary<string, AssetKind> ExtensionMap = new(StringComparer.OrdinalIgnoreCase)
    {
        [".html"] = AssetKind.Html,
        [".htm"] = AssetKind.Html,
        [".pdf"] = AssetKind.Pdf,
        [".pptx"] = AssetKind.Pptx,
        [".md"] = AssetKind.Markdown,
        [".markdown"] = AssetKind.Markdown,
    };

    private readonly ContentPackagesOptions _options;
    private readonly ILogger<PackageCatalog> _logger;

    // Guards the cache: a scan triggered from the backoffice can race page requests.
    private readonly object _gate = new();
    private IReadOnlyList<ContentPackage>? _cache;

    public PackageCatalog(IOptions<ContentPackagesOptions> options, ILogger<PackageCatalog> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public IReadOnlyList<ContentPackage> GetAll()
    {
        lock (_gate)
        {
            return _cache ??= ScanCore();
        }
    }

    public ContentPackage? GetBySlug(string slug) =>
        string.IsNullOrWhiteSpace(slug)
            ? null
            : GetAll().FirstOrDefault(p => string.Equals(p.Slug, slug, StringComparison.OrdinalIgnoreCase));

    public IReadOnlyList<ContentPackage> Scan()
    {
        lock (_gate)
        {
            return _cache = ScanCore();
        }
    }

    private IReadOnlyList<ContentPackage> ScanCore()
    {
        if (string.IsNullOrWhiteSpace(_options.Root))
        {
            _logger.LogWarning("ContentPackages root is not configured; no packages available.");
            return Array.Empty<ContentPackage>();
        }

        if (!Directory.Exists(_options.Root))
        {
            _logger.LogError("ContentPackages root '{Root}' does not exist or is unreadable.", _options.Root);
            return Array.Empty<ContentPackage>();
        }

        var packages = new List<ContentPackage>();

        foreach (var folder in Directory.EnumerateDirectories(_options.Root))
        {
            try
            {
                packages.Add(ReadFolder(folder));
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
            {
                // One unreadable folder must not blank the whole catalogue.
                _logger.LogError(ex, "Could not read content package folder '{Folder}'.", folder);
            }
        }

        _logger.LogInformation("ContentPackages scan found {Count} package(s).", packages.Count);
        return packages;
    }

    // TODO(CP-1): write package.json back to disk when absent, so editors can override
    // the derived title/summary. Phase 1 of PLAN.md.
    private ContentPackage ReadFolder(string folder)
    {
        var folderName = Path.GetFileName(folder.TrimEnd(Path.DirectorySeparatorChar));
        var manifest = ReadManifest(folder);

        var package = new ContentPackage
        {
            FolderPath = folder,
            Slug = Slugify(manifest?.Slug ?? folderName),
            Title = manifest?.Title ?? folderName,
            Summary = manifest?.Summary,
            Version = manifest?.Version ?? "1",
            PublishedUtc = manifest?.PublishedUtc,
        };

        // Group by kind first so duplicates are visible rather than last-write-wins.
        var byKind = new Dictionary<AssetKind, List<FileInfo>>();

        foreach (var file in new DirectoryInfo(folder).EnumerateFiles())
        {
            if (!ExtensionMap.TryGetValue(file.Extension, out var kind))
            {
                continue;
            }

            if (!byKind.TryGetValue(kind, out var list))
            {
                byKind[kind] = list = new List<FileInfo>();
            }

            list.Add(file);
        }

        foreach (var (kind, files) in byKind)
        {
            if (files.Count > 1)
            {
                package.Health = PackageHealth.Ambiguous;
                package.Issues.Add(
                    $"{files.Count} files map to {kind}: {string.Join(", ", files.Select(f => f.Name))}. " +
                    "Leave exactly one.");
                continue;
            }

            var file = files[0];
            package.Assets[kind] = new PackageAsset
            {
                Kind = kind,
                FileName = file.Name,
                FullPath = file.FullName,
                SizeBytes = file.Length,
            };
        }

        foreach (var kind in Enum.GetValues<AssetKind>())
        {
            if (!package.Assets.ContainsKey(kind))
            {
                if (package.Health == PackageHealth.Ok)
                {
                    package.Health = PackageHealth.MissingAsset;
                }

                package.Issues.Add($"No {kind} asset found.");
            }
        }

        return package;
    }

    private PackageManifest? ReadManifest(string folder)
    {
        var path = Path.Combine(folder, "package.json");
        if (!File.Exists(path))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<PackageManifest>(File.ReadAllText(path));
        }
        catch (Exception ex) when (ex is JsonException or IOException)
        {
            // A malformed manifest degrades to folder-derived metadata rather than
            // hiding the package entirely.
            _logger.LogError(ex, "Malformed package.json in '{Folder}'; falling back to folder name.", folder);
            return null;
        }
    }

    /// <summary>Lowercase, hyphenated, alphanumerics only — safe to put in a URL.</summary>
    internal static string Slugify(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var chars = value.Trim().ToLowerInvariant()
            .Select(c => char.IsLetterOrDigit(c) ? c : '-')
            .ToArray();

        var slug = new string(chars);

        while (slug.Contains("--", StringComparison.Ordinal))
        {
            slug = slug.Replace("--", "-", StringComparison.Ordinal);
        }

        return slug.Trim('-');
    }
}

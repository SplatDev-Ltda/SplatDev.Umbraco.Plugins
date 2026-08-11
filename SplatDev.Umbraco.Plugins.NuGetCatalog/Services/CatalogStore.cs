using System.Text.Json;
using System.Text.RegularExpressions;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.NuGetCatalog.Models;

namespace SplatDev.Umbraco.Plugins.NuGetCatalog.Services;

public interface ICatalogStore
{
    CatalogSettings Get();
    void Save(CatalogSettings settings);
    bool AddPackage(string urlOrId, out string? packageId);
    bool RemovePackage(string packageId);
    bool Hide(string packageId);
    bool Unhide(string packageId);
}

/// <summary>
/// The catalog's settings, persisted as one JSON file.
/// </summary>
/// <remarks>
/// A flat file rather than a database: this is three lists of strings, and a sidecar EF
/// context plus a migration would be more machinery than it earns.
///
/// Configuration seeds the file on first run only. After that the file wins, so editing
/// appsettings cannot silently undo what someone did in the dashboard.
/// </remarks>
internal sealed class CatalogStore : ICatalogStore
{
    private static readonly JsonSerializerOptions Json = new() { WriteIndented = true };
    private readonly object _gate = new();

    private readonly string _path;
    private readonly NuGetCatalogOptions _options;
    private readonly ILogger<CatalogStore> _logger;

    public CatalogStore(
        IOptions<NuGetCatalogOptions> options,
        ILogger<CatalogStore> logger,
        string dataDirectory)
    {
        _options = options.Value;
        _logger = logger;
        _path = Path.Combine(dataDirectory, "nuget-catalog.json");
    }

    public CatalogSettings Get()
    {
        lock (_gate)
        {
            return ReadLocked();
        }
    }

    public void Save(CatalogSettings settings)
    {
        lock (_gate)
        {
            Write(settings);
        }
    }

    public bool AddPackage(string urlOrId, out string? packageId)
    {
        var parsed = PackageIdParser.ParsePackageId(urlOrId);
        packageId = parsed;
        if (parsed is null)
        {
            return false;
        }

        lock (_gate)
        {
            var settings = ReadLocked();
            if (settings.Added.Any(a => string.Equals(a, parsed, StringComparison.OrdinalIgnoreCase)))
            {
                return false;
            }

            settings.Added.Add(parsed);
            Write(settings);
            return true;
        }
    }

    public bool RemovePackage(string packageId) => Mutate(s => s.Added, packageId, add: false);

    public bool Hide(string packageId) => Mutate(s => s.Hidden, packageId, add: true);

    public bool Unhide(string packageId) => Mutate(s => s.Hidden, packageId, add: false);

    private bool Mutate(Func<CatalogSettings, List<string>> pick, string packageId, bool add)
    {
        lock (_gate)
        {
            var settings = ReadLocked();
            var list = pick(settings);
            var existing = list.FirstOrDefault(x => string.Equals(x, packageId, StringComparison.OrdinalIgnoreCase));

            if (add)
            {
                if (existing is not null) return false;
                list.Add(packageId);
            }
            else
            {
                if (existing is null) return false;
                list.Remove(existing);
            }

            Write(settings);
            return true;
        }
    }

    /// <summary>Reads the file. Callers already hold <see cref="_gate"/>.</summary>
    private CatalogSettings ReadLocked()
    {
        if (!File.Exists(_path))
        {
            var seeded = Fallback();
            Write(seeded);
            return seeded;
        }

        try
        {
            return JsonSerializer.Deserialize<CatalogSettings>(File.ReadAllText(_path)) ?? Fallback();
        }
        catch (Exception ex) when (ex is JsonException or IOException)
        {
            // A corrupt settings file must not break the dashboard, let alone the site.
            // Fall back to configuration and say so in the log.
            _logger.LogError(ex, "Could not read {Path}; falling back to configuration.", _path);
            return Fallback();
        }
    }

    private CatalogSettings Fallback() => new()
    {
        Owners = [.. _options.Owners],
        Added = [.. _options.Packages],
    };

    private void Write(CatalogSettings settings)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_path)!);
        File.WriteAllText(_path, JsonSerializer.Serialize(settings, Json));
    }
}

/// <summary>
/// Turns whatever someone pasted into a canonical NuGet package id.
/// </summary>
/// <remarks>
/// Its own type rather than a member of the store: it is a pure function and the part
/// most worth testing, and making the whole store public just to reach it would widen an
/// implementation detail for no reason.
/// </remarks>
public static partial class PackageIdParser
{
    /// <summary>
    /// Reduces a nuget.org URL or a bare id to a package id, or null if it is neither.
    /// </summary>
    /// <remarks>
    /// Ids are stored rather than the URL that was pasted, so ".../packages/Umbraco.Cms",
    /// ".../packages/Umbraco.Cms/17.3.4/" and "Umbraco.Cms" all converge on one entry and
    /// cannot be added three times over.
    /// </remarks>
    public static string? ParsePackageId(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return null;
        }

        var value = input.Trim();

        if (value.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            value.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            if (!Uri.TryCreate(value, UriKind.Absolute, out var uri))
            {
                return null;
            }

            // /packages/<id>[/<version>]
            var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            var index = Array.FindIndex(segments, s => s.Equals("packages", StringComparison.OrdinalIgnoreCase));
            if (index < 0 || index + 1 >= segments.Length)
            {
                return null;
            }

            value = segments[index + 1];
        }

        return PackageIdPattern().IsMatch(value) ? value : null;
    }

    // NuGet ids are dot-separated alphanumeric segments, optionally joined by - or _.
    [GeneratedRegex(@"^[A-Za-z0-9]+([._-][A-Za-z0-9]+)*$", RegexOptions.Compiled)]
    private static partial Regex PackageIdPattern();
}

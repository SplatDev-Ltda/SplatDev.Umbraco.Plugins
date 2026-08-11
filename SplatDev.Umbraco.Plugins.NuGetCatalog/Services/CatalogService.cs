using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.NuGetCatalog.Models;

namespace SplatDev.Umbraco.Plugins.NuGetCatalog.Services;

public interface ICatalogService
{
    Task<CatalogResponse> GetAsync(bool refresh = false, CancellationToken ct = default);
}

/// <summary>
/// Composes the store and the NuGet client into what the dashboard renders.
/// </summary>
internal sealed class CatalogService(
    INuGetSearchClient client,
    ICatalogStore store,
    IMemoryCache cache,
    IOptions<NuGetCatalogOptions> options,
    ILogger<CatalogService> logger) : ICatalogService
{
    private const string CacheKey = "SplatDev.NuGetCatalog.Packages";
    private readonly NuGetCatalogOptions _options = options.Value;

    private sealed record Cached(List<PackageView> Packages, DateTime RefreshedUtc);

    public async Task<CatalogResponse> GetAsync(bool refresh = false, CancellationToken ct = default)
    {
        var settings = store.Get();

        Cached? entry = cache.Get<Cached>(CacheKey);
        string? warning = null;

        if (refresh || entry is null)
        {
            try
            {
                var fetched = await FetchAsync(settings, ct);
                entry = new Cached(fetched, DateTime.UtcNow);
                cache.Set(CacheKey, entry, TimeSpan.FromMinutes(Math.Max(1, _options.CacheMinutes)));
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                // Serve whatever is cached rather than failing the panel. With nothing
                // cached the dashboard gets an empty list and the reason.
                logger.LogWarning(ex, "Could not reach the NuGet search API.");
                warning = $"Could not reach nuget.org: {ex.Message}";
            }
        }

        var all = entry?.Packages ?? [];

        // Hidden packages are fetched like any other, so unhiding one never reveals
        // stale numbers - they are only filtered at the point of display.
        var hidden = new HashSet<string>(settings.Hidden, StringComparer.OrdinalIgnoreCase);

        var shown = all.Where(p => !hidden.Contains(p.Id))
                       .OrderByDescending(p => p.TotalDownloads)
                       .ThenBy(p => p.Id, StringComparer.OrdinalIgnoreCase)
                       .ToList();

        var hiddenRows = all.Where(p => hidden.Contains(p.Id))
                            .OrderBy(p => p.Id, StringComparer.OrdinalIgnoreCase)
                            .Select(p => Mark(p, isHidden: true))
                            .ToList();

        return new CatalogResponse
        {
            Packages = shown,
            Hidden = hiddenRows,
            Owners = settings.Owners,
            Added = settings.Added,
            RefreshedUtc = entry?.RefreshedUtc,
            Warning = warning,
        };
    }

    private async Task<List<PackageView>> FetchAsync(CatalogSettings settings, CancellationToken ct)
    {
        var byId = new Dictionary<string, PackageView>(StringComparer.OrdinalIgnoreCase);

        foreach (var owner in settings.Owners)
        {
            foreach (var pkg in await client.GetByOwnerAsync(owner, ct))
            {
                byId[pkg.Id] = Summarise(pkg);
            }
        }

        foreach (var id in settings.Added)
        {
            // An explicit add of something the owner search already returned should not
            // duplicate the row; it just marks the existing one.
            if (byId.TryGetValue(id, out var existing))
            {
                byId[id] = existing with { IsExplicit = true };
                continue;
            }

            var fetched = await client.GetByIdAsync(id, ct);
            if (fetched is not null)
            {
                byId[fetched.Id] = Summarise(fetched);
            }
            else
            {
                logger.LogInformation("Added package {PackageId} was not found on nuget.org.", id);
            }
        }

        return [.. byId.Values];
    }

    private PackageView Summarise(PackageView p) => p with
    {
        Summary = PackageSummary.Truncate(p.FullSummary, _options.SummaryLength),
    };

    private static PackageView Mark(PackageView p, bool isHidden) => p with { IsHidden = isHidden };
}

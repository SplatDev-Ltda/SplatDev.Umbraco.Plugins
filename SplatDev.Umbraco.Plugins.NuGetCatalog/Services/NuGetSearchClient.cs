using System.Net.Http.Json;

using Microsoft.Extensions.Logging;

using SplatDev.Umbraco.Plugins.NuGetCatalog.Models;

namespace SplatDev.Umbraco.Plugins.NuGetCatalog.Services;

public interface INuGetSearchClient
{
    Task<IReadOnlyList<PackageView>> GetByOwnerAsync(string owner, CancellationToken ct = default);
    Task<PackageView?> GetByIdAsync(string packageId, CancellationToken ct = default);
}

/// <summary>
/// Reads the public NuGet Search API. Knows the query shapes and the response contract,
/// and nothing about Umbraco.
/// </summary>
internal sealed class NuGetSearchClient(HttpClient http, ILogger<NuGetSearchClient> logger)
    : INuGetSearchClient
{
    // The search service is unauthenticated and returns everything the catalog needs in a
    // single response: id, latest version, total downloads and the description.
    private const string SearchBase = "https://azuresearch-usnc.nuget.org/query";

    // The API caps a page at 1000; owners here are in the low hundreds, so one page is
    // enough and paging would be dead code.
    private const int PageSize = 1000;

    public async Task<IReadOnlyList<PackageView>> GetByOwnerAsync(string owner, CancellationToken ct = default)
    {
        var url = $"{SearchBase}?q=owner:{Uri.EscapeDataString(owner)}&take={PageSize}&prerelease=true";
        var response = await http.GetFromJsonAsync<NuGetSearchResponse>(url, ct);

        if (response is null)
        {
            logger.LogWarning("NuGet search for owner {Owner} returned no body.", owner);
            return [];
        }

        return response.Data.Select(r => Map(r, isExplicit: false)).ToList();
    }

    public async Task<PackageView?> GetByIdAsync(string packageId, CancellationToken ct = default)
    {
        var url = $"{SearchBase}?q=packageid:{Uri.EscapeDataString(packageId)}&prerelease=true";
        var response = await http.GetFromJsonAsync<NuGetSearchResponse>(url, ct);

        // packageid: is an exact-match filter, but the API still answers with a list, and
        // an unknown id comes back as an empty one rather than a 404.
        var hit = response?.Data.FirstOrDefault(d =>
            string.Equals(d.Id, packageId, StringComparison.OrdinalIgnoreCase));

        return hit is null ? null : Map(hit, isExplicit: true);
    }

    private static PackageView Map(NuGetSearchResult r, bool isExplicit) => new()
    {
        Id = r.Id,
        Version = r.Version,
        TotalDownloads = r.TotalDownloads,
        FullSummary = PackageSummary.Choose(r.Summary, r.Description, r.Title),
        IconUrl = r.IconUrl,
        ProjectUrl = r.ProjectUrl,
        IsExplicit = isExplicit,
        IsDeprecated = r.Deprecation is not null,
        VulnerabilityCount = r.Vulnerabilities?.Count ?? 0,
    };
}

/// <summary>
/// Picking and shortening the one line of text shown per package.
/// </summary>
public static class PackageSummary
{
    /// <summary>
    /// Returns the first field with something in it.
    /// </summary>
    /// <remarks>
    /// A third of the packages in a real catalog have an empty or near-empty description,
    /// and truncating that gives a wall of blank rows. NuGet's own "summary" field is
    /// usually empty but is the more appropriate one when set, so it wins; title is a
    /// last resort because it is often just the id again.
    /// </remarks>
    public static string? Choose(string? summary, string? description, string? title)
    {
        foreach (var candidate in new[] { summary, description, title })
        {
            if (!string.IsNullOrWhiteSpace(candidate))
            {
                return candidate.Trim();
            }
        }

        return null;
    }

    /// <summary>
    /// Shortens to <paramref name="length"/> characters, appending an ellipsis when cut.
    /// </summary>
    /// <remarks>
    /// Breaks on the last whitespace inside the limit rather than mid-word, unless that
    /// would throw away most of the line - a long unbroken token (a URL, say) is better
    /// cut hard than reduced to two characters.
    /// </remarks>
    public static string Truncate(string? text, int length)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return "—";
        }

        // Collapse newlines so a multi-line description cannot break the row layout.
        var single = string.Join(' ', text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));

        if (single.Length <= length)
        {
            return single;
        }

        var cut = single[..length];
        var lastSpace = cut.LastIndexOf(' ');
        if (lastSpace > length / 2)
        {
            cut = cut[..lastSpace];
        }

        return cut.TrimEnd(' ', ',', '.', ';', ':', '-') + "…";
    }
}

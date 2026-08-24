namespace SplatDev.Umbraco.Plugins.Analytics.Models;

/// <summary>What the browser reports about itself, as the tracking script sends it.</summary>
public class BrowserInfo
{
    public string? AppVersion { get; set; }
    public string? Language { get; set; }
    public string? LanguageName { get; set; }
    public string? Platform { get; set; }
    public string? Os { get; set; }
    public string? UserAgent { get; set; }
    public string? Vendor { get; set; }
    public BrandVersion[] Versions { get; set; } = [];
}

/// <summary>One entry from the browser's brand list, e.g. Chromium 121.</summary>
public class BrandVersion
{
    public string? Brand { get; set; }
    public string? Version { get; set; }
}

/// <summary>Where an address resolves to, when a lookup is configured.</summary>
public class IpMapping
{
    public string IpAddress { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? CountryCode { get; set; }
    public string? Region { get; set; }
    public string? City { get; set; }
    public float Latitude { get; set; }
    public float Longitude { get; set; }
    public string? PostalCode { get; set; }
}

/// <summary>A count against one grouping value — an entry url, a browser, a country.</summary>
public class VisitFilter
{
    public string Filter { get; set; } = string.Empty;
    public int Count { get; set; }
}

/// <summary>A visit grouped for the dashboard's breakdown tables.</summary>
public class VisitStats
{
    public int NodeId { get; set; }
    public string? NodeName { get; set; }
    public string? EntryUrl { get; set; }
    public string? ExitUrl { get; set; }
    public string? IpAddress { get; set; }
    public string? Filter { get; set; }
    public int Count { get; set; }
    public IpMapping? Mapping { get; set; }
}

/// <summary>One page of results, with enough context for the caller to page through.</summary>
public class PagedResults<T> where T : class
{
    public IList<T> Results { get; set; } = [];
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int Found { get; set; }
    public string? Query { get; set; }
    public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(Found / (double)PageSize);
}

/// <summary>A count for one day, for the dashboard's chart.</summary>
public class DailyCount
{
    public DateOnly Date { get; set; }
    public int Count { get; set; }
}

/// <summary>
/// A visit as the API returns it.
/// </summary>
/// <remarks>
/// Projecting rather than returning the entity keeps the stored address out of the
/// response unless the caller is entitled to it, and keeps the wire shape stable if the
/// table changes.
/// </remarks>
public class AnalyticsVisitDto
{
    public int Id { get; set; }
    public int ContentNodeId { get; set; }
    public string? NodeName { get; set; }
    public string? VisitorId { get; set; }
    public string? IpAddress { get; set; }
    public string? Referrer { get; set; }
    public string? Browser { get; set; }
    public string? OperatingSystem { get; set; }
    public string? Device { get; set; }
    public string? EntryUrl { get; set; }
    public string? ExitUrl { get; set; }
    public string? Resolution { get; set; }
    public string? UserAgent { get; set; }
    public string? Country { get; set; }
    public string? CountryCode { get; set; }
    public string? City { get; set; }
    public DateTime VisitStarted { get; set; }
    public DateTime? VisitFinished { get; set; }
    public bool RecurringVisit { get; set; }
    public bool IsBot { get; set; }
    public BrowserInfo? BrowserDetails { get; set; }

    /// <summary>How long the visitor stayed, or null while the visit is still open.</summary>
    public string? VisitLength { get; set; }
}

/// <summary>Everything the dashboard's headline row needs, in one call.</summary>
public class AnalyticsSummary
{
    public int TotalVisits { get; set; }
    public int UniqueVisitors { get; set; }
    public int RecurringVisits { get; set; }
    public int RealTimeVisits { get; set; }
    public int BotVisits { get; set; }
    public DailyCount[] Daily { get; set; } = [];
}

/// <summary>What the tracking script posts when a page loads.</summary>
public class RecordVisitRequest
{
    public int NodeId { get; set; }
    public string? EntryUrl { get; set; }
    public string? Resolution { get; set; }
    public string? IpAddress { get; set; }
    public string? Referrer { get; set; }
    public BrowserInfo? Browser { get; set; }
}

/// <summary>What the tracking script posts as the visitor leaves.</summary>
public class RecordExitRequest
{
    public int VisitId { get; set; }
    public string? ExitUrl { get; set; }
}

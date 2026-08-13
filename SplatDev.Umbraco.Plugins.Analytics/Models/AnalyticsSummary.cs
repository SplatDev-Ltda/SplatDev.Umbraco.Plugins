namespace SplatDev.Umbraco.Plugins.Analytics.Models;

public sealed record AnalyticsSummary(
    long TotalVisits,
    long UniqueVisitors,
    IReadOnlyList<AnalyticsBucket> Browsers,
    IReadOnlyList<AnalyticsBucket> Countries,
    IReadOnlyList<AnalyticsBucket> Paths,
    IReadOnlyList<AnalyticsDay> Daily);

public sealed record AnalyticsBucket(string Name, long Count);
public sealed record AnalyticsDay(DateTime Date, long Count);

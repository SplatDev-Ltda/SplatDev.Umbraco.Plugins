using SplatDev.Umbraco.Plugins.Analytics.Models;

namespace SplatDev.Umbraco.Plugins.Analytics.Services;

/// <summary>
/// Reading and writing visits. Mirrors the operations the v8 plugin's repository exposed,
/// asynchronously and against EF.
/// </summary>
public interface IAnalyticsService
{
    Task<AnalyticsVisit> RecordVisitAsync(RecordVisitRequest request, string ipAddress, string? userAgent, bool isBot, CancellationToken ct = default);
    Task<bool> RecordExitAsync(RecordExitRequest request, CancellationToken ct = default);

    Task<bool> AlreadyVisitedAsync(int nodeId, string visitorId, CancellationToken ct = default);
    Task<AnalyticsVisit?> GetCurrentVisitAsync(int nodeId, string visitorId, CancellationToken ct = default);

    Task<int> GetTotalVisitsAsync(bool includeBots = false, CancellationToken ct = default);
    Task<int> GetUniqueVisitorsAsync(bool includeBots = false, CancellationToken ct = default);
    Task<int> GetRecurringVisitsAsync(bool includeBots = false, CancellationToken ct = default);
    Task<int> GetRealTimeVisitsAsync(CancellationToken ct = default);
    Task<int> GetBotVisitsAsync(CancellationToken ct = default);
    Task<int> GetVisitCountAsync(int nodeId, CancellationToken ct = default);

    Task<DailyCount> GetResultsByDateAsync(DateOnly date, CancellationToken ct = default);
    Task<DailyCount[]> GetResultsForDaysAsync(int days, CancellationToken ct = default);

    Task<VisitFilter[]> GetVisitsByEntryUrlAsync(int take = 20, CancellationToken ct = default);
    Task<VisitFilter[]> GetVisitsByExitUrlAsync(int take = 20, CancellationToken ct = default);
    Task<VisitFilter[]> GetResultsByAsync(string filter, int take = 20, CancellationToken ct = default);

    Task<AnalyticsVisitDto[]> GetVisitsByNodeIdAsync(int nodeId, int take = 100, CancellationToken ct = default);
    Task<PagedResults<AnalyticsVisitDto>> GetPagedResultsAsync(int page = 1, int pageSize = 20, string? ipAddress = null, bool includeBots = false, CancellationToken ct = default);

    Task<AnalyticsSummary> GetSummaryAsync(int days = 30, CancellationToken ct = default);

    /// <summary>Deletes visits older than the configured retention window. Returns the count removed.</summary>
    Task<int> PurgeExpiredAsync(CancellationToken ct = default);
}

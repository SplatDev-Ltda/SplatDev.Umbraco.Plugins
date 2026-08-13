using SplatDev.Umbraco.Plugins.Analytics.Models;

namespace SplatDev.Umbraco.Plugins.Analytics.Services;

public interface IAnalyticsService
{
    Task<AnalyticsSettings> GetSettingsAsync(CancellationToken cancellationToken = default);
    Task RecordVisitAsync(AnalyticsVisit visit, CancellationToken cancellationToken = default);
    Task<AnalyticsSummary> GetSummaryAsync(int days = 30, CancellationToken cancellationToken = default);
}

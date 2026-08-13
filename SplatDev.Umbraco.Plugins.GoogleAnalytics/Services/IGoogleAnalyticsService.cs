using SplatDev.Umbraco.Plugins.GoogleAnalytics.Models;

namespace SplatDev.Umbraco.Plugins.GoogleAnalytics.Services;

public interface IGoogleAnalyticsService
{
    Task<GoogleAnalyticsSettings> GetSettingsAsync();
    Task SaveSettingsAsync(GoogleAnalyticsSettings settings);
    Task<IEnumerable<object>> GetPageViewsAsync(string measurementId);
}

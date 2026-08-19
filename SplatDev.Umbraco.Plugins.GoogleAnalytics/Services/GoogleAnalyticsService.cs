using Microsoft.Extensions.Configuration;
using SplatDev.Umbraco.Plugins.GoogleAnalytics.Models;

namespace SplatDev.Umbraco.Plugins.GoogleAnalytics.Services;

public class GoogleAnalyticsService : IGoogleAnalyticsService
{
    private const string SectionKey = "UmbracoCms:GoogleAnalytics:MeasurementId";
    private const string EnabledKey = "UmbracoCms:GoogleAnalytics:Enabled";

    private readonly IConfiguration _configuration;

    public GoogleAnalyticsService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task<GoogleAnalyticsSettings> GetSettingsAsync()
    {
        var settings = new GoogleAnalyticsSettings
        {
            MeasurementId = _configuration[SectionKey] ?? string.Empty,
            Enabled = bool.TryParse(_configuration[EnabledKey], out var enabled) ? enabled : true
        };

        return Task.FromResult(settings);
    }

    public Task SaveSettingsAsync(GoogleAnalyticsSettings settings)
    {
        // In-process write via IConfigurationRoot (works for appsettings.json backed stores).
        if (_configuration is IConfigurationRoot root)
        {
            root[SectionKey] = settings.MeasurementId;
            root[EnabledKey] = settings.Enabled.ToString().ToLowerInvariant();
        }

        return Task.CompletedTask;
    }

    public Task<IEnumerable<object>> GetPageViewsAsync(string measurementId)
    {
        // Placeholder: a real implementation would call the GA Data API.
        // Returns an empty collection so that the endpoint compiles and responds gracefully.
        IEnumerable<object> result = Array.Empty<object>();
        return Task.FromResult(result);
    }
}

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Analytics.Configuration;

namespace SplatDev.Umbraco.Plugins.Analytics.Services;

/// <summary>
/// Deletes visits past the configured retention window.
/// </summary>
/// <remarks>
/// The v8 plugin kept every row forever. On a busy site that is both an unbounded table and
/// a growing pile of visitor addresses that nobody decided to keep. Retention is off by
/// default, so this changes nothing until a site sets <c>RetentionDays</c> — but it exists,
/// which is the difference between a site being able to answer "how long do you keep this?"
/// and not.
/// </remarks>
public class AnalyticsRetentionService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(12);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly AnalyticsOptions _options;
    private readonly ILogger<AnalyticsRetentionService> _logger;

    public AnalyticsRetentionService(
        IServiceScopeFactory scopeFactory,
        IOptions<AnalyticsOptions> options,
        ILogger<AnalyticsRetentionService> logger)
    {
        _scopeFactory = scopeFactory;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (_options.RetentionDays <= 0)
            return;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IAnalyticsService>();
                var removed = await service.PurgeExpiredAsync(stoppingToken);
                if (removed > 0)
                    _logger.LogInformation("Analytics: removed {Count} visit(s) older than {Days} days.", removed, _options.RetentionDays);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                // A failed sweep must not take the site down, and must not stop later sweeps.
                _logger.LogError(ex, "Analytics: retention sweep failed; it will run again later.");
            }

            try { await Task.Delay(Interval, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }
    }
}

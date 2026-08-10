using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.WhatsApp.Models;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Services;

/// <inheritdoc />
public class DashboardPresence : IDashboardPresence
{
    private readonly WhatsAppOptions _options;

    // Ticks rather than DateTime so reads and writes are atomic without a lock —
    // heartbeats come from the UI and reads come from the webhook thread.
    private long _lastSeenTicks;

    public DashboardPresence(IOptions<WhatsAppOptions> options)
    {
        _options = options.Value;
    }

    public DateTime? LastSeenUtc
    {
        get
        {
            var ticks = Interlocked.Read(ref _lastSeenTicks);
            return ticks == 0 ? null : new DateTime(ticks, DateTimeKind.Utc);
        }
    }

    public void Heartbeat() =>
        Interlocked.Exchange(ref _lastSeenTicks, DateTime.UtcNow.Ticks);

    public bool IsSomeoneWatching()
    {
        var lastSeen = LastSeenUtc;
        if (lastSeen is null)
        {
            return false;
        }

        return DateTime.UtcNow - lastSeen.Value <= TimeSpan.FromMinutes(_options.DashboardIdleMinutes);
    }
}

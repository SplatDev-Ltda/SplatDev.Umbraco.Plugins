namespace SplatDev.Umbraco.Plugins.WhatsApp.Services;

/// <summary>
/// Tracks whether a backoffice user currently has the WhatsApp inbox open.
/// </summary>
/// <remarks>
/// The dashboard pings a heartbeat endpoint while it is mounted; anything older than
/// the configured idle window counts as "nobody is watching", which is what triggers an
/// email notification for an inbound message.
///
/// Deliberately in-memory: this is a presence hint, not durable state. On a restart it
/// fails safe — presence is unknown, so the first inbound message emails someone rather
/// than being silently swallowed.
/// </remarks>
public interface IDashboardPresence
{
    /// <summary>Records that the dashboard is open right now.</summary>
    void Heartbeat();

    /// <summary>True when a heartbeat arrived within the idle window.</summary>
    bool IsSomeoneWatching();

    /// <summary>Last heartbeat, or null if none since startup.</summary>
    DateTime? LastSeenUtc { get; }
}

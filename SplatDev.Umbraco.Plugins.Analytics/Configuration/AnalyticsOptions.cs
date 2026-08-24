namespace SplatDev.Umbraco.Plugins.Analytics.Configuration;

/// <summary>
/// Settings, bound from the <c>SplatDev:Analytics</c> configuration section.
/// </summary>
public class AnalyticsOptions
{
    public const string SectionName = "SplatDev:Analytics";

    /// <summary>
    /// Where the visitor's address comes from.
    /// </summary>
    /// <remarks>
    /// <c>Client</c> keeps the v8 behaviour: the tracking script asks a public lookup
    /// service for the address and posts it. That means every visitor's browser contacts a
    /// third party, and the value is whatever the caller chose to send.
    /// <c>Server</c> reads it from the connection instead — no third-party request, and it
    /// cannot be spoofed by editing the payload. Behind a proxy, <c>Server</c> needs
    /// forwarded-headers configured in the host or every visit records the proxy's address.
    /// </remarks>
    public IpSource IpSource { get; set; } = IpSource.Client;

    /// <summary>
    /// What, if anything, of the visitor's address is kept alongside the hashed visitor id.
    /// </summary>
    /// <remarks>
    /// <c>None</c> is the default: the hashed <c>VisitorId</c> already carries what the
    /// dashboard needs — unique and returning-visitor counts — and a full address is
    /// personal data in most jurisdictions. Keep it only if something downstream needs it.
    /// </remarks>
    public IpStorage StoreIpAddress { get; set; } = IpStorage.None;

    /// <summary>
    /// Salt mixed into the visitor id hash. Generated per site on first run if unset.
    /// </summary>
    /// <remarks>
    /// Without a salt the hash is reversible in practice: an address range is small enough
    /// to hash exhaustively and compare. Changing it makes every existing visitor look new,
    /// so it is written once and left alone.
    /// </remarks>
    public string? VisitorIdSalt { get; set; }

    /// <summary>How visits are recorded.</summary>
    public RecordingMode RecordingMode { get; set; } = RecordingMode.Both;

    /// <summary>
    /// Path to an IP2Location BIN file. Unset, no geo lookup happens and the country and
    /// city columns stay empty — the plugin does not require the data file to work.
    /// </summary>
    public string? Ip2LocationBinPath { get; set; }

    /// <summary>Record requests that look automated, flagged so the dashboard can exclude them.</summary>
    public bool RecordBots { get; set; } = true;

    /// <summary>Skip requests from signed-in backoffice users, so editing does not inflate the numbers.</summary>
    public bool IgnoreBackofficeUsers { get; set; } = true;

    /// <summary>
    /// Delete visits older than this many days. Zero keeps everything forever, which is
    /// what the v8 plugin did — worth setting on any site that has to answer for how long
    /// it keeps visitor data.
    /// </summary>
    public int RetentionDays { get; set; }

    /// <summary>How long after the last activity a visit still counts as real-time.</summary>
    public int RealTimeWindowMinutes { get; set; } = 5;
}

/// <summary>What is kept of the visitor's address.</summary>
public enum IpStorage
{
    /// <summary>Nothing. The hashed visitor id is all that is stored.</summary>
    None,

    /// <summary>The network part only — the host bits are zeroed.</summary>
    Anonymised,

    /// <summary>The whole address, as the Umbraco 7/8 plugin did.</summary>
    Full,
}

/// <summary>How visits reach the database.</summary>
public enum RecordingMode
{
    /// <summary>
    /// Server-side, on every HTML page request. Needs no template change and cannot be
    /// blocked by an ad blocker, but sees nothing the browser knows — no screen size, and
    /// no exit url.
    /// </summary>
    Middleware,

    /// <summary>
    /// The tracking component, which reports screen size and closes the visit with an exit
    /// url when the visitor leaves. Requires the component in your templates.
    /// </summary>
    Beacon,

    /// <summary>
    /// Middleware records the visit; the beacon fills in what only the browser knows. The
    /// beacon matches its own visit rather than creating a second one.
    /// </summary>
    Both,
}

/// <summary>Where the visitor's address is taken from.</summary>
public enum IpSource
{
    /// <summary>Reported by the tracking script, via a public lookup service.</summary>
    Client,

    /// <summary>Read from the request's connection.</summary>
    Server,
}

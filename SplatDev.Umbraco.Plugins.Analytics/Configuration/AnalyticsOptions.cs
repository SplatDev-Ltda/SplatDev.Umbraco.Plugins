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
    /// Store the address whole. Off, the last octet of IPv4 (or the last 80 bits of IPv6)
    /// is zeroed before saving, which still distinguishes visitors well enough for
    /// recurring-visit counts while keeping the stored value out of scope as an identifier.
    /// </summary>
    public bool StoreFullIpAddress { get; set; } = true;

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

/// <summary>Where the visitor's address is taken from.</summary>
public enum IpSource
{
    /// <summary>Reported by the tracking script, via a public lookup service.</summary>
    Client,

    /// <summary>Read from the request's connection.</summary>
    Server,
}

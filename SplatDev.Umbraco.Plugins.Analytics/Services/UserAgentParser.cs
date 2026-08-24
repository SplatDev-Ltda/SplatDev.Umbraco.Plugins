using System.Text.RegularExpressions;

namespace SplatDev.Umbraco.Plugins.Analytics.Services;

/// <summary>
/// Pulls a browser, operating system and device class out of a user agent string.
/// </summary>
/// <remarks>
/// Deliberately small and dependency-free. A full user-agent database is a large, rapidly
/// stale dependency, and the dashboard only needs the shape of the traffic — which browser
/// families and whether people arrive on a phone. Order matters: Edge and Opera both claim
/// to be Chrome, and Chrome claims to be Safari.
/// </remarks>
public static partial class UserAgentParser
{
    [GeneratedRegex(@"(Edg|EdgA|OPR|Opera|SamsungBrowser|Firefox|Chrome|CriOS|Safari|MSIE|Trident)", RegexOptions.IgnoreCase)]
    private static partial Regex BrowserPattern();

    public static string? Browser(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent)) return null;
        var ua = userAgent;

        // Checked most-specific first: everything below Chrome also contains "Chrome",
        // and Chrome itself contains "Safari".
        if (ua.Contains("Edg", StringComparison.OrdinalIgnoreCase)) return "Edge";
        if (ua.Contains("OPR", StringComparison.OrdinalIgnoreCase) || ua.Contains("Opera", StringComparison.OrdinalIgnoreCase)) return "Opera";
        if (ua.Contains("SamsungBrowser", StringComparison.OrdinalIgnoreCase)) return "Samsung Internet";
        if (ua.Contains("Firefox", StringComparison.OrdinalIgnoreCase)) return "Firefox";
        if (ua.Contains("CriOS", StringComparison.OrdinalIgnoreCase) || ua.Contains("Chrome", StringComparison.OrdinalIgnoreCase)) return "Chrome";
        if (ua.Contains("Safari", StringComparison.OrdinalIgnoreCase)) return "Safari";
        if (ua.Contains("MSIE", StringComparison.OrdinalIgnoreCase) || ua.Contains("Trident", StringComparison.OrdinalIgnoreCase)) return "Internet Explorer";
        return null;
    }

    public static string? OperatingSystem(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent)) return null;
        var ua = userAgent;

        // Android before Linux: every Android agent also says Linux.
        if (ua.Contains("Android", StringComparison.OrdinalIgnoreCase)) return "Android";
        if (ua.Contains("iPhone", StringComparison.OrdinalIgnoreCase) || ua.Contains("iPad", StringComparison.OrdinalIgnoreCase) || ua.Contains("iPod", StringComparison.OrdinalIgnoreCase)) return "iOS";
        if (ua.Contains("Windows", StringComparison.OrdinalIgnoreCase)) return "Windows";
        if (ua.Contains("Mac OS X", StringComparison.OrdinalIgnoreCase) || ua.Contains("Macintosh", StringComparison.OrdinalIgnoreCase)) return "macOS";
        if (ua.Contains("CrOS", StringComparison.OrdinalIgnoreCase)) return "ChromeOS";
        if (ua.Contains("Linux", StringComparison.OrdinalIgnoreCase)) return "Linux";
        return null;
    }

    public static string? Device(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent)) return null;
        var ua = userAgent;

        // iPad reports "Macintosh" on recent iPadOS, so the tablet check comes first.
        if (ua.Contains("iPad", StringComparison.OrdinalIgnoreCase) || ua.Contains("Tablet", StringComparison.OrdinalIgnoreCase)) return "Tablet";
        if (ua.Contains("Mobi", StringComparison.OrdinalIgnoreCase) || ua.Contains("iPhone", StringComparison.OrdinalIgnoreCase) || ua.Contains("Android", StringComparison.OrdinalIgnoreCase)) return "Mobile";
        return "Desktop";
    }
}

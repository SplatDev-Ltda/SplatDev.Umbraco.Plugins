using System.Text.RegularExpressions;

namespace SplatDev.Umbraco.Plugins.Analytics.Services;

/// <summary>
/// Recognises automated traffic from the user agent.
/// </summary>
/// <remarks>
/// The v8 plugin counted every request equally, so a site's totals were mostly crawlers and
/// the numbers meant very little. Matching on the agent string is not exhaustive — nothing
/// is — but it removes the traffic that announces itself, which is most of it. Flagged
/// rather than discarded, so the dashboard can show what was excluded.
/// </remarks>
public static partial class BotDetector
{
    [GeneratedRegex(
        @"bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|slack|discord|" +
        @"headless|phantomjs|puppeteer|playwright|selenium|curl|wget|python-requests|libwww|" +
        @"httpclient|okhttp|axios|go-http-client|java/|scrapy|semrush|ahrefs|mj12|dotbot|petalbot|" +
        @"uptime|pingdom|monitor|lighthouse|gtmetrix|pagespeed",
        RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)]
    private static partial Regex BotPattern();

    public static bool IsBot(string? userAgent) =>
        // An agent that sends nothing is not a browser a person is looking at.
        string.IsNullOrWhiteSpace(userAgent) || BotPattern().IsMatch(userAgent);
}

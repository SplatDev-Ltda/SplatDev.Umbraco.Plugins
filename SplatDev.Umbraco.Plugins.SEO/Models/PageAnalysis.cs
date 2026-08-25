namespace SplatDev.Umbraco.Plugins.SEO.Models;

/// <summary>
/// One page's SEO verdict, shaped to match what the dashboard renders.
/// </summary>
/// <remarks>
/// The string values of <see cref="Score"/> and <see cref="MetaDescriptionStatus"/> are part
/// of the contract with seo-dashboard.element.ts, which switches on them directly. Changing
/// one means changing the element too.
/// </remarks>
public sealed class PageAnalysis
{
    public string Title { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    /// <summary>"good", "warning" or "poor".</summary>
    public string Score { get; set; } = SeoScore.Good;

    /// <summary>"present", "missing" or "too-long".</summary>
    public string MetaDescriptionStatus { get; set; } = MetaStatus.Present;

    /// <summary>Everything that counted against this page, in the order it was checked.</summary>
    public List<string> Issues { get; set; } = [];
}

public static class SeoScore
{
    public const string Good = "good";
    public const string Warning = "warning";
    public const string Poor = "poor";
}

public static class MetaStatus
{
    public const string Present = "present";
    public const string Missing = "missing";
    public const string TooLong = "too-long";
}

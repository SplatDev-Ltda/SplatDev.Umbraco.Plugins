namespace SplatDev.Umbraco.Plugins.SEO.Services;

using SplatDev.Umbraco.Plugins.SEO.Models;

/// <summary>
/// Scores a page's metadata against the limits search engines actually apply.
/// </summary>
/// <remarks>
/// Deliberately free of Umbraco types so it can be unit tested without a content tree.
/// The controller does the walking; this decides the verdict.
/// </remarks>
public sealed class SeoAnalyzer
{
    /// <summary>Google truncates titles around 60 characters.</summary>
    public const int TitleMax = 60;

    /// <summary>Below this a title carries too little to rank on.</summary>
    public const int TitleMin = 10;

    /// <summary>Descriptions are cut off past roughly 160 characters.</summary>
    public const int DescriptionMax = 160;

    /// <summary>Shorter than this and the snippet reads as an accident.</summary>
    public const int DescriptionMin = 50;

    public PageAnalysis Analyse(string name, string url, SEO seo)
    {
        ArgumentNullException.ThrowIfNull(seo);

        var result = new PageAnalysis
        {
            Title = string.IsNullOrWhiteSpace(seo.Title) ? name : seo.Title,
            Url = url,
        };

        var title = seo.Title?.Trim() ?? string.Empty;
        if (title.Length == 0)
        {
            result.Issues.Add("No meta title — the page will be listed under whatever the engine picks.");
        }
        else if (title.Length > TitleMax)
        {
            result.Issues.Add($"Meta title is {title.Length} characters; it will be truncated past {TitleMax}.");
        }
        else if (title.Length < TitleMin)
        {
            result.Issues.Add($"Meta title is only {title.Length} characters.");
        }

        var description = seo.Description?.Trim() ?? string.Empty;
        if (description.Length == 0)
        {
            result.MetaDescriptionStatus = MetaStatus.Missing;
            result.Issues.Add("No meta description.");
        }
        else if (description.Length > DescriptionMax)
        {
            result.MetaDescriptionStatus = MetaStatus.TooLong;
            result.Issues.Add($"Meta description is {description.Length} characters; it will be truncated past {DescriptionMax}.");
        }
        else
        {
            result.MetaDescriptionStatus = MetaStatus.Present;
            if (description.Length < DescriptionMin)
            {
                result.Issues.Add($"Meta description is only {description.Length} characters.");
            }
        }

        if (string.IsNullOrWhiteSpace(seo.Canonical))
        {
            result.Issues.Add("No canonical URL — duplicate paths to this page compete with each other.");
        }

        if ((seo.Robots ?? string.Empty).Contains("noindex", StringComparison.OrdinalIgnoreCase))
        {
            result.Issues.Add("Robots is set to noindex, so this page is excluded from search entirely.");
        }

        result.Score = Score(result);
        return result;
    }

    /// <summary>
    /// A missing title or description is the difference between a poor page and a
    /// merely imperfect one, so those two decide "poor" on their own.
    /// </summary>
    private static string Score(PageAnalysis a)
    {
        if (a.MetaDescriptionStatus == MetaStatus.Missing) return SeoScore.Poor;
        if (a.Issues.Any(i => i.StartsWith("No meta title", StringComparison.Ordinal))) return SeoScore.Poor;
        if (a.Issues.Any(i => i.StartsWith("Robots is set to noindex", StringComparison.Ordinal))) return SeoScore.Poor;
        return a.Issues.Count == 0 ? SeoScore.Good : SeoScore.Warning;
    }
}

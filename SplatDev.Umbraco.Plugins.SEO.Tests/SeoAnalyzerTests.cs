using SplatDev.Umbraco.Plugins.SEO.Models;
using SplatDev.Umbraco.Plugins.SEO.Services;
using Xunit;
using SeoModel = SplatDev.Umbraco.Plugins.SEO.Models.SEO;

namespace SplatDev.Umbraco.Plugins.SEO.Tests;

public class SeoAnalyzerTests
{
    private readonly SeoAnalyzer _analyzer = new();

    private static SeoModel Complete() => new()
    {
        Title = "A perfectly reasonable page title",
        Description = "A meta description comfortably inside the limit search engines apply, "
                    + "long enough to read as deliberate rather than accidental.",
        Canonical = "https://example.com/page",
        Robots = "index,follow",
    };

    [Fact]
    public void A_complete_page_scores_good_with_no_issues()
    {
        var result = _analyzer.Analyse("Page", "/page", Complete());

        Assert.Equal(SeoScore.Good, result.Score);
        Assert.Equal(MetaStatus.Present, result.MetaDescriptionStatus);
        Assert.Empty(result.Issues);
    }

    [Fact]
    public void A_missing_description_is_poor_not_merely_a_warning()
    {
        var seo = Complete();
        seo.Description = string.Empty;

        var result = _analyzer.Analyse("Page", "/page", seo);

        Assert.Equal(SeoScore.Poor, result.Score);
        Assert.Equal(MetaStatus.Missing, result.MetaDescriptionStatus);
    }

    [Fact]
    public void A_missing_title_is_poor()
    {
        var seo = Complete();
        seo.Title = "   ";

        Assert.Equal(SeoScore.Poor, _analyzer.Analyse("Page", "/page", seo).Score);
    }

    [Fact]
    public void Noindex_is_poor_however_good_the_rest_is()
    {
        var seo = Complete();
        seo.Robots = "noindex, follow";

        var result = _analyzer.Analyse("Page", "/page", seo);

        Assert.Equal(SeoScore.Poor, result.Score);
        Assert.Contains(result.Issues, i => i.Contains("noindex", StringComparison.OrdinalIgnoreCase));
    }

    [Theory]
    [InlineData(SeoAnalyzer.DescriptionMax + 1, MetaStatus.TooLong, SeoScore.Warning)]
    [InlineData(SeoAnalyzer.DescriptionMax, MetaStatus.Present, SeoScore.Good)]
    public void Description_length_decides_status_at_the_boundary(int length, string status, string score)
    {
        var seo = Complete();
        seo.Description = new string('x', length);

        var result = _analyzer.Analyse("Page", "/page", seo);

        Assert.Equal(status, result.MetaDescriptionStatus);
        Assert.Equal(score, result.Score);
    }

    [Fact]
    public void A_title_past_the_limit_warns_but_does_not_condemn_the_page()
    {
        var seo = Complete();
        seo.Title = new string('x', SeoAnalyzer.TitleMax + 1);

        var result = _analyzer.Analyse("Page", "/page", seo);

        Assert.Equal(SeoScore.Warning, result.Score);
        Assert.Contains(result.Issues, i => i.Contains("truncated", StringComparison.Ordinal));
    }

    [Fact]
    public void A_missing_canonical_is_reported()
    {
        var seo = Complete();
        seo.Canonical = string.Empty;

        var result = _analyzer.Analyse("Page", "/page", seo);

        Assert.Equal(SeoScore.Warning, result.Score);
        Assert.Contains(result.Issues, i => i.Contains("canonical", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void The_page_name_stands_in_when_there_is_no_meta_title()
    {
        var seo = Complete();
        seo.Title = string.Empty;

        Assert.Equal("Contact Us", _analyzer.Analyse("Contact Us", "/contact", seo).Title);
    }
}

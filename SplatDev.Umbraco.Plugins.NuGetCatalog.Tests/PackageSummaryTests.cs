using SplatDev.Umbraco.Plugins.NuGetCatalog.Services;

using Xunit;

namespace SplatDev.Umbraco.Plugins.NuGetCatalog.Tests;

public class PackageSummaryChoiceTests
{
    [Fact]
    public void Prefers_summary_when_set()
        => Assert.Equal("short one", PackageSummary.Choose("short one", "the description", "Title"));

    [Fact]
    public void Falls_back_to_description()
        => Assert.Equal("the description", PackageSummary.Choose(null, "the description", "Title"));

    [Fact]
    public void Falls_back_to_title_last()
        => Assert.Equal("Title", PackageSummary.Choose(null, "   ", "Title"));

    [Fact]
    public void Returns_null_when_a_package_describes_itself_nowhere()
        => Assert.Null(PackageSummary.Choose(null, null, null));

    [Fact]
    public void Treats_whitespace_only_as_empty()
        => Assert.Equal("the description", PackageSummary.Choose("   ", "the description", null));
}

public class PackageSummaryTruncationTests
{
    private const int Length = 50;

    [Fact]
    public void Leaves_short_text_alone()
    {
        var text = "Short and sweet.";
        Assert.Equal(text, PackageSummary.Truncate(text, Length));
    }

    [Fact]
    public void Leaves_text_of_exactly_the_limit_alone()
    {
        var text = new string('a', Length);
        var result = PackageSummary.Truncate(text, Length);

        Assert.Equal(text, result);
        Assert.DoesNotContain("…", result);
    }

    [Fact]
    public void Adds_an_ellipsis_when_it_cuts()
    {
        var result = PackageSummary.Truncate(new string('a', Length + 20), Length);

        Assert.EndsWith("…", result);
        Assert.True(result.Length <= Length + 1, $"expected at most {Length + 1} chars, got {result.Length}");
    }

    [Fact]
    public void Breaks_on_a_word_boundary_rather_than_mid_word()
    {
        var text = "WhatsApp Business Cloud API integration for Umbraco backoffice";
        var result = PackageSummary.Truncate(text, Length);

        // The cut lands inside "backoffice"; it should stop at the previous space.
        Assert.EndsWith("…", result);
        Assert.DoesNotContain("backo", result);
        Assert.StartsWith("WhatsApp Business Cloud API integration for", result);
    }

    [Fact]
    public void Cuts_hard_when_one_token_would_leave_almost_nothing()
    {
        // A single long token has no usable space to break on; cutting at the last space
        // would throw away most of the line, so it is cut at the limit instead.
        var text = "https://example.com/an/extremely/long/url/that/never/breaks/anywhere";
        var result = PackageSummary.Truncate(text, Length);

        Assert.EndsWith("…", result);
        Assert.True(result.Length > Length / 2);
    }

    [Fact]
    public void Collapses_newlines_so_a_row_cannot_break_the_layout()
    {
        var result = PackageSummary.Truncate("first line\nsecond line\r\nthird", Length);

        Assert.DoesNotContain("\n", result);
        Assert.DoesNotContain("\r", result);
        Assert.Equal("first line second line third", result);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Renders_a_dash_when_there_is_nothing_to_show(string? text)
        => Assert.Equal("—", PackageSummary.Truncate(text, Length));

    [Fact]
    public void Does_not_leave_dangling_punctuation_before_the_ellipsis()
    {
        var result = PackageSummary.Truncate(
            "Manage the Umbraco content cache, and monitor cache warm-up activity", Length);

        Assert.DoesNotContain(",…", result);
        Assert.DoesNotContain(" …", result);
    }
}

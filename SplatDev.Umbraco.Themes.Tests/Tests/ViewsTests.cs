namespace SplatDev.Umbraco.Themes.Tests.Tests;

/// <summary>
/// Verifies that each theme's Views/ directory contains the expected Razor (.cshtml) files.
/// Paths are resolved relative to the test assembly output directory by navigating up to the
/// repository root and then into each theme project folder.
/// </summary>
public class ViewsTests
{
    // ── Path helpers ─────────────────────────────────────────────────────────

    /// <summary>
    /// Returns the absolute path to the Views/ directory for a given theme project,
    /// resolved from the test assembly location (four levels up from bin/Debug/net8.0/).
    /// </summary>
    private static string GetThemeViewsDir(string themeName)
    {
        var assemblyDir = Path.GetDirectoryName(
            typeof(ViewsTests).Assembly.Location)!;

        // Navigate: bin/Debug/net8.0 -> Tests root -> Umbraco Projects/
        var repoRoot = Path.GetFullPath(Path.Combine(assemblyDir, "..", "..", "..", ".."));
        return Path.Combine(repoRoot, $"SplatDev.Umbraco.Themes.{themeName}", "Views");
    }

    // ── Base theme views ──────────────────────────────────────────────────────

    [Fact]
    public void BaseTheme_ViewsDirectory_Exists()
    {
        var viewsDir = GetThemeViewsDir("Base");
        Directory.Exists(viewsDir).Should().BeTrue(
            because: $"Views directory should exist at '{viewsDir}'");
    }

    [Fact]
    public void BaseTheme_ViewsDirectory_HasAtLeastOneRazorView()
    {
        var viewsDir = GetThemeViewsDir("Base");
        var cshtml = Directory.GetFiles(viewsDir, "*.cshtml", SearchOption.AllDirectories);
        cshtml.Should().NotBeEmpty(because: "Base theme must contain at least one .cshtml view");
    }

    [Fact]
    public void BaseTheme_Views_HasHomeView()
    {
        var viewsDir = GetThemeViewsDir("Base");
        File.Exists(Path.Combine(viewsDir, "Home.cshtml"))
            .Should().BeTrue(because: "Base theme requires a Home.cshtml view");
    }

    [Fact]
    public void BaseTheme_Views_HasStandardPageView()
    {
        var viewsDir = GetThemeViewsDir("Base");
        File.Exists(Path.Combine(viewsDir, "StandardPage.cshtml"))
            .Should().BeTrue(because: "Base theme requires a StandardPage.cshtml view");
    }

    [Fact]
    public void BaseTheme_Views_HasLayoutInShared()
    {
        var viewsDir = GetThemeViewsDir("Base");
        File.Exists(Path.Combine(viewsDir, "Shared", "_Layout.cshtml"))
            .Should().BeTrue(because: "Base theme requires a Shared/_Layout.cshtml layout file");
    }

    [Fact]
    public void BaseTheme_Views_HasViewImports()
    {
        var viewsDir = GetThemeViewsDir("Base");
        File.Exists(Path.Combine(viewsDir, "_ViewImports.cshtml"))
            .Should().BeTrue(because: "Base theme requires a _ViewImports.cshtml file");
    }

    [Fact]
    public void BaseTheme_Views_HasNavigationPartial()
    {
        var viewsDir = GetThemeViewsDir("Base");
        File.Exists(Path.Combine(viewsDir, "Shared", "_Navigation.cshtml"))
            .Should().BeTrue(because: "Base theme requires a _Navigation.cshtml partial");
    }

    [Fact]
    public void BaseTheme_Views_HasFooterPartial()
    {
        var viewsDir = GetThemeViewsDir("Base");
        File.Exists(Path.Combine(viewsDir, "Shared", "_Footer.cshtml"))
            .Should().BeTrue(because: "Base theme requires a _Footer.cshtml partial");
    }

    // ── Layout reference checks ───────────────────────────────────────────────

    [Fact]
    public void BaseTheme_Layout_ContainsRenderBody()
    {
        var layoutPath = Path.Combine(GetThemeViewsDir("Base"), "Shared", "_Layout.cshtml");
        var content = File.ReadAllText(layoutPath);
        content.Should().Contain("@RenderBody()",
            because: "_Layout.cshtml must call @RenderBody() to render page content");
    }

    [Fact]
    public void BaseTheme_Layout_ContainsHtmlBoilerplate()
    {
        var layoutPath = Path.Combine(GetThemeViewsDir("Base"), "Shared", "_Layout.cshtml");
        var content = File.ReadAllText(layoutPath);
        content.Should().Contain("<!DOCTYPE html>",
            because: "the layout must include an HTML5 doctype declaration");
        content.Should().Contain("<html",
            because: "the layout must include an <html> element");
    }

    [Fact]
    public void BaseTheme_HomeView_ReferencesLayout()
    {
        var viewPath = Path.Combine(GetThemeViewsDir("Base"), "Home.cshtml");
        var content = File.ReadAllText(viewPath);
        content.Should().Contain("Layout",
            because: "Home.cshtml should set a Layout");
    }

    // ── Blog theme views ──────────────────────────────────────────────────────

    [Fact]
    public void BlogTheme_ViewsDirectory_Exists()
    {
        var viewsDir = GetThemeViewsDir("Blog");
        Directory.Exists(viewsDir).Should().BeTrue(
            because: $"Blog Views directory should exist at '{viewsDir}'");
    }

    [Fact]
    public void BlogTheme_Views_HasBlogPostView()
    {
        var viewsDir = GetThemeViewsDir("Blog");
        File.Exists(Path.Combine(viewsDir, "BlogPost.cshtml"))
            .Should().BeTrue(because: "Blog theme requires a BlogPost.cshtml view");
    }

    [Fact]
    public void BlogTheme_Views_HasBlogListingView()
    {
        var viewsDir = GetThemeViewsDir("Blog");
        File.Exists(Path.Combine(viewsDir, "BlogListing.cshtml"))
            .Should().BeTrue(because: "Blog theme requires a BlogListing.cshtml view");
    }

    [Fact]
    public void BlogTheme_Views_HasBlogCategoryView()
    {
        var viewsDir = GetThemeViewsDir("Blog");
        File.Exists(Path.Combine(viewsDir, "BlogCategory.cshtml"))
            .Should().BeTrue(because: "Blog theme requires a BlogCategory.cshtml view");
    }

    [Fact]
    public void BlogTheme_Views_HasBlogTagView()
    {
        var viewsDir = GetThemeViewsDir("Blog");
        File.Exists(Path.Combine(viewsDir, "BlogTag.cshtml"))
            .Should().BeTrue(because: "Blog theme requires a BlogTag.cshtml view");
    }

    [Fact]
    public void BlogTheme_BlogPostView_ReferencesLayout()
    {
        var viewPath = Path.Combine(GetThemeViewsDir("Blog"), "BlogPost.cshtml");
        var content = File.ReadAllText(viewPath);
        content.Should().Contain("Layout",
            because: "BlogPost.cshtml should set a Layout");
    }

    // ── Commerce theme views ──────────────────────────────────────────────────

    [Fact]
    public void CommerceTheme_ViewsDirectory_Exists()
    {
        var viewsDir = GetThemeViewsDir("Commerce");
        Directory.Exists(viewsDir).Should().BeTrue();
    }

    [Fact]
    public void CommerceTheme_Views_HasShopListingView()
    {
        var viewsDir = GetThemeViewsDir("Commerce");
        File.Exists(Path.Combine(viewsDir, "ShopListing.cshtml"))
            .Should().BeTrue(because: "Commerce theme requires a ShopListing.cshtml view");
    }

    // ── Conference theme views ────────────────────────────────────────────────

    [Fact]
    public void ConferenceTheme_ViewsDirectory_Exists()
    {
        var viewsDir = GetThemeViewsDir("Conference");
        Directory.Exists(viewsDir).Should().BeTrue();
    }

    [Fact]
    public void ConferenceTheme_Views_HasConferenceHomeView()
    {
        var viewsDir = GetThemeViewsDir("Conference");
        File.Exists(Path.Combine(viewsDir, "ConferenceHome.cshtml"))
            .Should().BeTrue(because: "Conference theme requires a ConferenceHome.cshtml view");
    }

    // ── Forum theme views ─────────────────────────────────────────────────────

    [Fact]
    public void ForumTheme_ViewsDirectory_Exists()
    {
        var viewsDir = GetThemeViewsDir("Forum");
        Directory.Exists(viewsDir).Should().BeTrue();
    }

    [Fact]
    public void ForumTheme_Views_HasForumRootView()
    {
        var viewsDir = GetThemeViewsDir("Forum");
        File.Exists(Path.Combine(viewsDir, "ForumRoot.cshtml"))
            .Should().BeTrue(because: "Forum theme requires a ForumRoot.cshtml view");
    }

    [Fact]
    public void ForumTheme_Views_HasForumThreadView()
    {
        var viewsDir = GetThemeViewsDir("Forum");
        File.Exists(Path.Combine(viewsDir, "ForumThread.cshtml"))
            .Should().BeTrue(because: "Forum theme requires a ForumThread.cshtml view");
    }

    // ── Landing theme views ───────────────────────────────────────────────────

    [Fact]
    public void LandingTheme_ViewsDirectory_Exists()
    {
        var viewsDir = GetThemeViewsDir("Landing");
        Directory.Exists(viewsDir).Should().BeTrue();
    }

    [Fact]
    public void LandingTheme_Views_HasLandingPageView()
    {
        var viewsDir = GetThemeViewsDir("Landing");
        File.Exists(Path.Combine(viewsDir, "LandingPage.cshtml"))
            .Should().BeTrue(because: "Landing theme requires a LandingPage.cshtml view");
    }

    // ── Corporate / Hotel / Portfolio theme views ─────────────────────────────
    // These themes are in active development; the tests assert the directories
    // exist and will fail gracefully until the views are added.

    [Fact]
    [Trait("Category", "InDevelopment")]
    public void CorporateTheme_ViewsDirectory_Exists()
    {
        var viewsDir = GetThemeViewsDir("Corporate");
        Directory.Exists(viewsDir).Should().BeTrue(
            because: $"Corporate Views directory should exist at '{viewsDir}'");
    }

    [Fact]
    [Trait("Category", "InDevelopment")]
    public void HotelTheme_ViewsDirectory_Exists()
    {
        var viewsDir = GetThemeViewsDir("Hotel");
        Directory.Exists(viewsDir).Should().BeTrue(
            because: $"Hotel Views directory should exist at '{viewsDir}'");
    }

    [Fact]
    [Trait("Category", "InDevelopment")]
    public void PortfolioTheme_ViewsDirectory_Exists()
    {
        var viewsDir = GetThemeViewsDir("Portfolio");
        Directory.Exists(viewsDir).Should().BeTrue(
            because: $"Portfolio Views directory should exist at '{viewsDir}'");
    }

    [Theory]
    [Trait("Category", "InDevelopment")]
    [InlineData("Corporate",  "CorporatePage.cshtml")]
    [InlineData("Hotel",      "HotelHome.cshtml")]
    [InlineData("Portfolio",  "PortfolioHome.cshtml")]
    public void InDevelopmentThemes_Views_HaveExpectedHomeView(string themeName, string expectedView)
    {
        var viewsDir = GetThemeViewsDir(themeName);
        File.Exists(Path.Combine(viewsDir, expectedView))
            .Should().BeTrue(
                because: $"{themeName} theme requires a {expectedView} view once implemented");
    }

    // ── Parameterised: all themes with views must have at least one .cshtml ───

    [Theory]
    [InlineData("Base")]
    [InlineData("Blog")]
    [InlineData("Commerce")]
    [InlineData("Conference")]
    [InlineData("Forum")]
    [InlineData("Landing")]
    public void FullyImplementedThemes_Views_ContainAtLeastOneRazorFile(string themeName)
    {
        var viewsDir = GetThemeViewsDir(themeName);

        Directory.Exists(viewsDir).Should().BeTrue(
            because: $"'{themeName}' Views/ directory should exist");

        var files = Directory.GetFiles(viewsDir, "*.cshtml", SearchOption.AllDirectories);
        files.Should().NotBeEmpty(
            because: $"'{themeName}' must have at least one .cshtml Razor view");
    }
}

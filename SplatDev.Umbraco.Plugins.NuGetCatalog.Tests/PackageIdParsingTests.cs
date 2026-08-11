using SplatDev.Umbraco.Plugins.NuGetCatalog.Services;

using Xunit;

namespace SplatDev.Umbraco.Plugins.NuGetCatalog.Tests;

/// <summary>
/// Whatever someone pastes has to reduce to a single canonical package id, otherwise the
/// same package gets added several times under different URL forms.
/// </summary>
public class PackageIdParsingTests
{
    [Theory]
    [InlineData("Umbraco.Cms", "Umbraco.Cms")]
    [InlineData("  Umbraco.Cms  ", "Umbraco.Cms")]
    [InlineData("https://www.nuget.org/packages/Umbraco.Cms", "Umbraco.Cms")]
    [InlineData("https://www.nuget.org/packages/Umbraco.Cms/", "Umbraco.Cms")]
    [InlineData("https://www.nuget.org/packages/Umbraco.Cms/17.3.4", "Umbraco.Cms")]
    [InlineData("https://www.nuget.org/packages/Umbraco.Cms/17.3.4/", "Umbraco.Cms")]
    [InlineData("http://nuget.org/packages/Newtonsoft.Json", "Newtonsoft.Json")]
    [InlineData("https://www.nuget.org/packages/Umbraco.Cms?foo=bar", "Umbraco.Cms")]
    [InlineData("SplatDev.Umbraco.Plugins.WhatsApp", "SplatDev.Umbraco.Plugins.WhatsApp")]
    [InlineData("some-package_name", "some-package_name")]
    public void Reduces_to_the_package_id(string input, string expected)
        => Assert.Equal(expected, PackageIdParser.ParsePackageId(input));

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not a package id")]
    [InlineData("https://www.nuget.org/profiles/splatdev")]   // a profile, not a package
    [InlineData("https://example.com/Umbraco.Cms")]           // no /packages/ segment
    [InlineData("../../etc/passwd")]
    [InlineData("Umbraco..Cms")]                              // empty segment
    [InlineData(".Umbraco.Cms")]                              // leading separator
    public void Rejects_anything_that_is_not_a_package_id(string input)
        => Assert.Null(PackageIdParser.ParsePackageId(input));

    [Fact]
    public void Url_and_bare_id_converge_on_the_same_value()
    {
        // The reason ids are stored rather than URLs: these must not become two entries.
        var fromUrl = PackageIdParser.ParsePackageId("https://www.nuget.org/packages/Umbraco.Cms/17.3.4");
        var fromId = PackageIdParser.ParsePackageId("Umbraco.Cms");

        Assert.Equal(fromId, fromUrl);
    }
}

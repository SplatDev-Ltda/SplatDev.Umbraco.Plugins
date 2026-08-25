using System.Text.Json;
using Xunit;
using PluginManifest = SplatDev.Umbraco.Tools.T4.Plugins.Templates.PackageManifestTemplate;
using PluginManifestV13 = SplatDev.Umbraco.Tools.T4.Plugins.Templates.PackageManifestV13Template;
using ThemeManifest = SplatDev.Umbraco.Tools.T4.Themes.Templates.PackageManifestTemplate;
using ThemeJson = SplatDev.Umbraco.Tools.T4.Themes.Templates.ThemeJsonTemplate;

namespace SplatDev.Umbraco.Tools.Tests;

/// <summary>
/// The scaffolders' output is what Umbraco reads to discover an extension, so the one thing
/// worth asserting is that it is valid JSON with the structure the backoffice expects.
/// </summary>
/// <remarks>
/// A manifest that fails to parse does not raise anything — the plugin is simply absent
/// from the backoffice, with no error. That is the failure this repository has hit more
/// than once, and it is invisible unless something checks the generated text.
/// </remarks>
public sealed class TemplateTests
{
    [Theory]
    [InlineData("MyPlugin")]
    [InlineData("Plugin.With.Dots")]
    [InlineData("Plugin-With-Dashes")]
    public void Plugin_manifest_is_parseable_and_names_an_entry_point(string name)
    {
        using var doc = JsonDocument.Parse(PluginManifest.Render(name));
        var root = doc.RootElement;

        Assert.Equal(name, root.GetProperty("name").GetString());
        var ext = Assert.Single(root.GetProperty("extensions").EnumerateArray().ToList());
        Assert.Equal("backofficeEntryPoint", ext.GetProperty("type").GetString());
        Assert.Equal($"{name}.entrypoint", ext.GetProperty("alias").GetString());
    }

    [Fact]
    public void Plugin_manifest_points_the_entry_point_under_App_Plugins()
    {
        using var doc = JsonDocument.Parse(PluginManifest.Render("MyPlugin"));
        var js = doc.RootElement.GetProperty("extensions")[0].GetProperty("js").GetString();

        // Umbraco enumerates physical directories under App_Plugins; a js path outside it
        // is never loaded, and nothing says so.
        Assert.Equal("/App_Plugins/MyPlugin/MyPlugin.js", js);
    }

    [Fact]
    public void The_v13_manifest_uses_the_AngularJS_shape_not_the_v17_one()
    {
        using var doc = JsonDocument.Parse(PluginManifestV13.Render("MyPlugin"));
        var root = doc.RootElement;

        // Umbraco 13 reads javascript/css arrays; "extensions" is the v14+ shape and would
        // be ignored entirely on 13.
        Assert.True(root.TryGetProperty("javascript", out var js));
        Assert.True(root.TryGetProperty("css", out var css));
        Assert.False(root.TryGetProperty("extensions", out _));
        Assert.Equal("/App_Plugins/MyPlugin/MyPlugin.controller.js", js[0].GetString());
        Assert.Equal("/App_Plugins/MyPlugin/MyPlugin.css", css[0].GetString());
    }

    [Theory]
    [InlineData("MyTheme")]
    [InlineData("Theme.With.Dots")]
    public void Theme_manifest_and_theme_json_are_both_parseable(string name)
    {
        using var manifest = JsonDocument.Parse(ThemeManifest.Render(name));
        Assert.Equal(name, manifest.RootElement.GetProperty("name").GetString());

        using var theme = JsonDocument.Parse(ThemeJson.Render(name));
        Assert.Equal(JsonValueKind.Object, theme.RootElement.ValueKind);
    }

    [Fact]
    public void A_name_containing_a_quote_would_break_the_manifest()
    {
        // These templates interpolate straight into JSON without escaping, so a quote in the
        // name produces something no parser accepts. Asserting it keeps the limitation
        // visible: the scaffolder's callers must not pass arbitrary text as a plugin name.
        var rendered = PluginManifest.Render("Bad\"Name");

        Assert.ThrowsAny<JsonException>(() => JsonDocument.Parse(rendered));
    }
}

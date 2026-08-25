using System.Text.Json;
using SplatDev.Umbraco.Tools.Packager;
using Xunit;

namespace SplatDev.Umbraco.Tools.Tests;

/// <summary>
/// First coverage for SplatDev.Umbraco.Tools.Packager, which has shipped to 1.0.4 with none.
/// </summary>
/// <remarks>
/// Every case works in a temp directory and cleans up after itself. These classes take
/// paths and touch the filesystem, so there is nothing to mock — the real behaviour is the
/// thing worth asserting.
/// </remarks>
public sealed class PackagerTests : IDisposable
{
    private readonly string _root =
        Path.Combine(Path.GetTempPath(), "splatdev-packager-" + Guid.NewGuid().ToString("N"));

    public PackagerTests() => Directory.CreateDirectory(_root);

    public void Dispose()
    {
        if (Directory.Exists(_root)) Directory.Delete(_root, recursive: true);
    }

    [Fact]
    public void ManifestGenerator_writes_the_manifest_where_Umbraco_looks_for_it()
    {
        var path = new ManifestGenerator("MyPlugin", "2.1.0").Generate(_root);

        Assert.Equal(Path.Combine(_root, "App_Plugins", "MyPlugin", "umbraco-package.json"), path);
        Assert.True(File.Exists(path));
    }

    [Fact]
    public void ManifestGenerator_writes_the_name_and_version_it_was_given()
    {
        var path = new ManifestGenerator("MyPlugin", "2.1.0").Generate(_root);

        using var doc = JsonDocument.Parse(File.ReadAllText(path));
        Assert.Equal("MyPlugin", doc.RootElement.GetProperty("name").GetString());
        Assert.Equal("2.1.0", doc.RootElement.GetProperty("version").GetString());
        Assert.Equal(JsonValueKind.Array, doc.RootElement.GetProperty("extensions").ValueKind);
    }

    [Fact]
    public void ManifestGenerator_produces_json_Umbraco_can_parse()
    {
        var path = new ManifestGenerator("Plugin \"quoted\" & odd", "1.0.0-beta.1").Generate(_root);

        // A name carrying quotes or ampersands has to survive serialisation intact, or the
        // manifest is unreadable and the plugin is silently invisible to the backoffice.
        using var doc = JsonDocument.Parse(File.ReadAllText(path));
        Assert.Equal("Plugin \"quoted\" & odd", doc.RootElement.GetProperty("name").GetString());
    }

    [Fact]
    public void AssetBundler_copies_App_Plugins_including_nested_directories()
    {
        var source = Path.Combine(_root, "src");
        var nested = Path.Combine(source, "App_Plugins", "MyPlugin", "dist");
        Directory.CreateDirectory(nested);
        File.WriteAllText(Path.Combine(source, "App_Plugins", "MyPlugin", "umbraco-package.json"), "{}");
        File.WriteAllText(Path.Combine(nested, "bundle.js"), "console.log(1);");

        var output = Path.Combine(_root, "out");
        new AssetBundler(source, output).Bundle();

        Assert.True(File.Exists(Path.Combine(output, "App_Plugins", "MyPlugin", "umbraco-package.json")));
        Assert.True(File.Exists(Path.Combine(output, "App_Plugins", "MyPlugin", "dist", "bundle.js")));
    }

    [Fact]
    public void AssetBundler_overwrites_a_stale_file_rather_than_leaving_it()
    {
        var source = Path.Combine(_root, "src", "App_Plugins", "P");
        Directory.CreateDirectory(source);
        File.WriteAllText(Path.Combine(source, "f.js"), "new");

        var output = Path.Combine(_root, "out");
        var stale = Path.Combine(output, "App_Plugins", "P");
        Directory.CreateDirectory(stale);
        File.WriteAllText(Path.Combine(stale, "f.js"), "old");

        new AssetBundler(Path.Combine(_root, "src"), output).Bundle();

        // A rebuild that left the previous bundle in place is how a manifest ends up
        // pointing at output nobody is regenerating.
        Assert.Equal("new", File.ReadAllText(Path.Combine(stale, "f.js")));
    }

    [Fact]
    public void AssetBundler_is_a_no_op_when_there_is_nothing_to_bundle()
    {
        var source = Path.Combine(_root, "empty");
        Directory.CreateDirectory(source);
        var output = Path.Combine(_root, "out");

        new AssetBundler(source, output).Bundle();

        // Returning quietly is correct — a plugin with no App_Plugins is not an error —
        // but it must not create an empty output directory that later looks like a build.
        Assert.False(Directory.Exists(Path.Combine(output, "App_Plugins")));
    }
}

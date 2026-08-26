using Moq;
using SplatDev.Umbraco.Plugins.SEO.Models;
using SplatDev.Umbraco.Plugins.SEO.Services;
using Umbraco.Cms.Core.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.SEO.Tests;

public class SeoDefaultsTests
{
    private static (SeoDefaultsStore Store, Mock<IKeyValueService> KeyValues) Build(string? stored = null)
    {
        var kv = new Mock<IKeyValueService>();
        kv.Setup(k => k.GetValue(SeoDefaultsStore.Key)).Returns(stored);
        return (new SeoDefaultsStore(kv.Object), kv);
    }

    [Fact]
    public void Nothing_stored_yields_usable_defaults_rather_than_null()
    {
        var (store, _) = Build(null);

        var d = store.Get();

        Assert.NotNull(d);
        Assert.Equal(string.Empty, d.MetaTitle);
        Assert.Equal("website", d.OgType);
    }

    [Fact]
    public void Saved_values_round_trip()
    {
        string? written = null;
        var kv = new Mock<IKeyValueService>();
        kv.Setup(k => k.SetValue(SeoDefaultsStore.Key, It.IsAny<string>()))
          .Callback<string, string>((_, v) => written = v);
        kv.Setup(k => k.GetValue(SeoDefaultsStore.Key)).Returns(() => written);
        var store = new SeoDefaultsStore(kv.Object);

        store.Save(new SeoDefaults
        {
            MetaTitle = "Site title",
            MetaDescription = "Site description",
            NoIndex = true,
            OgType = "article",
        });

        var read = store.Get();
        Assert.Equal("Site title", read.MetaTitle);
        Assert.Equal("Site description", read.MetaDescription);
        Assert.True(read.NoIndex);
        Assert.Equal("article", read.OgType);
    }

    [Fact]
    public void Unreadable_stored_json_returns_defaults_instead_of_throwing()
    {
        // A hand-edited or truncated value must not take the dashboard down. Empty fields
        // the user can save over are recoverable; a 500 is not.
        var (store, _) = Build("{ this is not json");

        var d = store.Get();

        Assert.NotNull(d);
        Assert.Equal("website", d.OgType);
    }

    [Fact]
    public void The_key_is_namespaced_so_it_cannot_collide_with_another_plugin()
    {
        Assert.StartsWith("SplatDev.Umbraco.Plugins.SEO/", SeoDefaultsStore.Key, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData(false, false, "index,follow")]
    [InlineData(true, false, "noindex,follow")]
    [InlineData(false, true, "index,nofollow")]
    [InlineData(true, true, "noindex,nofollow")]
    public void The_two_flags_map_onto_the_robots_directive(bool noIndex, bool noFollow, string expected)
    {
        var d = new SeoDefaults { NoIndex = noIndex, NoFollow = noFollow };

        Assert.Equal(expected, d.ToRobots());
    }

    [Fact]
    public void Save_refuses_null_rather_than_storing_it()
    {
        var (store, _) = Build();

        Assert.Throws<ArgumentNullException>(() => store.Save(null!));
    }
}

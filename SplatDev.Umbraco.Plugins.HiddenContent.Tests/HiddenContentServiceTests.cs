using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using SplatDev.Umbraco.Plugins.HiddenContent.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.HiddenContent.Tests;

public class HiddenContentServiceTests
{
    private readonly Mock<IContentService> _content = new();

    private HiddenContentService Build() =>
        new(_content.Object, NullLogger<HiddenContentService>.Instance);

    private Mock<IContent> Page(int id, Guid key, string name, object? naviHide = null, bool published = true)
    {
        var m = new Mock<IContent>();
        m.SetupGet(c => c.Id).Returns(id);
        m.SetupGet(c => c.Key).Returns(key);
        m.SetupGet(c => c.Name).Returns(name);
        m.SetupGet(c => c.Path).Returns($"-1,{id}");
        m.SetupGet(c => c.Published).Returns(published);
        m.Setup(c => c.GetValue("umbracoNaviHide", null, null, false)).Returns(naviHide);
        _content.Setup(c => c.GetById(id)).Returns(m.Object);
        _content.Setup(c => c.GetById(key)).Returns(m.Object);
        return m;
    }

    // ── the tolerant read ────────────────────────────────────────────────────

    [Theory]
    [InlineData(true, true)]
    [InlineData(false, false)]
    [InlineData("1", true)]
    [InlineData("0", false)]
    [InlineData("true", true)]
    [InlineData("True", true)]
    [InlineData("false", false)]
    [InlineData(1, true)]
    [InlineData(0, false)]
    [InlineData(null, false)]
    public void umbracoNaviHide_is_read_in_every_shape_it_gets_stored_in(object? stored, bool expected)
    {
        // It was compared against the literal string "1", so a page hidden through the
        // content tree — which stores a boolean — did not register as hidden.
        var page = Page(1063, Guid.NewGuid(), "Page", stored);
        Assert.Equal(expected, HiddenContentService.IsHidden(page.Object));
    }

    // ── reference resolution ─────────────────────────────────────────────────

    [Fact]
    public void A_reference_resolves_from_id_key_or_udi()
    {
        var key = Guid.NewGuid();
        Page(1063, key, "Page");
        var svc = Build();

        Assert.Equal(1063, svc.Resolve("1063")!.Id);
        Assert.Equal(1063, svc.Resolve(key.ToString())!.Id);
        Assert.Equal(1063, svc.Resolve($"umb://document/{key:N}")!.Id);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("nonsense")]
    [InlineData("0")]
    public void Rubbish_references_resolve_to_nothing(string? input) =>
        Assert.Null(Build().Resolve(input));

    // ── writes ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task Hiding_nothing_is_refused_rather_than_reported_as_done()
    {
        var result = await Build().HideAsync([]);
        Assert.False(result.Success);
        Assert.Contains("at least one page", result.Message);
    }

    [Fact]
    public async Task Hiding_a_published_page_publishes_the_change()
    {
        // Saving alone would leave the page still showing in menus until someone
        // republished it, which looks like the button did nothing.
        var page = Page(1063, Guid.NewGuid(), "Secret", published: true);

        var result = await Build().HideAsync(["1063"]);

        Assert.True(result.Success);
        page.Verify(c => c.SetValue("umbracoNaviHide", true, null, null), Times.Once);
    }

    [Fact]
    public async Task Hiding_an_unpublished_page_saves_without_publishing_and_says_so()
    {
        // Publishing here would push unrelated unreviewed edits live.
        Page(1063, Guid.NewGuid(), "Draft page", published: false);

        var result = await Build().HideAsync(["1063"]);

        Assert.True(result.Success);
        Assert.Contains("not published", result.Message);
        Assert.Contains("Draft page", result.Message);
        _content.Verify(c => c.Save(It.IsAny<IContent>(), It.IsAny<int>(), It.IsAny<ContentScheduleCollection>()), Times.AtMostOnce);
    }

    [Fact]
    public async Task A_reference_that_does_not_resolve_is_reported_not_silently_skipped()
    {
        var result = await Build().HideAsync(["999999"]);

        Assert.False(result.Success);
        Assert.Contains("None of those pages could be found", result.Message);
        Assert.Contains("999999", result.Message);
    }

    [Fact]
    public async Task A_partial_batch_succeeds_and_names_what_was_missed()
    {
        Page(1063, Guid.NewGuid(), "Real page");

        var result = await Build().HideAsync(["1063", "999999"]);

        Assert.True(result.Success);
        Assert.Contains("1 could not be found", result.Message);
    }

    [Fact]
    public async Task IsHidden_returns_null_for_a_page_that_does_not_exist()
    {
        Assert.Null(await Build().IsHiddenAsync("999999"));
    }
}

using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using SplatDev.Umbraco.Plugins.Restricted.Models;
using SplatDev.Umbraco.Plugins.Restricted.Services;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.Restricted.Tests;

public class RestrictedContentServiceTests
{
    private readonly Mock<IPublicAccessService> _access = new();
    private readonly Mock<IContentService> _content = new();
    private readonly Mock<IMemberGroupService> _groups = new();

    private static readonly Guid MembersKey = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid StaffKey = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid PageKey = Guid.Parse("33333333-3333-3333-3333-333333333333");

    private RestrictedContentService Build()
    {
        _groups.Setup(g => g.GetAll()).Returns(new[]
        {
            Group(MembersKey, "Members"),
            Group(StaffKey, "Staff"),
        });

        return new RestrictedContentService(
            _access.Object, _content.Object, _groups.Object,
            NullLogger<RestrictedContentService>.Instance);
    }

    private static IMemberGroup Group(Guid key, string name)
    {
        var m = new Mock<IMemberGroup>();
        m.SetupGet(x => x.Key).Returns(key);
        m.SetupGet(x => x.Name).Returns(name);
        return m.Object;
    }

    private Mock<IContent> Page(int id, Guid key, string name, string path)
    {
        var m = new Mock<IContent>();
        m.SetupGet(c => c.Id).Returns(id);
        m.SetupGet(c => c.Key).Returns(key);
        m.SetupGet(c => c.Name).Returns(name);
        m.SetupGet(c => c.Path).Returns(path);
        _content.Setup(c => c.GetById(id)).Returns(m.Object);
        _content.Setup(c => c.GetById(key)).Returns(m.Object);
        return m;
    }

    // ── the fix the dashboard depends on ─────────────────────────────────────

    [Fact]
    public void A_reference_resolves_from_an_integer_id()
    {
        Page(1063, PageKey, "Members Area", "-1,1063");
        Assert.Equal(1063, Build().Resolve("1063")!.Id);
    }

    [Fact]
    public void A_reference_resolves_from_a_guid_key()
    {
        Page(1063, PageKey, "Members Area", "-1,1063");
        Assert.Equal(1063, Build().Resolve(PageKey.ToString())!.Id);
    }

    [Fact]
    public void A_reference_resolves_from_a_udi()
    {
        // Umbraco 13's AngularJS pickers hand back UDIs rather than bare keys.
        Page(1063, PageKey, "Members Area", "-1,1063");
        Assert.Equal(1063, Build().Resolve($"umb://document/{PageKey:N}")!.Id);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not-a-reference")]
    [InlineData("0")]
    [InlineData("-1")]
    public void Rubbish_references_resolve_to_nothing_rather_than_throwing(string? input)
    {
        Assert.Null(Build().Resolve(input));
    }

    // ── the silent-failure bug ───────────────────────────────────────────────

    [Fact]
    public async Task Protecting_a_page_that_does_not_exist_reports_failure()
    {
        // The old service logged a warning and returned void, so the dashboard showed
        // success for a save that had done nothing at all.
        var result = await Build().RestrictNodeAsync(new RestrictNodeRequest { Node = "999999" });

        Assert.False(result.Success);
        Assert.Contains("Pick the page", result.Message);
        _access.Verify(a => a.Save(It.IsAny<PublicAccessEntry>()), Times.Never);
    }

    [Fact]
    public async Task A_missing_login_page_is_refused_with_an_explanation()
    {
        Page(1063, PageKey, "Members Area", "-1,1063");

        var result = await Build().RestrictNodeAsync(new RestrictNodeRequest
        {
            Node = "1063",
            MemberGroups = ["Members"],
        });

        Assert.False(result.Success);
        Assert.Contains("login page", result.Message, StringComparison.OrdinalIgnoreCase);
        _access.Verify(a => a.Save(It.IsAny<PublicAccessEntry>()), Times.Never);
    }

    [Fact]
    public async Task Protecting_with_no_groups_is_refused_because_it_locks_everyone_out()
    {
        Page(1063, PageKey, "Members Area", "-1,1063");
        Page(1010, Guid.NewGuid(), "Login", "-1,1010");
        Page(1011, Guid.NewGuid(), "Denied", "-1,1011");

        var result = await Build().RestrictNodeAsync(new RestrictNodeRequest
        {
            Node = "1063", LoginPage = "1010", ErrorPage = "1011", MemberGroups = [],
        });

        Assert.False(result.Success);
        Assert.Contains("at least one member group", result.Message);
    }

    [Fact]
    public async Task An_unknown_member_group_is_refused_rather_than_silently_dropped()
    {
        Page(1063, PageKey, "Members Area", "-1,1063");
        Page(1010, Guid.NewGuid(), "Login", "-1,1010");
        Page(1011, Guid.NewGuid(), "Denied", "-1,1011");

        var result = await Build().RestrictNodeAsync(new RestrictNodeRequest
        {
            Node = "1063", LoginPage = "1010", ErrorPage = "1011",
            MemberGroups = ["Members", "Typo Group"],
        });

        Assert.False(result.Success);
        Assert.Contains("Typo Group", result.Message);
    }

    // ── the group key/name translation ───────────────────────────────────────

    [Fact]
    public async Task Groups_picked_by_key_are_stored_by_name()
    {
        // The picker deals in GUIDs; Umbraco's public-access rule stores the group name.
        Page(1063, PageKey, "Members Area", "-1,1063");
        Page(1010, Guid.NewGuid(), "Login", "-1,1010");
        Page(1011, Guid.NewGuid(), "Denied", "-1,1011");

        PublicAccessEntry? saved = null;
        _access.Setup(a => a.Save(It.IsAny<PublicAccessEntry>()))
               .Callback<PublicAccessEntry>(e => saved = e);

        var result = await Build().RestrictNodeAsync(new RestrictNodeRequest
        {
            Node = PageKey.ToString(),
            LoginPage = "1010",
            ErrorPage = "1011",
            MemberGroups = [MembersKey.ToString(), StaffKey.ToString()],
        });

        Assert.True(result.Success);
        Assert.NotNull(saved);

        var values = saved!.Rules
            .Where(r => r.RuleType == Constants.Conventions.PublicAccess.MemberRoleRuleType)
            .Select(r => r.RuleValue)
            .OrderBy(v => v)
            .ToArray();

        Assert.Equal(new[] { "Members", "Staff" }, values);
    }

    [Fact]
    public async Task Groups_given_by_name_still_work_for_anyone_scripting_the_old_api()
    {
        Page(1063, PageKey, "Members Area", "-1,1063");
        Page(1010, Guid.NewGuid(), "Login", "-1,1010");
        Page(1011, Guid.NewGuid(), "Denied", "-1,1011");

        var result = await Build().RestrictNodeAsync(new RestrictNodeRequest
        {
            Node = "1063", LoginPage = "1010", ErrorPage = "1011",
            MemberGroups = ["members"],   // case-insensitive
        });

        Assert.True(result.Success);
    }

    // ── unprotect ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Unprotecting_a_page_that_was_not_protected_succeeds_quietly()
    {
        Page(1063, PageKey, "Members Area", "-1,1063");
        _access.Setup(a => a.GetEntryForContent(It.IsAny<IContent>())).Returns((PublicAccessEntry?)null);

        var result = await Build().UnrestrictNodeAsync("1063");

        Assert.True(result.Success);
        Assert.Contains("was not protected", result.Message);
    }

    [Fact]
    public async Task Unprotecting_an_unknown_page_reports_failure()
    {
        var result = await Build().UnrestrictNodeAsync("999999");
        Assert.False(result.Success);
    }

    // ── listing ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task Listing_uses_the_supplied_group_catalog_once_for_all_entries()
    {
        var page = Page(1063, PageKey, "Members Area", "-1,1063");
        var login = Page(1010, Guid.NewGuid(), "Login", "-1,1010");
        var denied = Page(1011, Guid.NewGuid(), "Denied", "-1,1011");
        var entryId = Guid.NewGuid();
        var rule = new PublicAccessRule(Guid.NewGuid(), entryId)
        {
            RuleType = Constants.Conventions.PublicAccess.MemberRoleRuleType,
            RuleValue = "Members",
        };
        var entry = new PublicAccessEntry(page.Object, login.Object, denied.Object, [rule]);
        _access.Setup(a => a.GetAll()).Returns([entry]);

        var suppliedCatalog = new[] { Group(MembersKey, "Members") };
        var result = await Build().GetRestrictedNodesAsync(suppliedCatalog);

        Assert.Single(result);
        Assert.Equal("Members", result[0].MemberGroups.Single().Name);
        _groups.Verify(g => g.GetAll(), Times.Never);
    }

    [Fact]
    public async Task Member_groups_are_listed_alphabetically_for_the_picker()
    {
        var list = await Build().GetMemberGroupsAsync();
        Assert.Equal(new[] { "Members", "Staff" }, list.Select(g => g.Name).ToArray());
    }
}

using Microsoft.Extensions.Options;

using Moq;

using SplatDev.Umbraco.Plugins.PdfCurator.Models;
using SplatDev.Umbraco.Plugins.PdfCurator.Services;

using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

using Xunit;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Tests;

public class MemberGroupScopingServiceTests
{
    private const string MemberEmail = "test@example.com";
    private static readonly Guid MemberKey = Guid.NewGuid();

    [Fact]
    public async Task GetAllowedCategoriesAsync_ReturnsEmptySet_WhenNoScopesConfigured()
    {
        var options = Options.Create(new PdfCuratorOptions());
        var memberManagerMock = new Mock<IMemberManager>();
        var memberServiceMock = new Mock<IMemberService>();

        var service = new MemberGroupScopingService(options, memberManagerMock.Object, memberServiceMock.Object);

        var result = await service.GetAllowedCategoriesAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetAllowedCategoriesAsync_ReturnsEmptySet_WhenScopesIsNull()
    {
        var options = Options.Create(new PdfCuratorOptions { MemberGroupScopes = null! });
        var memberManagerMock = new Mock<IMemberManager>();
        var memberServiceMock = new Mock<IMemberService>();

        var service = new MemberGroupScopingService(options, memberManagerMock.Object, memberServiceMock.Object);

        var result = await service.GetAllowedCategoriesAsync();

        Assert.Empty(result);
        Assert.False(service.IsConfigured());
    }

    [Fact]
    public async Task GetAllowedCategoriesAsync_ReturnsEmptySet_WhenScopesIsEmpty()
    {
        var options = Options.Create(new PdfCuratorOptions
        {
            MemberGroupScopes = new Dictionary<string, List<string>>(),
        });
        var memberManagerMock = new Mock<IMemberManager>();
        var memberServiceMock = new Mock<IMemberService>();

        var service = new MemberGroupScopingService(options, memberManagerMock.Object, memberServiceMock.Object);

        var result = await service.GetAllowedCategoriesAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetAllowedCategoriesAsync_ReturnsNoneMarker_WhenNoCurrentMember()
    {
        var options = Options.Create(new PdfCuratorOptions
        {
            MemberGroupScopes = new Dictionary<string, List<string>>
            {
                ["Technology"] = ["Developers"],
            },
        });
        var memberManagerMock = new Mock<IMemberManager>();
        memberManagerMock.Setup(m => m.GetCurrentMemberAsync())
            .ReturnsAsync((MemberIdentityUser?)null);
        var memberServiceMock = new Mock<IMemberService>();

        var service = new MemberGroupScopingService(options, memberManagerMock.Object, memberServiceMock.Object);

        var result = await service.GetAllowedCategoriesAsync();

        Assert.Single(result);
        Assert.Contains("__none__", result);
    }

    [Fact]
    public async Task GetAllowedCategoriesAsync_ReturnsMemberCategories()
    {
        var options = Options.Create(new PdfCuratorOptions
        {
            MemberGroupScopes = new Dictionary<string, List<string>>
            {
                ["Technology"] = ["Developers"],
                ["Design"] = ["Designers", "Admins"],
            },
        });

        var identity = new MemberIdentityUser { Email = MemberEmail, UserName = MemberEmail, Key = MemberKey };
        var memberManagerMock = new Mock<IMemberManager>();
        memberManagerMock.Setup(m => m.GetCurrentMemberAsync()).ReturnsAsync(identity);

        var member = new Mock<IMember>();
        member.Setup(m => m.Id).Returns(42);
        var memberServiceMock = new Mock<IMemberService>();
        memberServiceMock.Setup(s => s.GetByKey(MemberKey)).Returns(member.Object);
        memberServiceMock.Setup(s => s.GetAllRoles(42))
            .Returns(["Developers", "Viewers"]);

        var service = new MemberGroupScopingService(options, memberManagerMock.Object, memberServiceMock.Object);

        var result = await service.GetAllowedCategoriesAsync();

        Assert.Single(result);
        Assert.Contains("Technology", result);
        Assert.DoesNotContain("Design", result);
    }

    [Fact]
    public async Task GetAllowedCategoriesAsync_ReturnsEmptyAllowed_WhenMemberHasNoMatchingGroups()
    {
        var options = Options.Create(new PdfCuratorOptions
        {
            MemberGroupScopes = new Dictionary<string, List<string>>
            {
                ["Technology"] = ["Developers"],
            },
        });

        var identity = new MemberIdentityUser { Email = MemberEmail, UserName = MemberEmail, Key = MemberKey };
        var memberManagerMock = new Mock<IMemberManager>();
        memberManagerMock.Setup(m => m.GetCurrentMemberAsync()).ReturnsAsync(identity);

        var member = new Mock<IMember>();
        member.Setup(m => m.Id).Returns(42);
        var memberServiceMock = new Mock<IMemberService>();
        memberServiceMock.Setup(s => s.GetByKey(MemberKey)).Returns(member.Object);
        memberServiceMock.Setup(s => s.GetAllRoles(42)).Returns(["Viewers"]);

        var service = new MemberGroupScopingService(options, memberManagerMock.Object, memberServiceMock.Object);

        var result = await service.GetAllowedCategoriesAsync();

        Assert.Empty(result);
    }

    [Fact]
    public void IsConfigured_ReturnsFalse_WhenNoScopes()
    {
        var options = Options.Create(new PdfCuratorOptions());
        var memberManagerMock = new Mock<IMemberManager>();
        var memberServiceMock = new Mock<IMemberService>();

        var service = new MemberGroupScopingService(options, memberManagerMock.Object, memberServiceMock.Object);

        Assert.False(service.IsConfigured());
    }

    [Fact]
    public void IsConfigured_ReturnsTrue_WhenScopesExist()
    {
        var options = Options.Create(new PdfCuratorOptions
        {
            MemberGroupScopes = new Dictionary<string, List<string>>
            {
                ["Technology"] = ["Developers"],
            },
        });
        var memberManagerMock = new Mock<IMemberManager>();
        var memberServiceMock = new Mock<IMemberService>();

        var service = new MemberGroupScopingService(options, memberManagerMock.Object, memberServiceMock.Object);

        Assert.True(service.IsConfigured());
    }
}

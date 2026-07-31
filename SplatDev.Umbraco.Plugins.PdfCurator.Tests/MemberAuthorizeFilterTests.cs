using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

using Moq;

using SplatDev.Umbraco.Plugins.PdfCurator.Authorization;

using Umbraco.Cms.Core.Security;

using Xunit;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Tests;

public class MemberAuthorizeFilterTests
{
    [Fact]
    public async Task OnAuthorizationAsync_Returns401_WhenNoCurrentMember()
    {
        var memberManagerMock = new Mock<IMemberManager>();
        memberManagerMock.Setup(m => m.GetCurrentMemberAsync())
            .ReturnsAsync((MemberIdentityUser?)null);

        var filter = new MemberAuthorizeFilter(memberManagerMock.Object);
        var context = CreateFilterContext();

        await filter.OnAuthorizationAsync(context);

        var jsonResult = Assert.IsType<JsonResult>(context.Result);
        Assert.Equal(401, jsonResult.StatusCode);
    }

    [Fact]
    public async Task OnAuthorizationAsync_Succeeds_WhenMemberIsAuthenticated()
    {
        var member = CreateMember();
        var memberManagerMock = new Mock<IMemberManager>();
        memberManagerMock.Setup(m => m.GetCurrentMemberAsync())
            .ReturnsAsync(member);

        var filter = new MemberAuthorizeFilter(memberManagerMock.Object);
        var context = CreateFilterContext();

        await filter.OnAuthorizationAsync(context);

        Assert.Null(context.Result);
    }

    [Fact]
    public void MemberAuthorizeAttribute_IsTypeFilterForMemberAuthorizeFilter()
    {
        var attr = new MemberAuthorizeAttribute();
        Assert.Equal(typeof(MemberAuthorizeFilter), attr.ImplementationType);
    }

    private static AuthorizationFilterContext CreateFilterContext()
    {
        var services = new ServiceCollection().BuildServiceProvider();
        return new AuthorizationFilterContext(
            new ActionContext(new DefaultHttpContext(), new RouteData(), new ControllerActionDescriptor()),
            []);
    }

    private static MemberIdentityUser CreateMember(string email = "test@example.com")
    {
        return new MemberIdentityUser { Email = email, UserName = email, Key = Guid.NewGuid() };
    }
}

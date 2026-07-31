using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

using Umbraco.Cms.Core.Security;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class MemberAuthorizeAttribute : TypeFilterAttribute
{
    public MemberAuthorizeAttribute() : base(typeof(MemberAuthorizeFilter))
    {
    }
}

public class MemberAuthorizeFilter : IAsyncAuthorizationFilter
{
    private readonly IMemberManager _memberManager;

    public MemberAuthorizeFilter(IMemberManager memberManager)
    {
        _memberManager = memberManager;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var member = await _memberManager.GetCurrentMemberAsync();
        if (member is null)
        {
            context.Result = new JsonResult(new { error = "Authentication required." })
            {
                StatusCode = 401,
            };
        }
    }
}

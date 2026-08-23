using Microsoft.AspNetCore.Mvc;

namespace SplatDev.Umbraco.Plugins.MemberLogin.ViewComponents;

public class MemberLoginViewComponent : ViewComponent
{
    public Task<IViewComponentResult> InvokeAsync(
        string? returnUrl = null,
        bool showRememberMe = true,
        bool showForgotPassword = true)
    {
        ViewBag.ReturnUrl = returnUrl ?? "/";
        ViewBag.ShowRememberMe = showRememberMe;
        ViewBag.ShowForgotPassword = showForgotPassword;
        return Task.FromResult<IViewComponentResult>(View());
    }
}

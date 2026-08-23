using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.MemberRegistration.Services;

namespace SplatDev.Umbraco.Plugins.MemberRegistration.ViewComponents;

public class MemberRegistrationViewComponent : ViewComponent
{
    private readonly IMemberRegistrationService _service;

    public MemberRegistrationViewComponent(IMemberRegistrationService service)
    {
        _service = service;
    }

    public async Task<IViewComponentResult> InvokeAsync(
        string? redirectUrl = null,
        string memberTypeAlias = "Member")
    {
        ViewBag.RedirectUrl = redirectUrl ?? "/";
        ViewBag.MemberTypeAlias = memberTypeAlias;
        ViewBag.PendingCount = (await _service.GetPendingAsync()).Count();
        return View();
    }
}

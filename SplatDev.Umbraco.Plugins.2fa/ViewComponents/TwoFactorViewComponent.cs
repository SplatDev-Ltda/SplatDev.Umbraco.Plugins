using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.TwoFactor.Services;
using Umbraco.Cms.Core.Security;

namespace SplatDev.Umbraco.Plugins.TwoFactor.ViewComponents;

/// <summary>
/// Renders the member's own 2FA panel.
/// </summary>
/// <remarks>
/// This used to be <c>InvokeAsync(int memberId)</c>, so the id came from whatever the
/// template passed and was then echoed to the API by the browser. It now reads the
/// signed-in member and renders nothing at all when there isn't one — a template cannot
/// aim this component at somebody else's account.
///
/// Breaking change: call it as <c>@await Component.InvokeAsync("TwoFactor")</c>, with no
/// argument. An existing <c>InvokeAsync("TwoFactor", new { memberId = ... })</c> call will
/// fail to bind, which is intentional — it fails loudly rather than silently ignoring the
/// argument and appearing to still work.
/// </remarks>
public class TwoFactorViewComponent : ViewComponent
{
    private readonly ITwoFactorService _service;
    private readonly IMemberManager _memberManager;

    public TwoFactorViewComponent(ITwoFactorService service, IMemberManager memberManager)
    {
        _service = service;
        _memberManager = memberManager;
    }

    public async Task<IViewComponentResult> InvokeAsync()
    {
        var member = await _memberManager.GetCurrentMemberAsync();

        if (member is null || !int.TryParse(member.Id, out var memberId) || memberId <= 0)
        {
            ViewBag.IsAuthenticated = false;
            return View();
        }

        ViewBag.IsAuthenticated = true;
        ViewBag.IsEnabled = await _service.IsEnabledAsync(memberId);
        return View();
    }
}

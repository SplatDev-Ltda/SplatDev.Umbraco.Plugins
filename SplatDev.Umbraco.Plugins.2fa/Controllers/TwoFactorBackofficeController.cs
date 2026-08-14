using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.TwoFactor.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.TwoFactor.Controllers;

/// <summary>
/// Administrative view of member 2FA, for the backoffice dashboard.
/// </summary>
/// <remarks>
/// This is the only place an explicit memberId is accepted, and it is gated behind
/// backoffice access. Note what is missing compared with the member-facing controller:
/// an administrator can see enrolment status and revoke 2FA for a member who has lost
/// their device, but cannot read a member's TOTP secret or mint backup codes on their
/// behalf. Those would let an administrator silently impersonate a member, which is the
/// thing 2FA is supposed to make hard.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/twofactor/admin/[action]")]
public class TwoFactorBackofficeController : ControllerBase
{
    private readonly ITwoFactorService _service;

    public TwoFactorBackofficeController(ITwoFactorService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> IsEnabled([FromQuery] int memberId)
    {
        if (memberId <= 0)
            return BadRequest("Valid memberId is required.");

        return Ok(new { enabled = await _service.IsEnabledAsync(memberId) });
    }

    /// <summary>
    /// Revokes 2FA for a member, for the lost-device case.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Disable([FromQuery] int memberId)
    {
        if (memberId <= 0)
            return BadRequest("Valid memberId is required.");

        await _service.DisableAsync(memberId);
        return Ok(new { message = "2FA disabled for member." });
    }
}

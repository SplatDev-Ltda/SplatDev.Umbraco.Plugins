using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.TwoFactor.Services;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.TwoFactor.Controllers;

/// <summary>
/// Administrative view of member 2FA, for the backoffice dashboard.
/// </summary>
/// <remarks>
/// Note what is missing compared with the member-facing controller: an administrator can
/// see enrolment status and revoke 2FA for a member who has lost their device, but cannot
/// read a member's TOTP secret or mint backup codes on their behalf. Those would let an
/// administrator silently impersonate a member, which is the thing 2FA is supposed to
/// make hard.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/twofactor/admin/[action]")]
public class TwoFactorBackofficeController : ControllerBase
{
    private readonly ITwoFactorService _service;
    private readonly IMemberService _memberService;

    public TwoFactorBackofficeController(ITwoFactorService service, IMemberService memberService)
    {
        _service = service;
        _memberService = memberService;
    }

    /// <summary>
    /// Resolves a member from an id, a GUID key, a UDI, a username or an email address.
    /// </summary>
    /// <remarks>
    /// The dashboard used to ask an administrator to type a numeric member id, which is
    /// not shown anywhere they would normally look — finding it meant querying the
    /// database. The picker supplies a key; the other forms are accepted so that support
    /// staff working from an email address in a ticket do not have to look anything up.
    /// </remarks>
    private (int Id, string Name)? ResolveMember(string? reference)
    {
        if (string.IsNullOrWhiteSpace(reference)) return null;
        var value = reference.Trim();

        if (int.TryParse(value, out var id) && id > 0)
        {
            var byId = _memberService.GetById(id);
            return byId is null ? null : (byId.Id, byId.Name ?? byId.Username);
        }

        if (Guid.TryParse(value, out var key))
        {
            var byKey = _memberService.GetByKey(key);
            return byKey is null ? null : (byKey.Id, byKey.Name ?? byKey.Username);
        }

        if (UdiParser.TryParse(value, out var udi)
            && udi is GuidUdi guidUdi)
        {
            var byUdi = _memberService.GetByKey(guidUdi.Guid);
            return byUdi is null ? null : (byUdi.Id, byUdi.Name ?? byUdi.Username);
        }

        var byName = value.Contains('@')
            ? _memberService.GetByEmail(value)
            : _memberService.GetByUsername(value);

        return byName is null ? null : (byName.Id, byName.Name ?? byName.Username);
    }

    [HttpGet]
    public async Task<IActionResult> IsEnabled([FromQuery] string member)
    {
        var resolved = ResolveMember(member);
        if (resolved is null)
            return NotFound(new { message = "That member could not be found." });

        return Ok(new
        {
            memberId = resolved.Value.Id,
            memberName = resolved.Value.Name,
            enabled = await _service.IsEnabledAsync(resolved.Value.Id),
        });
    }

    /// <summary>Revokes 2FA for a member, for the lost-device case.</summary>
    [HttpPost]
    public async Task<IActionResult> Disable([FromQuery] string member)
    {
        var resolved = ResolveMember(member);
        if (resolved is null)
            return NotFound(new { message = "That member could not be found." });

        await _service.DisableAsync(resolved.Value.Id);

        return Ok(new
        {
            memberId = resolved.Value.Id,
            memberName = resolved.Value.Name,
            message = $"2FA revoked for {resolved.Value.Name}. They will need to enrol again.",
        });
    }
}

using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.TwoFactor.Services;
using Umbraco.Cms.Core.Security;

namespace SplatDev.Umbraco.Plugins.TwoFactor.Controllers;

/// <summary>
/// Member self-service. Every action operates on the member making the request.
/// </summary>
/// <remarks>
/// There is deliberately no memberId parameter anywhere in this controller. The previous
/// version took one from the query string on an unauthenticated route, which let anyone
/// disable 2FA for any member — or mint backup codes and read them out of the response —
/// by guessing an integer. The member id now comes from the authenticated session and
/// cannot be influenced by the caller.
/// </remarks>
[Route("umbraco/api/twofactor/[action]")]
public class TwoFactorMemberController : ControllerBase
{
    private readonly ITwoFactorService _service;
    private readonly IMemberManager _memberManager;

    public TwoFactorMemberController(ITwoFactorService service, IMemberManager memberManager)
    {
        _service = service;
        _memberManager = memberManager;
    }

    /// <summary>
    /// Resolves the signed-in member, or null when nobody is signed in.
    /// </summary>
    private async Task<int?> CurrentMemberIdAsync()
    {
        var member = await _memberManager.GetCurrentMemberAsync();
        if (member is null)
            return null;

        return int.TryParse(member.Id, out var id) && id > 0 ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> IsEnabled()
    {
        var memberId = await CurrentMemberIdAsync();
        if (memberId is null)
            return Unauthorized();

        return Ok(new { enabled = await _service.IsEnabledAsync(memberId.Value) });
    }

    [HttpPost]
    public async Task<IActionResult> SetupTotp()
    {
        var member = await _memberManager.GetCurrentMemberAsync();
        if (member is null || !int.TryParse(member.Id, out var memberId) || memberId <= 0)
            return Unauthorized();

        var setup = await _service.SetupTotpAsync(memberId);

        // The otpauth:// URI is what a QR code encodes and what "enter a setup key" expects.
        // Without it a member has to hand-type the secret and guess the issuer, which is why
        // the raw key alone was never enough to complete enrolment.
        var account = member.Email ?? member.UserName ?? $"member-{memberId}";
        var issuer = Uri.EscapeDataString(HttpContext.Request.Host.Host);
        var label = Uri.EscapeDataString(account);
        var otpauth = $"otpauth://totp/{issuer}:{label}"
                    + $"?secret={setup.SecretKey.TrimEnd('=')}"
                    + $"&issuer={issuer}&algorithm=SHA1&digits=6&period=30";

        // The secret is returned because the member has to enrol it in an authenticator app,
        // and this is the one moment it legitimately crosses the wire — to its own owner.
        return Ok(new { setup.Id, setup.SecretKey, otpauth, setup.IsEnabled, setup.CreatedAt });
    }

    [HttpPost]
    public async Task<IActionResult> VerifyTotp([FromQuery] string code)
    {
        var memberId = await CurrentMemberIdAsync();
        if (memberId is null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(code))
            return BadRequest("code is required.");

        return Ok(new { valid = await _service.VerifyTotpAsync(memberId.Value, code) });
    }

    [HttpPost]
    public async Task<IActionResult> GenerateBackupCodes([FromQuery] int count = 8)
    {
        var memberId = await CurrentMemberIdAsync();
        if (memberId is null)
            return Unauthorized();

        if (count is < 1 or > 32)
            return BadRequest("count must be between 1 and 32.");

        try
        {
            return Ok(new { codes = await _service.GenerateBackupCodesAsync(memberId.Value, count) });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> UseBackupCode([FromQuery] string code)
    {
        var memberId = await CurrentMemberIdAsync();
        if (memberId is null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(code))
            return BadRequest("code is required.");

        return Ok(new { used = await _service.UseBackupCodeAsync(memberId.Value, code) });
    }

    [HttpPost]
    public async Task<IActionResult> Disable()
    {
        var memberId = await CurrentMemberIdAsync();
        if (memberId is null)
            return Unauthorized();

        await _service.DisableAsync(memberId.Value);
        return Ok(new { message = "2FA disabled." });
    }
}

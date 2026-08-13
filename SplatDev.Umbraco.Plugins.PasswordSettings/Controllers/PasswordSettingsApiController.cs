using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.PasswordSettings.Models;
using SplatDev.Umbraco.Plugins.PasswordSettings.Services;

namespace SplatDev.Umbraco.Plugins.PasswordSettings.Controllers;

/// <summary>
/// Password policy, and the history checks behind it.
/// </summary>
/// <remarks>
/// Mixed by nature: a registration or reset form has to read the policy and validate a
/// candidate password before anyone is signed in, so those two stay anonymous. The rest
/// does not — see the note on IsPasswordReused.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/passwordsettings/[action]")]
public class PasswordSettingsApiController : ControllerBase
{
    private readonly IPasswordSettingsService _service;

    public PasswordSettingsApiController(IPasswordSettingsService service)
    {
        _service = service;
    }

    // A registration form must be able to show the rules before anyone is signed in.
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetPolicy()
    {
        var policy = await _service.GetPolicyAsync();
        if (policy is null)
            return Ok(new PasswordPolicy());

        return Ok(policy);
    }

    [HttpPost]
    public async Task<IActionResult> SavePolicy([FromBody] PasswordPolicy policy)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var saved = await _service.SavePolicyAsync(policy);
        return Ok(saved);
    }

    // Same: live validation on a registration form, before there is a session. This
    // checks a candidate against the policy only — it does not confirm anyone's password.
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> ValidatePassword([FromBody] ValidatePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Password is required.");

        var policy = await _service.GetPolicyAsync() ?? new PasswordPolicy();
        var (valid, errors) = await _service.ValidatePasswordAsync(request.Password, policy);
        return Ok(new { valid, errors });
    }

    // Not anonymous. It writes an arbitrary hash into any member's password history, which
    // lets a caller poison the reuse check or seed it with hashes of their choosing.
    [HttpPost]
    public async Task<IActionResult> RecordPasswordChange([FromBody] RecordPasswordChangeRequest request)
    {
        if (request.MemberId <= 0 || string.IsNullOrWhiteSpace(request.PasswordHash))
            return BadRequest("MemberId and PasswordHash are required.");

        await _service.RecordPasswordChangeAsync(request.MemberId, request.PasswordHash);
        return Ok(new { message = "Password change recorded." });
    }

    // Not anonymous. Given a member id and a hash computed offline, this answers whether
    // that member has ever used it — a password-verification oracle that turns a stolen
    // hash list into confirmed credentials, one query at a time.
    [HttpGet]
    public async Task<IActionResult> IsPasswordReused(
        [FromQuery] int memberId,
        [FromQuery] string passwordHash)
    {
        if (memberId <= 0 || string.IsNullOrWhiteSpace(passwordHash))
            return BadRequest("MemberId and passwordHash are required.");

        var policy = await _service.GetPolicyAsync() ?? new PasswordPolicy();
        var reused = await _service.IsPasswordReusedAsync(memberId, passwordHash, policy.HistoryCount);
        return Ok(new { reused });
    }
}

public class ValidatePasswordRequest
{
    public string Password { get; set; } = string.Empty;
}

public class RecordPasswordChangeRequest
{
    public int MemberId { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
}

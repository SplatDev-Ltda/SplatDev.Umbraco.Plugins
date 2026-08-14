using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.MemberRegistration.Services;

namespace SplatDev.Umbraco.Plugins.MemberRegistration.Controllers;

/// <remarks>
/// Previously anonymous. Approve activated any pending member account and GetPending listed them. Registering and verifying an email stay open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/memberregistration/[action]")]
public class MemberRegistrationApiController : ControllerBase
{
    private readonly IMemberRegistrationService _service;

    public MemberRegistrationApiController(IMemberRegistrationService service)
    {
        _service = service;
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.RegisterAsync(
            request.Name, request.Email, request.Username, request.Password,
            request.MemberTypeAlias ?? "Member");

        if (!result.Success)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(new { memberId = result.MemberId, message = "Registration successful. Please check your email to verify your account." });
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Token))
            return BadRequest(new { message = "Email and token are required." });

        var verified = await _service.VerifyEmailAsync(request.Email, request.Token);
        if (!verified)
            return BadRequest(new { message = "Invalid or expired verification token." });

        return Ok(new { message = "Email verified successfully. Your account is now active." });
    }

    [HttpPost]
    public async Task<IActionResult> Approve([FromQuery] int memberId)
    {
        if (memberId <= 0)
            return BadRequest(new { message = "Invalid member ID." });

        var approved = await _service.ApproveAsync(memberId);
        if (!approved)
            return NotFound(new { message = "Member not found." });

        return Ok(new { message = $"Member {memberId} approved." });
    }

    [HttpGet]
    public async Task<IActionResult> GetPending()
    {
        var pending = await _service.GetPendingAsync();
        var result = pending.Select(m => new
        {
            m.Id,
            m.Name,
            m.Email,
            m.Username,
            m.CreateDate
        });
        return Ok(result);
    }
}

public record RegisterRequest(string Name, string Email, string Username, string Password, string? MemberTypeAlias);
public record VerifyEmailRequest(string Email, string Token);

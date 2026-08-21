using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.MemberLogin.Services;

namespace SplatDev.Umbraco.Plugins.MemberLogin.Controllers;

[Route("umbraco/api/memberlogin/[action]")]
public class MemberLoginApiController : ControllerBase
{
    private readonly IMemberLoginService _service;

    public MemberLoginApiController(IMemberLoginService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.LoginAsync(request.Username, request.Password, request.RememberMe);

        if (result.IsLockedOut)
            return StatusCode(423, new { message = result.ErrorMessage });

        if (!result.Success)
            return Unauthorized(new { message = result.ErrorMessage });

        return Ok(new { message = "Login successful." });
    }

    [HttpPost]
    public async Task<IActionResult> Logout()
    {
        await _service.LogoutAsync();
        return Ok(new { message = "Logged out successfully." });
    }

    [HttpPost]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Email is required." });

        await _service.ForgotPasswordAsync(request.Email);
        return Ok(new { message = "If an account with that email exists, a reset link has been sent." });
    }

    [HttpPost]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.ResetPasswordAsync(request.Email, request.Token, request.NewPassword);

        if (!result.Success)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(new { message = "Password has been reset successfully." });
    }
}

public record LoginRequest(string Username, string Password, bool RememberMe);
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Email, string Token, string NewPassword);

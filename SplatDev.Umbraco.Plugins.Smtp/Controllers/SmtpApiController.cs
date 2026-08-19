using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Smtp.Models;
using SplatDev.Umbraco.Plugins.Smtp.Services;

namespace SplatDev.Umbraco.Plugins.Smtp.Controllers;

/// <remarks>
/// Previously anonymous. TestConnection takes a host, port and credentials from the request body and connects out, so an anonymous caller could probe internal hosts and ports through it, or use the site to send mail through a server of their choosing. GetSettings disclosed the configured mail host, username and from-address.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/smtp/[action]")]
public class SmtpApiController : ControllerBase
{
    private readonly ISmtpService _service;

    public SmtpApiController(ISmtpService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetSettings()
    {
        var settings = _service.GetSettings();
        // Mask password before returning
        var masked = new SmtpSettings
        {
            Host = settings.Host,
            Port = settings.Port,
            Username = settings.Username,
            Password = string.IsNullOrEmpty(settings.Password) ? string.Empty : "********",
            EnableSsl = settings.EnableSsl,
            FromEmail = settings.FromEmail,
            FromName = settings.FromName
        };
        return Ok(masked);
    }

    [HttpPost]
    public async Task<IActionResult> TestConnection([FromBody] SmtpSettings settings)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.TestConnectionAsync(settings);
        return Ok(result);
    }

    /// <summary>
    /// Sends a test message using the site's own configured settings.
    /// </summary>
    /// <remarks>
    /// The dashboard calls this rather than TestConnection, because GetSettings masks the
    /// password: posting the masked values back would try to authenticate with the string
    /// "********". This way the credential stays on the server.
    /// </remarks>
    [HttpPost]
    public async Task<IActionResult> SendTest([FromQuery] string? to)
    {
        var result = await _service.SendTestAsync(to);
        return Ok(result);
    }
}

using Microsoft.AspNetCore.Http;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Gdrp.Services;

namespace SplatDev.Umbraco.Plugins.Gdrp.Controllers;

/// <remarks>
/// Previously anonymous. GetRequests returned the outstanding data-subject requests, which are personal data by definition, and CompleteRequest closed them. Recording consent and submitting a request stay open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/gdrp/[action]")]
public class GdrpApiController : ControllerBase
{
    private readonly IGdrpService _service;

    public GdrpApiController(IGdrpService service)
    {
        _service = service;
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> RecordConsent([FromBody] RecordConsentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SessionId))
            return BadRequest("SessionId is required.");

        var validTypes = new[] { "all", "essential", "none" };
        if (!validTypes.Contains(request.ConsentType))
            return BadRequest("ConsentType must be 'all', 'essential', or 'none'.");

        var ip        = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        await _service.RecordConsent(request.SessionId, request.ConsentType, ip, userAgent);
        return Ok();
    }

    [HttpGet]
    public async Task<IActionResult> GetConsent(string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            return BadRequest("sessionId is required.");

        var consent = await _service.GetConsent(sessionId);
        if (consent is null)
            return NotFound();

        return Ok(consent);
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> SubmitRequest([FromBody] SubmitRequestBody body)
    {
        if (string.IsNullOrWhiteSpace(body.Email))
            return BadRequest("Email is required.");

        var validTypes = new[] { "export", "erasure" };
        if (!validTypes.Contains(body.RequestType))
            return BadRequest("RequestType must be 'export' or 'erasure'.");

        var dataRequest = await _service.SubmitDataRequest(body.Email, body.RequestType);
        return Ok(dataRequest);
    }

    [HttpGet]
    public async Task<IActionResult> GetRequests()
    {
        var requests = await _service.GetDataRequests();
        return Ok(requests);
    }

    [HttpPost]
    public async Task<IActionResult> CompleteRequest([FromBody] CompleteRequestBody body)
    {
        await _service.CompleteDataRequest(body.Id);
        return Ok();
    }
}

public record RecordConsentRequest(string SessionId, string ConsentType);
public record SubmitRequestBody(string Email, string RequestType);
public record CompleteRequestBody(int Id);

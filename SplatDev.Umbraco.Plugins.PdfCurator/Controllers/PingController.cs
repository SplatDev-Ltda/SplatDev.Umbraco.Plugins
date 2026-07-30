using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.PdfCurator.Models;

using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Controllers;

/// <summary>
/// Health/handshake endpoint for the Book Library section. Requires a
/// logged-in backoffice user; anonymous API clients receive 401 (not a
/// login redirect) per the PdfCurator Phase A acceptance criteria.
/// </summary>
[ApiController]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/pdfcurator/api/v1")]
public class PingController : ControllerBase
{
    private readonly PdfCuratorOptions _options;

    public PingController(IOptions<PdfCuratorOptions> options)
    {
        _options = options.Value;
    }

    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new
        {
            status = "ok",
            version = "2.0.0",
            apiBase = _options.ApiBase,
        });
    }
}

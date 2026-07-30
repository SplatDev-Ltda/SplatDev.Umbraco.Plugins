using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.PdfCurator.Models;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Controllers;

[Authorize]
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
            version = "2.0.0"
        });
    }
}

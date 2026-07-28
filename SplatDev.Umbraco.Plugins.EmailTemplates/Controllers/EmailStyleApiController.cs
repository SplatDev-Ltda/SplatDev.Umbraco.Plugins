using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Api.Management.Controllers;
using SplatDev.Umbraco.Plugins.EmailTemplates.Models;
using SplatDev.Umbraco.Plugins.EmailTemplates.Services;

namespace SplatDev.Umbraco.Plugins.EmailTemplates.Controllers;

[Route("umbraco/management/api/v1/email-style")]
public class EmailStyleApiController(
    IEmailStyleService styleService,
    ILogger<EmailStyleApiController> logger) : ManagementApiControllerBase
{
    [HttpGet("")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Get() => Ok(styleService.Get());

    [HttpPut("")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Save([FromBody] EmailStyle style)
    {
        try
        {
            var saved = styleService.Save(style);
            return Ok(saved);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to save email style");
            return StatusCode(StatusCodes.Status500InternalServerError, "Failed to save style.");
        }
    }
}

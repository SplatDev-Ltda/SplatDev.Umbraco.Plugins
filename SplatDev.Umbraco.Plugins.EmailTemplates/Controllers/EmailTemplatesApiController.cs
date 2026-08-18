using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
#if NET10_0_OR_GREATER
using Umbraco.Cms.Api.Management.Controllers;
#else
using Umbraco.Cms.Web.BackOffice.Controllers;
#endif
using SplatDev.Umbraco.Plugins.EmailTemplates.Models;
using SplatDev.Umbraco.Plugins.EmailTemplates.Services;

namespace SplatDev.Umbraco.Plugins.EmailTemplates.Controllers;

[Route("umbraco/management/api/v1/email-templates")]
public class EmailTemplatesApiController(
    IEmailTemplateService templateService,
    IEmailStyleService styleService,
    ILogger<EmailTemplatesApiController> logger)
#if NET10_0_OR_GREATER
    : ManagementApiControllerBase
#else
    : UmbracoAuthorizedApiController
#endif
{
    [HttpGet("")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetAll() => Ok(templateService.GetAll());

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        var template = templateService.GetById(id);
        return template is null ? NotFound() : Ok(template);
    }

    [HttpGet("{id:int}/preview")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Preview(int id, [FromQuery] string? variables)
    {
        var template = templateService.GetById(id);
        if (template is null)
            return NotFound();

        var vars = ParseVariables(variables);
        var style = styleService.Get();
        var html = templateService.RenderPreview(template, style, vars);
        return Content(html, "text/html");
    }

    [HttpGet("{id:int}/variables")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetVariables(int id)
    {
        var template = templateService.GetById(id);
        if (template is null)
            return NotFound();

        return Ok(templateService.ExtractVariables(template));
    }

    [HttpPost("create")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult Create([FromBody] EmailTemplate template)
    {
        if (string.IsNullOrWhiteSpace(template.Name) || string.IsNullOrWhiteSpace(template.HtmlBody))
            return BadRequest("Name and HtmlBody are required.");

        try
        {
            var created = templateService.Create(template);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create email template");
            return StatusCode(StatusCodes.Status500InternalServerError, "Failed to create template.");
        }
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] EmailTemplate template)
    {
        var updated = templateService.Update(id, template);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        return templateService.Delete(id) ? NoContent() : NotFound();
    }

    private static Dictionary<string, string>? ParseVariables(string? variables)
    {
        if (string.IsNullOrWhiteSpace(variables))
            return null;

        // Accept key=value pairs separated by semicolons: "MemberName=John;ContractRef=C-001"
        var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var pair in variables.Split(';', StringSplitOptions.RemoveEmptyEntries))
        {
            var idx = pair.IndexOf('=');
            if (idx > 0)
                dict[pair[..idx].Trim()] = pair[(idx + 1)..].Trim();
        }

        return dict.Count > 0 ? dict : null;
    }
}

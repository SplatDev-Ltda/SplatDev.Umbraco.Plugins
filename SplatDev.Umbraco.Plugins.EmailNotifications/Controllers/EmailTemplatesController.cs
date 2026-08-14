using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.EmailNotifications.Models;
using SplatDev.Umbraco.Plugins.EmailNotifications.Services;

namespace SplatDev.Umbraco.Plugins.EmailNotifications.Controllers;

/// <remarks>
/// Previously anonymous. Create, Update and Delete rewrote the site's email templates, and Preview rendered them, for any caller.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/email-templates")]
public class EmailTemplatesController(
    IEmailTemplateService templateService,
    ILogger<EmailTemplatesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await templateService.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var template = await templateService.GetByIdAsync(id, ct);
        return template is null ? NotFound() : Ok(template);
    }

    [HttpGet("{id:int}/preview")]
    public async Task<IActionResult> Preview(int id, [FromQuery] string? variables, CancellationToken ct)
    {
        var template = await templateService.GetByIdAsync(id, ct);
        if (template is null)
            return NotFound();

        var vars = ParseVariables(variables);
        var html = templateService.RenderPreview(template, vars);
        return Content(html, "text/html");
    }

    [HttpGet("{id:int}/variables")]
    public async Task<IActionResult> Variables(int id, CancellationToken ct)
    {
        var template = await templateService.GetByIdAsync(id, ct);
        if (template is null)
            return NotFound();

        return Ok(templateService.ExtractVariables(template));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EmailTemplate template, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(template.Name) || string.IsNullOrWhiteSpace(template.BodyHtml))
            return BadRequest("Name and BodyHtml are required.");

        var created = await templateService.CreateAsync(template, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] EmailTemplate template, CancellationToken ct)
    {
        var updated = await templateService.UpdateAsync(id, template, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var deleted = await templateService.DeleteAsync(id, ct);
        return deleted ? NoContent() : NotFound();
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

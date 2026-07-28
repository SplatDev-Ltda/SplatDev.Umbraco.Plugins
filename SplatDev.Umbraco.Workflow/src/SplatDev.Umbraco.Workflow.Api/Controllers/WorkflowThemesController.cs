using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;

namespace SplatDev.Umbraco.Workflow.Api.Controllers;

[PluginController("SplatDevWorkflow")]
public sealed class WorkflowThemesController : UmbracoAuthorizedApiController
{
    private static readonly IReadOnlyList<string> ThemeNames = new[] { "classic", "modern", "compact" };

    [HttpGet]
    public IActionResult List()
    {
        return Ok(ThemeNames.Select(name => new { name, label = name }));
    }

    [HttpGet("{name}")]
    public IActionResult Get(string name)
    {
        if (!ThemeNames.Contains(name, StringComparer.OrdinalIgnoreCase))
            return NotFound();
        return Ok(new { name, label = name });
    }
}

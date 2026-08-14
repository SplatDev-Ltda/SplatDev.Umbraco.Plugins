using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.PropertiesReport.Services;

namespace SplatDev.Umbraco.Plugins.PropertiesReport.Controllers;

/// <remarks>
/// Previously anonymous. Reported on content type property usage across the site.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/propertiesreport/[action]")]
public class PropertiesReportApiController : ControllerBase
{
    private readonly IPropertiesReportService _service;

    public PropertiesReportApiController(IPropertiesReportService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetReport()
    {
        var result = _service.GetReport();
        return Ok(result);
    }

    [HttpGet]
    public IActionResult GetByContentType([FromQuery] string alias)
    {
        if (string.IsNullOrWhiteSpace(alias))
            return BadRequest("Content type alias is required.");

        var result = _service.GetByContentType(alias);
        return Ok(result);
    }
}

using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.LazyLoad.Models;
using SplatDev.Umbraco.Plugins.LazyLoad.Services;

namespace SplatDev.Umbraco.Plugins.LazyLoad.Controllers;

/// <remarks>
/// Previously anonymous. SaveSettings rewrote the configuration.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/lazyload/[action]")]
public class LazyLoadApiController : ControllerBase
{
    private readonly ILazyLoadService _service;

    public LazyLoadApiController(ILazyLoadService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetSettings()
        => Ok(_service.GetSettings());

    [HttpPost]
    public IActionResult SaveSettings([FromBody] LazyLoadSettings settings)
    {
        _service.SaveSettings(settings);
        return Ok(_service.GetSettings());
    }
}

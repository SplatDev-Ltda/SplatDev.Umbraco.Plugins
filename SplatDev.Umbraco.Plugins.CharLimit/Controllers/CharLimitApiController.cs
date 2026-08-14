using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;

namespace SplatDev.Umbraco.Plugins.CharLimit.Controllers;

/// <remarks>
/// Previously anonymous. GetConfig disclosed the editor configuration.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/charlimit/[action]")]
public class CharLimitApiController : ControllerBase
{
    [HttpGet]
    public IActionResult GetConfig()
    {
        var config = new CharLimitConfiguration();
        return Ok(config);
    }
}

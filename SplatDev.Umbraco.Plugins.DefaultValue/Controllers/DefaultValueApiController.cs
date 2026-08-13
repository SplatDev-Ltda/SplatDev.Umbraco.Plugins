using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.DefaultValue.Models;
using SplatDev.Umbraco.Plugins.DefaultValue.Services;

namespace SplatDev.Umbraco.Plugins.DefaultValue.Controllers;

/// <remarks>
/// Previously anonymous. SaveRule and DeleteRule rewrote default-value rules; ApplyDefaults executed them across content.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/defaultvalue/[action]")]
public class DefaultValueApiController : ControllerBase
{
    private readonly IDefaultValueService _service;

    public DefaultValueApiController(IDefaultValueService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetRules()
    {
        var rules = await _service.GetRulesAsync();
        return Ok(rules);
    }

    [HttpGet]
    public async Task<IActionResult> GetRulesForType([FromQuery] string documentTypeAlias)
    {
        if (string.IsNullOrWhiteSpace(documentTypeAlias))
            return BadRequest("documentTypeAlias is required.");

        var rules = await _service.GetRulesForTypeAsync(documentTypeAlias);
        return Ok(rules);
    }

    [HttpPost]
    public async Task<IActionResult> SaveRule([FromBody] DefaultValueRule rule)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _service.SaveRuleAsync(rule);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteRule([FromQuery] int id)
    {
        await _service.DeleteRuleAsync(id);
        return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> ApplyDefaults(
        [FromQuery] string documentTypeAlias,
        [FromBody] Dictionary<string, object?> properties)
    {
        if (string.IsNullOrWhiteSpace(documentTypeAlias))
            return BadRequest("documentTypeAlias is required.");

        await _service.ApplyDefaultsAsync(documentTypeAlias, properties);
        return Ok(properties);
    }
}

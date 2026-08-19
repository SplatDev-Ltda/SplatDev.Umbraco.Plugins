using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.MemberTypes.Services;

namespace SplatDev.Umbraco.Plugins.MemberTypes.Controllers;

/// <remarks>
/// Previously anonymous. Create, Update and Delete rewrote member type definitions.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/membertypes/[action]")]
public class MemberTypesApiController : ControllerBase
{
    private readonly IMemberTypesService _service;

    public MemberTypesApiController(IMemberTypesService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var types = await _service.GetAllAsync();
        return Ok(types.Select(t => new
        {
            t.Id,
            t.Alias,
            t.Name,
            t.Description,
            t.CreateDate,
            t.UpdateDate,
            PropertyCount = t.PropertyTypes.Count()
        }));
    }

    [HttpGet]
    public async Task<IActionResult> GetByAlias([FromQuery] string alias)
    {
        if (string.IsNullOrWhiteSpace(alias))
            return BadRequest("Alias is required.");

        var type = await _service.GetByAliasAsync(alias);
        if (type is null)
            return NotFound();

        return Ok(new
        {
            type.Id,
            type.Alias,
            type.Name,
            type.Description,
            type.CreateDate,
            type.UpdateDate,
            Properties = type.PropertyTypes.Select(p => new
            {
                p.Alias,
                p.Name,
                p.Description,
                p.Mandatory,
                p.SortOrder
            })
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMemberTypeRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var type = await _service.CreateAsync(request.Alias, request.Name, request.Description ?? string.Empty);
        return Ok(new { type.Id, type.Alias, type.Name });
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromQuery] string alias, [FromBody] UpdateMemberTypeRequest request)
    {
        if (string.IsNullOrWhiteSpace(alias))
            return BadRequest("Alias is required.");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var type = await _service.UpdateAsync(alias, request.Name, request.Description ?? string.Empty);
            return Ok(new { type.Id, type.Alias, type.Name });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromQuery] string alias)
    {
        if (string.IsNullOrWhiteSpace(alias))
            return BadRequest("Alias is required.");

        await _service.DeleteAsync(alias);
        return Ok();
    }
}

public record CreateMemberTypeRequest(string Alias, string Name, string? Description);
public record UpdateMemberTypeRequest(string Name, string? Description);

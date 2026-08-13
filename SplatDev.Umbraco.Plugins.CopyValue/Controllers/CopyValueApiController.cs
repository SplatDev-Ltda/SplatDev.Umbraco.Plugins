using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.CopyValue.Models;
using SplatDev.Umbraco.Plugins.CopyValue.Services;

namespace SplatDev.Umbraco.Plugins.CopyValue.Controllers;

/// <remarks>
/// Previously anonymous. SaveMapping and DeleteMapping rewrote property-copy rules; BulkCopy executed them across content.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/copyvalue/[action]")]
public class CopyValueApiController : ControllerBase
{
    private readonly ICopyValueService _service;

    public CopyValueApiController(ICopyValueService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetMappings()
    {
        var mappings = await _service.GetMappingsAsync();
        return Ok(mappings);
    }

    [HttpGet]
    public async Task<IActionResult> GetMapping([FromQuery] int id)
    {
        var mapping = await _service.GetMappingAsync(id);
        if (mapping is null) return NotFound();
        return Ok(mapping);
    }

    [HttpPost]
    public async Task<IActionResult> SaveMapping([FromBody] CopyMapping mapping)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _service.SaveMappingAsync(mapping);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteMapping([FromQuery] int id)
    {
        await _service.DeleteMappingAsync(id);
        return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> CopyProperties([FromBody] CopyPropertiesRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var ok = await _service.CopyPropertiesAsync(
            request.SourceContentId,
            request.TargetContentId,
            request.Mappings,
            request.Publish);

        if (!ok)
            return BadRequest("Failed to copy properties. Check that source and target content nodes exist.");

        return Ok(new { message = "Properties copied successfully." });
    }

    [HttpPost]
    public async Task<IActionResult> BulkCopy([FromBody] BulkCopyRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var pairs = request.Pairs.Select(p => (p.SourceId, p.TargetId));
            var count = await _service.BulkCopyAsync(request.MappingId, pairs, request.Publish);
            return Ok(new { copied = count, message = $"{count} node(s) processed." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}

public class CopyPropertiesRequest
{
    public int SourceContentId { get; set; }
    public int TargetContentId { get; set; }
    public List<PropertyMapping> Mappings { get; set; } = new();
    public bool Publish { get; set; } = false;
}

public class BulkCopyPair
{
    public int SourceId { get; set; }
    public int TargetId { get; set; }
}

public class BulkCopyRequest
{
    public int MappingId { get; set; }
    public List<BulkCopyPair> Pairs { get; set; } = new();
    public bool Publish { get; set; } = false;
}

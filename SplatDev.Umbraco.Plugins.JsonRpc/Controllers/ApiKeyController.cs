using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.JsonRpc.Services;

namespace SplatDev.Umbraco.Plugins.JsonRpc.Controllers;

/// <summary>
/// Issues and revokes the API keys that authorize the JSON-RPC endpoint.
/// </summary>
/// <remarks>
/// This carried no authorization, which made the JSON-RPC endpoint's own API-key check
/// decorative: anyone could POST here to mint a key — Permissions defaults to "*" — and
/// then call /umbraco/api/jsonrpc/post as a fully authorized client. Guarding the door
/// is pointless while the key cutter stands beside it.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/jsonrpc/apikey/[action]")]
public class ApiKeyController : ControllerBase
{
    private readonly IApiKeyService _service;

    public ApiKeyController(IApiKeyService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var keys = await _service.GetAll();
        return Ok(keys);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateApiKeyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Name is required.");

        var key = await _service.Create(request.Name, request.Permissions ?? "*");
        return Ok(new
        {
            key.Id,
            key.Name,
            key.Permissions,
            key.IsActive,
            key.CreatedAt,
            Note = "The raw key is embedded in Name as '||RAW:<key>'. Store it — it cannot be recovered later."
        });
    }

    [HttpPost]
    public async Task<IActionResult> Revoke([FromBody] RevokeApiKeyRequest request)
    {
        await _service.Revoke(request.Id);
        return Ok();
    }
}

public record CreateApiKeyRequest(string Name, string? Permissions);
public record RevokeApiKeyRequest(int Id);

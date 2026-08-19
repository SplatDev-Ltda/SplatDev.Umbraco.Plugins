using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.JsonRpc.Models;
using SplatDev.Umbraco.Plugins.JsonRpc.Services;

namespace SplatDev.Umbraco.Plugins.JsonRpc.Controllers;

/// <summary>
/// Handles JSON-RPC 2.0 requests at /umbraco/api/jsonrpc/post.
/// Supported methods: content.get, content.search, content.publish
/// </summary>
[Route("umbraco/api/jsonrpc/[action]")]
public class JsonRpcController : ControllerBase
{
    private readonly IJsonRpcService _rpcService;
    private readonly IApiKeyService _apiKeyService;
    private readonly JsonRpcDbContext _db;

    public JsonRpcController(
        IJsonRpcService rpcService,
        IApiKeyService apiKeyService,
        JsonRpcDbContext db)
    {
        _rpcService    = rpcService;
        _apiKeyService = apiKeyService;
        _db            = db;
    }

    // Deliberately anonymous: this endpoint authenticates its callers with the API key in
    // the Authorization header, checked below. It is not a backoffice route and must not be
    // given a backoffice policy, which would lock out every legitimate API client.
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] JsonRpcRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        // Validate API key from Authorization header
        var rawKey = GetApiKeyFromHeader();
        if (rawKey is null)
            return RpcError(request.Id, -32001, "Unauthorized — missing API key", null);

        var apiKey = await _apiKeyService.ValidateKey(rawKey);
        if (apiKey is null)
            return RpcError(request.Id, -32001, "Unauthorized — invalid or revoked API key", null);

        // Log request
        var log = new ApiLog
        {
            ApiKeyId    = apiKey.Id,
            Method      = request.Method ?? string.Empty,
            Endpoint    = "/umbraco/api/jsonrpc/post",
            RequestedAt = DateTime.UtcNow,
            StatusCode  = 200,
            IpAddress   = ip
        };

        object? result;
        try
        {
            result = request.Method switch
            {
                "content.get" => await HandleContentGet(request.Params),
                "content.search" => await HandleContentSearch(request.Params),
                "content.publish" => HandleContentPublish(request.Params),
                _ => throw new NotSupportedException($"Method '{request.Method}' not found.")
            };
        }
        catch (NotSupportedException ex)
        {
            log.StatusCode = 404;
            await _db.ApiLogs.AddAsync(log);
            await _db.SaveChangesAsync();
            return RpcError(request.Id, -32601, ex.Message, null);
        }
        catch (Exception ex)
        {
            log.StatusCode = 500;
            await _db.ApiLogs.AddAsync(log);
            await _db.SaveChangesAsync();
            return RpcError(request.Id, -32603, "Internal error", ex.Message);
        }

        await _db.ApiLogs.AddAsync(log);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            jsonrpc = "2.0",
            id      = request.Id,
            result
        });
    }

    private async Task<object?> HandleContentGet(JsonElement? parameters)
    {
        if (parameters is null) throw new ArgumentException("params required");

        if (parameters.Value.TryGetProperty("id", out var idEl) && idEl.TryGetInt32(out var id))
            return await _rpcService.GetContentById(id);

        if (parameters.Value.TryGetProperty("alias", out var aliasEl))
            return await _rpcService.GetContentByAlias(aliasEl.GetString() ?? string.Empty);

        throw new ArgumentException("params must contain 'id' (int) or 'alias' (string).");
    }

    private async Task<object?> HandleContentSearch(JsonElement? parameters)
    {
        if (parameters is null) throw new ArgumentException("params required");

        if (!parameters.Value.TryGetProperty("term", out var termEl))
            throw new ArgumentException("params must contain 'term'.");

        return await _rpcService.SearchContent(termEl.GetString() ?? string.Empty);
    }

    private object? HandleContentPublish(JsonElement? parameters)
    {
        // Placeholder — publish requires content service with node id
        return new { message = "content.publish is not yet implemented in this version." };
    }

    private string? GetApiKeyFromHeader()
    {
        if (HttpContext.Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            var header = authHeader.ToString();
            if (header.StartsWith("ApiKey ", StringComparison.OrdinalIgnoreCase))
                return header["ApiKey ".Length..].Trim();
            if (header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return header["Bearer ".Length..].Trim();
        }

        if (HttpContext.Request.Headers.TryGetValue("X-Api-Key", out var xApiKey))
            return xApiKey.ToString();

        return null;
    }

    private OkObjectResult RpcError(object? id, int code, string message, object? data)
    {
        return Ok(new
        {
            jsonrpc = "2.0",
            id,
            error = new { code, message, data }
        });
    }
}

public class JsonRpcRequest
{
    public string? Jsonrpc { get; set; }
    public string? Method { get; set; }
    public JsonElement? Params { get; set; }
    public object? Id { get; set; }
}

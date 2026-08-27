#if NET10_0_OR_GREATER
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using SplatDev.Umbraco.Plugins.Getnet.Models;
using SplatDev.Umbraco.Plugins.Getnet.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.Getnet.Controllers;

/// <summary>
/// Backs the Getnet dashboard.
/// </summary>
/// <remarks>
/// Plain ControllerBase with an explicit [Route], as the other payments plugins here do.
/// Umbraco 17 routes nothing by convention, so that attribute is what makes these reachable
/// at all - without it every call 404s while the controller looks perfectly well-formed.
/// </remarks>

[Route("umbraco/api/getnet/[action]")]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
public class GetnetApiController(
    IGetnetTransactionService transactions,
    IConfiguration config) : ControllerBase
{
    /// <summary>Resolves the requested window, defaulting to the last 30 days.</summary>
    private static (DateTime From, DateTime To) Window(int? days)
    {
        var span = Math.Clamp(days ?? 30, 1, 365);
        var to = DateTime.UtcNow.Date.AddDays(1);
        return (to.AddDays(-span), to);
    }

    [HttpGet]
    public async Task<IActionResult> Summary(int? days, CancellationToken ct)
    {
        var (from, to) = Window(days);
        return Ok(await transactions.GetSummaryAsync(from, to, ct));
    }

    [HttpGet]
    public async Task<IActionResult> Timeline(int? days, CancellationToken ct)
    {
        var (from, to) = Window(days);
        return Ok(await transactions.GetTimelineAsync(from, to, ct));
    }

    [HttpGet]
    public async Task<IActionResult> Breakdown(int? days, CancellationToken ct)
    {
        var (from, to) = Window(days);
        return Ok(new
        {
            byStatus = await transactions.GetStatusBreakdownAsync(from, to, ct),
            byMethod = await transactions.GetMethodBreakdownAsync(from, to, ct),
        });
    }

    [HttpGet]
    public async Task<IActionResult> Transactions(
        int? days, string? status, string? method, string? search,
        int page = 1, int pageSize = 25, CancellationToken ct = default)
    {
        var (from, to) = Window(days);
        return Ok(await transactions.ListAsync(from, to, status, method, search, page, pageSize, ct));
    }

    /// <summary>
    /// Whether the gateway is configured, without saying what with.
    /// </summary>
    /// <remarks>
    /// Presence only. A dashboard needs to answer "is this set up?", which a boolean does;
    /// returning the client secret so a screen could pre-fill a field would put it in the
    /// browser, the network log and any screenshot of this page. The seller id is masked
    /// rather than hidden because operators identify an account by its last digits.
    /// </remarks>
    [HttpGet]
    public IActionResult Connection()
    {
        var sellerId = config["Getnet:SellerId"];
        var baseUrl = config["Getnet:BaseUrl"] ?? "https://api-sandbox.getnet.com.br";

        return Ok(new GetnetConnectionStatus(
            Environment: baseUrl.Contains("sandbox", StringComparison.OrdinalIgnoreCase) ? "sandbox" : "production",
            BaseUrl: baseUrl,
            HasSellerId: !string.IsNullOrWhiteSpace(sellerId),
            HasClientId: !string.IsNullOrWhiteSpace(config["Getnet:ClientId"]),
            HasClientSecret: !string.IsNullOrWhiteSpace(config["Getnet:ClientSecret"]),
            MockEnabled: bool.TryParse(config["Getnet:EnableDevelopmentMockWithoutCredentials"], out var mock) && mock,
            SellerIdMasked: Mask(sellerId)));
    }

    private static string? Mask(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Length <= 4 ? new string('*', value.Length) : new string('*', value.Length - 4) + value[^4..];
    }
}
#endif

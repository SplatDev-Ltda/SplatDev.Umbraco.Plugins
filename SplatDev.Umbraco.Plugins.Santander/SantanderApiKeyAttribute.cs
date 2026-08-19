using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using SplatDev.Payments.Santander;

namespace SplatDev.Umbraco.Plugins.Santander;

/// <summary>
/// Requires a valid <c>X-RISIN-Api-Key</c> header on every action of the controller it
/// decorates. Fails closed: when <c>Santander:ApiKey</c> is unset, every request is refused.
/// </summary>
/// <remarks>
/// A filter rather than the previous per-action helper. The helper was called by all
/// eighteen actions — directly by three, and through the shared Execute wrapper by the
/// rest — so this is hardening, not a fix. What it changes is that the guard no longer
/// depends on each new action remembering to call it, the key is compared in constant
/// time rather than with string equality, and an unconfigured key is refused explicitly
/// rather than relying on the empty-string check being reached.
/// </remarks>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = false)]
public sealed class SantanderApiKeyAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var options = context.HttpContext.RequestServices.GetService<SantanderApiOptions>();

        // No configured key means the integration is not set up. Refuse rather than
        // fall open — these endpoints move money.
        if (options is null || string.IsNullOrWhiteSpace(options.ApiKey))
        {
            context.Result = new ObjectResult(new { error = "Santander API key is not configured." })
            {
                StatusCode = StatusCodes.Status401Unauthorized
            };
            return;
        }

        var supplied = context.HttpContext.Request
            .Headers[SantanderBankingApiController.ApiKeyHeader].ToString();

        if (!FixedTimeEquals(supplied, options.ApiKey))
        {
            context.Result = new ObjectResult(new { error = "Missing or invalid API key." })
            {
                StatusCode = StatusCodes.Status401Unauthorized
            };
        }
    }

    /// <summary>
    /// Length-independent constant-time comparison, so neither the key's length nor how
    /// many leading characters matched can be recovered from response timing.
    /// </summary>
    private static bool FixedTimeEquals(string? supplied, string expected)
    {
        if (string.IsNullOrEmpty(supplied)) return false;

        var a = SHA256.HashData(Encoding.UTF8.GetBytes(supplied));
        var b = SHA256.HashData(Encoding.UTF8.GetBytes(expected));
        return CryptographicOperations.FixedTimeEquals(a, b);
    }
}

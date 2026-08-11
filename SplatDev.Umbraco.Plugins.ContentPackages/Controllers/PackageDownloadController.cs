using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.ContentPackages.Entities;
using SplatDev.Umbraco.Plugins.ContentPackages.Models;
using SplatDev.Umbraco.Plugins.ContentPackages.Services;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Controllers;

/// <summary>
/// Public delivery endpoints. Anonymous by necessity — the visitor has no account.
/// Authenticity comes from the signed token instead.
/// </summary>
[ApiController]
[AllowAnonymous]
public class PackageDownloadController : ControllerBase
{
    private readonly IPackageCatalog _catalog;
    private readonly IDownloadTokenService _tokens;
    private readonly ILeadService _leads;
    private readonly ContentPackagesOptions _options;
    private readonly ILogger<PackageDownloadController> _logger;

    public PackageDownloadController(
        IPackageCatalog catalog,
        IDownloadTokenService tokens,
        ILeadService leads,
        IOptions<ContentPackagesOptions> options,
        ILogger<PackageDownloadController> logger)
    {
        _catalog = catalog;
        _tokens = tokens;
        _leads = leads;
        _options = options.Value;
        _logger = logger;
    }

    /// <summary>Signup. Always answers identically so it cannot be used to test addresses.</summary>
    [HttpPost("/umbraco/contentpackages/api/v1/subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeRequest request, CancellationToken ct)
    {
        if (request is null ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Slug))
        {
            return BadRequest(new { error = "Email and package are required." });
        }

        // TODO(CP-8): per-IP and per-email rate limiting before this ships publicly,
        // otherwise the endpoint can be used to mail-bomb a third party. Phase 8.
        if (_catalog.GetBySlug(request.Slug) is null)
        {
            // Unknown package still answers "pending" — a distinct 404 would reveal
            // which slugs exist.
            _logger.LogWarning("Signup for unknown package slug '{Slug}'.", request.Slug);
            return Ok(new { status = "pending" });
        }

        try
        {
            await _leads
                .SubscribeAsync(request.Email, request.Name, request.Slug, HttpContext.Connection.RemoteIpAddress?.ToString(), ct)
                .ConfigureAwait(false);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            // Never let the failure mode differ from the success path.
            _logger.LogError(ex, "Signup failed for package '{Slug}'.", request.Slug);
        }

        return Ok(new { status = "pending" });
    }

    /// <summary>Confirms an address, then sends the welcome email with the links.</summary>
    [HttpGet("/package/confirm")]
    public async Task<IActionResult> Confirm([FromQuery(Name = "t")] string? token, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest();
        }

        var result = await _leads.ConfirmAsync(token!, ct).ConfigureAwait(false);

        // TODO(CP-4): redirect to the article's thank-you page instead of a bare payload.
        return result switch
        {
            ConfirmResult.Confirmed or ConfirmResult.AlreadyConfirmed =>
                Ok(new { status = "confirmed" }),
            ConfirmResult.Expired =>
                StatusCode(StatusCodes.Status410Gone, new { status = "expired" }),
            _ => NotFound(new { status = "invalid" }),
        };
    }

    /// <summary>Serves one asset against a signed link.</summary>
    [HttpGet("/package/{slug}/{kind}")]
    public async Task<IActionResult> Download(
        string slug,
        string kind,
        [FromQuery(Name = "t")] string? leadPublicId,
        [FromQuery(Name = "e")] long expiry,
        [FromQuery(Name = "s")] string? signature,
        CancellationToken ct)
    {
        if (!Enum.TryParse<AssetKind>(kind, ignoreCase: true, out var assetKind))
        {
            return NotFound();
        }

        var validation = _tokens.Validate(leadPublicId, slug, assetKind, expiry, signature);
        if (!validation.Ok)
        {
            _logger.LogWarning(
                "Rejected package download for '{Slug}/{Kind}': {Failure}.", slug, assetKind, validation.Failure);

            // Expiry is the one failure worth distinguishing — the visitor can act on it.
            return validation.Failure == TokenFailure.Expired
                ? StatusCode(StatusCodes.Status410Gone, new { error = "This link has expired. Request a new one." })
                : Forbid();
        }

        var lead = await _leads.GetByPublicIdAsync(validation.LeadPublicId!, ct).ConfigureAwait(false);

        // Revocation is the only stateful check, and it is what makes a stateless
        // signed token revocable at all.
        if (lead is null || lead.Status != LeadStatus.Confirmed)
        {
            return Forbid();
        }

        if (!await _leads.CanDownloadAsync(lead, slug, assetKind, ct).ConfigureAwait(false))
        {
            return StatusCode(StatusCodes.Status429TooManyRequests,
                new { error = "Download limit reached for this link." });
        }

        // Resolved from the catalogue, never composed from the route value — this is what
        // keeps a crafted slug from escaping the package root.
        var package = _catalog.GetBySlug(slug);
        if (package is null || !package.Assets.TryGetValue(assetKind, out var asset))
        {
            return NotFound();
        }

        if (!System.IO.File.Exists(asset.FullPath))
        {
            _logger.LogError("Package asset missing on disk: {Path}", asset.FullPath);
            return NotFound();
        }

        await _leads
            .RecordDownloadAsync(lead, slug, assetKind, HttpContext.Connection.RemoteIpAddress?.ToString(),
                Request.Headers.UserAgent.ToString(), ct)
            .ConfigureAwait(false);

        // enableRangeProcessing so a 2.4 MB deck can resume rather than restart.
        var stream = new FileStream(
            asset.FullPath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize: 64 * 1024, useAsync: true);

        return asset.ServeInline
            ? File(stream, asset.ContentType, enableRangeProcessing: true)
            : File(stream, asset.ContentType, asset.FileName, enableRangeProcessing: true);
    }
}

public class SubscribeRequest
{
    public string Email { get; set; } = string.Empty;

    public string? Name { get; set; }

    /// <summary>Package slug the visitor signed up from.</summary>
    public string Slug { get; set; } = string.Empty;
}

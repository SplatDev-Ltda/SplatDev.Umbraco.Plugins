using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.ContentPackages.Migrations;
using SplatDev.Umbraco.Plugins.ContentPackages.Models;
using SplatDev.Umbraco.Plugins.ContentPackages.Services;

using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Controllers;

/// <summary>Backing API for the Content Packages backoffice section.</summary>
[ApiController]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/contentpackages/api/v1")]
[Produces("application/json")]
public class ContentPackagesBackofficeController : ControllerBase
{
    private readonly IPackageCatalog _catalog;
    private readonly ILeadService _leads;
    private readonly IDbContextFactory<ContentPackagesDbContext> _factory;
    private readonly ContentPackagesOptions _options;

    public ContentPackagesBackofficeController(
        IPackageCatalog catalog,
        ILeadService leads,
        IDbContextFactory<ContentPackagesDbContext> factory,
        IOptions<ContentPackagesOptions> options)
    {
        _catalog = catalog;
        _leads = leads;
        _factory = factory;
        _options = options.Value;
    }

    /// <summary>Configuration state, so the UI can guide setup rather than fail blankly.</summary>
    [HttpGet("status")]
    public IActionResult GetStatus() => Ok(new
    {
        configured = _options.IsConfigured,
        root = _options.Root,
        signingKeySet = !string.IsNullOrWhiteSpace(_options.SigningKey),
        publicBaseUrlSet = !string.IsNullOrWhiteSpace(_options.PublicBaseUrl),
        emailConfigured = false, // TODO(CP-4): reflect the real sender once Phase 4 lands.
        tokenTtlDays = _options.TokenTtlDays,
        maxDownloadsPerAsset = _options.MaxDownloadsPerAsset,
        newsletterListId = _options.NewsletterListId,
    });

    [HttpGet("packages")]
    public IActionResult GetPackages() => Ok(_catalog.GetAll());

    /// <summary>Rescans the root. Mutating, so it must not be a GET.</summary>
    [HttpPost("packages/scan")]
    public IActionResult Scan() => Ok(_catalog.Scan());

    [HttpGet("leads")]
    public async Task<IActionResult> GetLeads([FromQuery] int take = 200, CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var leads = await db.Leads
            .OrderByDescending(l => l.CreatedUtc)
            .Take(Math.Clamp(take, 1, 1000))
            .Select(l => new
            {
                l.Id,
                l.Email,
                l.Name,
                l.Slug,
                Status = l.Status.ToString(),
                l.ConfirmedUtc,
                l.CreatedUtc,
                Downloads = db.Downloads.Count(d => d.LeadId == l.Id),
            })
            .ToListAsync(ct)
            .ConfigureAwait(false);

        return Ok(leads);
    }

    [HttpPost("leads/{id:int}/revoke")]
    public async Task<IActionResult> Revoke(int id, CancellationToken ct)
    {
        await _leads.RevokeAsync(id, ct).ConfigureAwait(false);
        return NoContent();
    }

    [HttpPost("leads/{id:int}/resend")]
    public async Task<IActionResult> Resend(int id, CancellationToken ct)
    {
        await _leads.ResendWelcomeAsync(id, ct).ConfigureAwait(false);
        return NoContent();
    }
}

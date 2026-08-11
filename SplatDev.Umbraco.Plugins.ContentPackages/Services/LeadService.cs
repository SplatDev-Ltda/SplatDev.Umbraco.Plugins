using System.Security.Cryptography;
using System.Text;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.ContentPackages.Entities;
using SplatDev.Umbraco.Plugins.ContentPackages.Migrations;
using SplatDev.Umbraco.Plugins.ContentPackages.Models;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Services;

/// <inheritdoc />
public class LeadService : ILeadService
{
    private readonly IDbContextFactory<ContentPackagesDbContext> _factory;
    private readonly IPackageCatalog _catalog;
    private readonly IDownloadTokenService _tokens;
    private readonly IPackageEmailSender _email;
    private readonly ContentPackagesOptions _options;
    private readonly ILogger<LeadService> _logger;

    public LeadService(
        IDbContextFactory<ContentPackagesDbContext> factory,
        IPackageCatalog catalog,
        IDownloadTokenService tokens,
        IPackageEmailSender email,
        IOptions<ContentPackagesOptions> options,
        ILogger<LeadService> logger)
    {
        _factory = factory;
        _catalog = catalog;
        _tokens = tokens;
        _email = email;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SubscribeAsync(
        string email, string? name, string slug, string? ip, CancellationToken ct = default)
    {
        var normalized = email.Trim().ToLowerInvariant();

        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var lead = await db.Leads
            .FirstOrDefaultAsync(l => l.Email == normalized && l.Slug == slug, ct)
            .ConfigureAwait(false);

        // Re-submitting the form re-sends rather than creating a second row, so one
        // address never ends up with two independent sets of live links.
        if (lead is null)
        {
            lead = new PackageLead
            {
                PublicId = NewPublicId(),
                Email = normalized,
                Name = name,
                Slug = slug,
                SignupIp = ip,
            };
            db.Leads.Add(lead);
        }

        // A confirmed lead that signs up again just gets its links re-sent; it must not
        // be pushed back to Pending.
        if (lead.Status == LeadStatus.Confirmed)
        {
            await db.SaveChangesAsync(ct).ConfigureAwait(false);
            await SendWelcomeAsync(lead, ct).ConfigureAwait(false);
            return;
        }

        var rawToken = NewConfirmToken();
        lead.ConfirmTokenHash = Hash(rawToken);
        lead.ConfirmTokenExpiresUtc = DateTime.UtcNow.AddHours(_options.ConfirmTokenTtlHours);
        lead.Status = LeadStatus.Pending;

        await db.SaveChangesAsync(ct).ConfigureAwait(false);

        var confirmUrl = $"{_options.PublicBaseUrl.TrimEnd('/')}/package/confirm?t={Uri.EscapeDataString(rawToken)}";
        await _email.SendConfirmAsync(lead, confirmUrl, ct).ConfigureAwait(false);
    }

    public async Task<ConfirmResult> ConfirmAsync(string token, CancellationToken ct = default)
    {
        var hash = Hash(token);

        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var lead = await db.Leads
            .FirstOrDefaultAsync(l => l.ConfirmTokenHash == hash, ct)
            .ConfigureAwait(false);

        if (lead is null)
        {
            return ConfirmResult.InvalidToken;
        }

        if (lead.ConfirmTokenExpiresUtc is { } expires && expires <= DateTime.UtcNow)
        {
            return ConfirmResult.Expired;
        }

        // Idempotent inside the TTL: corporate mail scanners pre-fetch links, and a
        // strictly single-use token would be burned before the human ever clicks.
        if (lead.Status == LeadStatus.Confirmed)
        {
            return ConfirmResult.AlreadyConfirmed;
        }

        if (lead.Status == LeadStatus.Revoked)
        {
            return ConfirmResult.InvalidToken;
        }

        lead.Status = LeadStatus.Confirmed;
        lead.ConfirmedUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(ct).ConfigureAwait(false);

        // TODO(CP-3): register with INewsletterService.Subscribe(_options.NewsletterListId,
        // lead.Email, lead.Name) here — only now is the address genuinely opted in.
        // Phase 3 of PLAN.md.

        await SendWelcomeAsync(lead, ct).ConfigureAwait(false);

        return ConfirmResult.Confirmed;
    }

    public async Task<PackageLead?> GetByPublicIdAsync(string publicId, CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        return await db.Leads.FirstOrDefaultAsync(l => l.PublicId == publicId, ct).ConfigureAwait(false);
    }

    public async Task<bool> CanDownloadAsync(
        PackageLead lead, string slug, AssetKind kind, CancellationToken ct = default)
    {
        if (_options.MaxDownloadsPerAsset <= 0)
        {
            return true;
        }

        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var used = await db.Downloads
            .CountAsync(d => d.LeadId == lead.Id && d.Slug == slug && d.Kind == kind, ct)
            .ConfigureAwait(false);

        return used < _options.MaxDownloadsPerAsset;
    }

    public async Task RecordDownloadAsync(
        PackageLead lead, string slug, AssetKind kind, string? ip, string? userAgent,
        CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        db.Downloads.Add(new PackageDownload
        {
            LeadId = lead.Id,
            Slug = slug,
            Kind = kind,
            Ip = ip,
            UserAgent = Truncate(userAgent, 512),
        });

        await db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    public async Task RevokeAsync(int leadId, CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var lead = await db.Leads.FirstOrDefaultAsync(l => l.Id == leadId, ct).ConfigureAwait(false);
        if (lead is null)
        {
            return;
        }

        lead.Status = LeadStatus.Revoked;
        await db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    public async Task ResendWelcomeAsync(int leadId, CancellationToken ct = default)
    {
        await using var db = await _factory.CreateDbContextAsync(ct).ConfigureAwait(false);

        var lead = await db.Leads.FirstOrDefaultAsync(l => l.Id == leadId, ct).ConfigureAwait(false);
        if (lead is null || lead.Status != LeadStatus.Confirmed)
        {
            return;
        }

        await SendWelcomeAsync(lead, ct).ConfigureAwait(false);
    }

    /// <summary>Mints a fresh signed link per asset and hands them to the sender.</summary>
    private async Task SendWelcomeAsync(PackageLead lead, CancellationToken ct)
    {
        var package = _catalog.GetBySlug(lead.Slug);
        if (package is null)
        {
            _logger.LogError("Cannot send welcome for '{Slug}': package not in the catalogue.", lead.Slug);
            return;
        }

        var baseUrl = _options.PublicBaseUrl.TrimEnd('/');
        var urls = package.Assets.Keys.ToDictionary(
            kind => kind.ToString().ToLowerInvariant(),
            kind => $"{baseUrl}/package/{package.Slug}/{kind.ToString().ToLowerInvariant()}" +
                    _tokens.Issue(lead.PublicId, package.Slug, kind));

        await _email.SendWelcomeAsync(lead, urls, ct).ConfigureAwait(false);
    }

    private static string NewPublicId() =>
        Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant();

    private static string NewConfirmToken() =>
        Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();

    /// <summary>
    /// Confirm tokens are stored hashed, so a database leak cannot be replayed to
    /// confirm addresses the attacker does not control.
    /// </summary>
    private static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();

    private static string? Truncate(string? value, int max) =>
        string.IsNullOrEmpty(value) || value.Length <= max ? value : value[..max];
}

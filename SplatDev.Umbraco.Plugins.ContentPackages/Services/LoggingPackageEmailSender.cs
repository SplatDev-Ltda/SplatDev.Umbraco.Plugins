using Microsoft.Extensions.Logging;

using SplatDev.Umbraco.Plugins.ContentPackages.Entities;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Services;

/// <summary>
/// Placeholder sender that logs instead of mailing, so the signup flow is exercisable
/// before templates exist.
/// </summary>
/// <remarks>
/// TODO(CP-4): replace with an implementation over <c>IEmailTemplateService</c> and the
/// configured <c>SplatDev.Messaging</c> provider — Phase 4 of PLAN.md. Registered as the
/// default so a misconfigured site degrades to "no email sent" rather than throwing
/// mid-signup; the warning below is the signal that it is still wired up.
/// </remarks>
public class LoggingPackageEmailSender : IPackageEmailSender
{
    private readonly ILogger<LoggingPackageEmailSender> _logger;

    public LoggingPackageEmailSender(ILogger<LoggingPackageEmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendConfirmAsync(PackageLead lead, string confirmUrl, CancellationToken ct = default)
    {
        _logger.LogWarning(
            "ContentPackages email is not configured. Confirmation for {Email} would link to {Url}",
            lead.Email, confirmUrl);

        return Task.CompletedTask;
    }

    public Task SendWelcomeAsync(
        PackageLead lead, IReadOnlyDictionary<string, string> assetUrls, CancellationToken ct = default)
    {
        _logger.LogWarning(
            "ContentPackages email is not configured. Welcome for {Email} would carry {Count} link(s).",
            lead.Email, assetUrls.Count);

        return Task.CompletedTask;
    }
}

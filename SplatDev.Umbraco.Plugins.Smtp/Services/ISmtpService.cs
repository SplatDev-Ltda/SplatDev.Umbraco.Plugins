using SplatDev.Umbraco.Plugins.Smtp.Models;

namespace SplatDev.Umbraco.Plugins.Smtp.Services;

public interface ISmtpService
{
    /// <summary>The configured settings, with the real password.</summary>
    SmtpSettings GetSettings();

    /// <summary>Sends a test message using settings supplied by the caller.</summary>
    Task<SmtpTestResult> TestConnectionAsync(SmtpSettings settings);

    /// <summary>
    /// Sends a test message using the site's own configured settings.
    /// </summary>
    /// <remarks>
    /// This exists because the dashboard cannot test the live configuration otherwise:
    /// GetSettings masks the password before returning it, so posting those values back
    /// would authenticate with the literal string "********". The credential never has
    /// to leave the server for this path.
    /// </remarks>
    /// <param name="recipient">Where to send. Falls back to the configured from-address.</param>
    Task<SmtpTestResult> SendTestAsync(string? recipient = null);
}

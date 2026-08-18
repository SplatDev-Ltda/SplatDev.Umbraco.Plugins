using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using SplatDev.Umbraco.Plugins.Smtp.Models;

namespace SplatDev.Umbraco.Plugins.Smtp.Services;

public class SmtpService : ISmtpService
{
    private readonly IConfiguration _configuration;

    public SmtpService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public SmtpSettings GetSettings()
    {
        var section = _configuration.GetSection("SmtpSettings");
        return new SmtpSettings
        {
            Host = section["Host"] ?? string.Empty,
            Port = int.TryParse(section["Port"], out var port) ? port : 587,
            Username = section["Username"] ?? string.Empty,
            Password = section["Password"] ?? string.Empty,
            EnableSsl = bool.TryParse(section["EnableSsl"], out var ssl) ? ssl : true,
            FromEmail = section["FromEmail"] ?? string.Empty,
            FromName = section["FromName"] ?? string.Empty
        };
    }

    public Task<SmtpTestResult> SendTestAsync(string? recipient = null)
    {
        var settings = GetSettings();

        if (string.IsNullOrWhiteSpace(settings.Host))
        {
            return Task.FromResult(new SmtpTestResult
            {
                Success = false,
                Message = "No SMTP host is configured.",
                Error = "Set SmtpSettings:Host in configuration."
            });
        }

        if (string.IsNullOrWhiteSpace(settings.Host))
        {
            return Task.FromResult(new SmtpTestResult
            {
                Success = false,
                Message = "No SMTP host is configured.",
                Error = "Set SmtpSettings:Host in configuration."
            });
        }

        if (!MailAddress.TryCreate(settings.FromEmail, out _))
        {
            return Task.FromResult(new SmtpTestResult
            {
                Success = false,
                Message = "No valid SMTP from address is configured.",
                Error = "Set SmtpSettings:FromEmail to a valid email address."
            });
        }

        return TestConnectionAsync(settings, recipient);
    }

    public Task<SmtpTestResult> TestConnectionAsync(SmtpSettings settings) =>
        TestConnectionAsync(settings, recipient: null);

    private async Task<SmtpTestResult> TestConnectionAsync(SmtpSettings settings, string? recipient)
    {
        try
        {
            using var client = new SmtpClient(settings.Host, settings.Port)
            {
                EnableSsl = settings.EnableSsl,
                Credentials = new NetworkCredential(settings.Username, settings.Password),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 10000
            };

            if (!MailAddress.TryCreate(settings.FromEmail, out var from))
            {
                return new SmtpTestResult { Success = false, Message = "Failed to send test email.", Error = "SmtpSettings:FromEmail is not a valid email address." };
            }
            var to = string.IsNullOrWhiteSpace(recipient) ? from : new MailAddress(recipient);

            var message = new MailMessage(from, to)
            {
                Subject = "Umbraco SMTP Test",
                Body = "This is a test email sent from the Umbraco SMTP Plugin to verify your configuration."
            };

            await client.SendMailAsync(message);

            return new SmtpTestResult
            {
                Success = true,
                Message = $"Test email sent successfully to {to.Address}."
            };
        }
        catch (Exception ex)
        {
            return new SmtpTestResult
            {
                Success = false,
                Message = "Failed to send test email.",
                Error = ex.Message
            };
        }
    }
}

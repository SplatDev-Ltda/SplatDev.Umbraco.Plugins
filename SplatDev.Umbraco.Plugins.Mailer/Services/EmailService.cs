using MailKit.Net.Smtp;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using MimeKit;

using Umbraco.Cms.Core.Configuration.Models;
using SplatDev.Umbraco.Plugins.Mailer.Models;

namespace SplatDev.Umbraco.Plugins.Mailer.Services
{
    public class EmailService<T>(ViewRenderService viewRenderer, IOptions<GlobalSettings> settings, ILogger<EmailService<T>> logger) : IEmailService<T> where T : class
    {
        private readonly ViewRenderService _viewRenderer = viewRenderer;
        private readonly IOptions<GlobalSettings> _settings = settings;
        private readonly ILogger<EmailService<T>> _logger = logger;
        public ViewRenderService ViewRenderer => _viewRenderer;

        public async Task<string> GenerateEmailContentAsync(EmailModel<T> model)
        {
            if (model.View == null)
            {
                throw new ArgumentNullException(nameof(model.View));
            }
            return await _viewRenderer.RenderPartialToStringAsync(model.View, model);
        }

        public async Task SendEmailAsync(EmailModel<T> model)
        {
            model.Body ??= await GenerateEmailContentAsync(model);

            var smtp = _settings.Value.Smtp!;

            try
            {
                var message = new MimeMessage();
                message.From.Add(model.From);
                message.To.Add(model.To);
                message.Subject = model.Subject ?? "";

                message.Body = new TextPart("html")
                {
                    Text = model.Body,
                };

                using var client = new SmtpClient();
                var acceptedSecureChannels = SecureSocketOptions.StartTls | SecureSocketOptions.StartTlsWhenAvailable | SecureSocketOptions.SslOnConnect | SecureSocketOptions.Auto;
                client.Connect(smtp.Host, smtp.Port, smtp.SecureSocketOptions == acceptedSecureChannels);
                if (!string.IsNullOrEmpty(smtp.Username) && !string.IsNullOrEmpty(smtp.Password))
                {
                    client.Authenticate(smtp.Username, smtp.Password);
                }

                client.Send(message);
                client.Disconnect(true);
            }
            catch (Exception ex)
            {
                //ignore email if it fails, only log it
                _logger.LogError(ex, "Cannot send mail message");
            }
        }
    }
}

using MailKit.Net.Smtp;

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using MimeKit;

using SplatDev.Umbraco.Common.Extensions;

using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Extensions;
using SplatDev.Umbraco.Plugins.Mailer.Extensions;
using SplatDev.Umbraco.Plugins.Mailer.Models;

namespace SplatDev.Umbraco.Plugins.Mailer.Services
{
    public class MailerService(IConfiguration configuration,
        IWebHostEnvironment webHostEnvironment,
        ILogger<MailerService> logger)
    {
        private readonly IConfigurationSection? _smtpSection = configuration.GetSection("Umbraco:CMS:Global:Smtp");
        private readonly IWebHostEnvironment _webHostEnvironment = webHostEnvironment;
        private readonly ILogger _logger = logger;

        public void Send(MimeMessage? message,
            Action<string>? onCompleted = null)
        {
            if (message is null) return;

            if (_smtpSection is null) throw new MissingMemberException();
            var _settings = new SmtpSettings();
            _smtpSection.Bind(_settings);

            using var client = new SmtpClient();

            try
            {
                client.Connect(_settings.Host, _settings.Port, false);

                if (_settings.Username is not null && _settings.Password is not null)
                    client.Authenticate(_settings.Username, _settings.Password);

                client.Send(message);
                client.Disconnect(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Couldn't send email, check log details");
            }

            if (onCompleted is not null)
                onCompleted(HtmlExtensions.ConvertHtmlToPlainText(message.Body.ToString()));

            _logger.LogInformation("Sent notification to {addresses}: \"{subject}\"", string.Join(", ", message.To.Select(x => x.Name)), message.Subject);
        }

        public MimeMessage GetMessage(
                string subject,
                string html,
                string email
                )
        {
            if (_smtpSection is null) throw new MissingMemberException();
            var _settings = new SmtpSettings();
            _smtpSection.Bind(_settings);

            var toAddress = new MailboxAddress(email, email);
            if (string.IsNullOrEmpty(subject)) subject = "No Subject";
            if (string.IsNullOrEmpty(html)) html = "<p>No content</p>";

            MimeMessage? message = new();
            try
            {
                message.From.Add(new MailboxAddress(_settings!.From, _settings.From));
                message.To.Add(toAddress);
                message.Subject = subject;
                message.Body = new TextPart("html")
                {
                    Text = html,
                };
                return message;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Cannot send mail message");
                return message;
            }
        }


        public string GetMessageHtml(TemplateSource source, string? razorFilename = null, string? filePath = null, IPublishedContent? siteSettings = null, string? propertyAlias = null)
        {
            string html;
            switch (source)
            {
                case TemplateSource.Razor:
                    if (razorFilename is null) throw new MissingFieldException();
                    html = _webHostEnvironment.GetRazorHtml(razorFilename);
                    break;
                case TemplateSource.File:
                    if (filePath is null || razorFilename is null) throw new MissingFieldException();
                    html = _webHostEnvironment.GetFileHtml(filePath, razorFilename);
                    break;
                case TemplateSource.PropertyEditor:
                    if (propertyAlias is null) throw new MissingFieldException();
                    if (siteSettings is null) throw new MissingFieldException();
                    html = siteSettings.HasValue(propertyAlias) ? siteSettings.Value<string>(propertyAlias)! : string.Empty;
                    break;
                case TemplateSource.RawHtml:
                default:
                    html = string.Empty;
                    break;
            }
            return html;
        }

    }
}

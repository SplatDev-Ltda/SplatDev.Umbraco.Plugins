using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.EmailNotifications.Models;
using SplatDev.Umbraco.Plugins.EmailNotifications.Services;
using SplatDev.Umbraco.Plugins.EmailNotifications.Components;
using SplatDev.Umbraco.Plugins.EmailNotifications.Persistence;

namespace SplatDev.Umbraco.Plugins.EmailNotifications.Composers;

public class EmailNotificationsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // DbContext
        builder.Services.AddDbContext<EmailNotificationsDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<EmailNotificationsSchemaComponent>();

        // Mailgun options from config section SplatDev:EmailNotifications:Mailgun
        var mailgunSection = builder.Config.GetSection("SplatDev:EmailNotifications:Mailgun");
        var mailgunOptions = mailgunSection.Get<MailgunOptions>() ?? new MailgunOptions();
        builder.Services.Configure<MailgunOptions>(mailgunSection);

        // HttpClient for Mailgun with Basic auth pre-configured
        builder.Services.AddHttpClient("Mailgun");
        builder.Services.AddSingleton<MailgunMailProvider>();
        builder.Services.AddSingleton<IMailProvider, MailgunMailProvider>();

        // Application services
        builder.Services.AddScoped<IEmailTemplateService, EmailTemplateService>();
        builder.Services.AddScoped<INewsletterService, NewsletterService>();
        builder.Services.AddScoped<INotificationService, NotificationService>();
    }
}

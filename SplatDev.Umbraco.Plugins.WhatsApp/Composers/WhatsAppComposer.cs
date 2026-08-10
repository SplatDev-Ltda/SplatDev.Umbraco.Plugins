using System.Net.Http.Headers;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.WhatsApp.Components;
using SplatDev.Umbraco.Plugins.WhatsApp.Migrations;
using SplatDev.Umbraco.Plugins.WhatsApp.Models;
using SplatDev.Umbraco.Plugins.WhatsApp.Services;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Composers;

public class WhatsAppComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<WhatsAppOptions>(
            builder.Config.GetSection(WhatsAppOptions.SectionName));

        // Paths must be absolute: Umbraco sets the DataDirectory AppDomain property and
        // Microsoft.Data.Sqlite resolves relative Data Source paths against it rather than
        // against the content root.
        var dataDir = Path.Combine(
            builder.Config[HostDefaults.ContentRootKey] ?? Directory.GetCurrentDirectory(),
            "umbraco",
            "Data");

        var dbPath = builder.Config["ConnectionStrings:WhatsAppDb"]
            ?? $"Data Source={Path.Combine(dataDir, "whatsapp.db")}";

        builder.Services.AddDbContextFactory<WhatsAppDbContext>(o => o.UseSqlite(dbPath));

        // The token goes on the handler rather than each call site so it is set in exactly
        // one place and never risks being logged as part of a URL.
        builder.Services.AddHttpClient<IWhatsAppClient, WhatsAppClient>((sp, http) =>
        {
            var options = sp.GetRequiredService<IOptions<WhatsAppOptions>>().Value;

            if (!string.IsNullOrWhiteSpace(options.AccessToken))
            {
                http.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", options.AccessToken);
            }

            http.Timeout = TimeSpan.FromSeconds(30);
        });

        builder.Services.AddScoped<IWhatsAppStore, WhatsAppStore>();

        builder.AddNotificationAsyncHandler<UmbracoApplicationStartingNotification, WhatsAppDatabaseHandler>();
    }
}

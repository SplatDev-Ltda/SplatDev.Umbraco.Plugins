using System.Net.Http.Headers;

using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
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
        // Serve App_Plugins straight out of the assembly. The files are embedded
        // (see the .csproj), so installing the NuGet package copies nothing into the
        // consuming site — there is no content-copy step that can silently not happen,
        // which is exactly how this plugin previously installed with an invisible
        // dashboard.
        //
        // No `root` is passed on purpose: the manifest mirrors the project layout, so an
        // embedded "App_Plugins/WhatsApp/x.js" answers a request for
        // "/App_Plugins/WhatsApp/x.js". Rooting the provider at "App_Plugins" would make
        // it look for "App_Plugins/App_Plugins/..." and every asset would 404.
        builder.Services.Configure<StaticFileOptions>(options =>
        {
            var embedded = new ManifestEmbeddedFileProvider(typeof(WhatsAppComposer).Assembly);

            options.FileProvider = options.FileProvider is null
                ? embedded
                : new CompositeFileProvider(options.FileProvider, embedded);
        });

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

        // Singleton: presence is a single in-process fact shared by the UI heartbeat
        // and the webhook that reads it.
        builder.Services.AddSingleton<IDashboardPresence, DashboardPresence>();
        builder.Services.AddScoped<INewMessageNotifier, NewMessageNotifier>();

        builder.AddNotificationAsyncHandler<UmbracoApplicationStartingNotification, WhatsAppDatabaseHandler>();
    }
}

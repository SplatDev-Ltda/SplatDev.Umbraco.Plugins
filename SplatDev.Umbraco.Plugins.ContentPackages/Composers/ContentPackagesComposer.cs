using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using SplatDev.Umbraco.Plugins.ContentPackages.Components;
using SplatDev.Umbraco.Plugins.ContentPackages.Migrations;
using SplatDev.Umbraco.Plugins.ContentPackages.Models;
using SplatDev.Umbraco.Plugins.ContentPackages.Services;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Composers;

public class ContentPackagesComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<ContentPackagesOptions>(
            builder.Config.GetSection(ContentPackagesOptions.SectionName));

        // Absolute path: Umbraco sets the DataDirectory AppDomain property and
        // Microsoft.Data.Sqlite resolves relative Data Source paths against it rather
        // than against the content root.
        var dataDir = Path.Combine(
            builder.Config[HostDefaults.ContentRootKey] ?? Directory.GetCurrentDirectory(),
            "umbraco",
            "Data");

        var dbPath = builder.Config["ConnectionStrings:ContentPackagesDb"]
            ?? $"Data Source={Path.Combine(dataDir, "contentpackages.db")}";

        builder.Services.AddDbContextFactory<ContentPackagesDbContext>(o => o.UseSqlite(dbPath));

        // Singleton: the catalogue caches a disk scan and guards it with its own lock.
        builder.Services.AddSingleton<IPackageCatalog, PackageCatalog>();
        builder.Services.AddSingleton<IDownloadTokenService, DownloadTokenService>();

        // TODO(CP-4): swap for the EmailTemplates/Messaging-backed sender in Phase 4.
        builder.Services.AddScoped<IPackageEmailSender, LoggingPackageEmailSender>();
        builder.Services.AddScoped<ILeadService, LeadService>();

        builder.AddNotificationAsyncHandler<UmbracoApplicationStartingNotification, ContentPackagesDatabaseHandler>();
    }
}

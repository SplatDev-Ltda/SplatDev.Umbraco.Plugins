using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

#if NET10_0_OR_GREATER
using PdfCurator.Core.Data;
#endif

using SplatDev.Umbraco.Plugins.PdfCurator.Authorization;
using SplatDev.Umbraco.Plugins.PdfCurator.Migrations;
using SplatDev.Umbraco.Plugins.PdfCurator.Models;
using SplatDev.Umbraco.Plugins.PdfCurator.Services;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
#if NET10_0_OR_GREATER
using Umbraco.Cms.Core.Notifications;
#endif

namespace SplatDev.Umbraco.Plugins.PdfCurator.Components;

public class PdfCuratorComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<PdfCuratorOptions>(
            builder.Config.GetSection(PdfCuratorOptions.SectionName));

        // Default DBs live under the host's umbraco/Data. Paths must be ABSOLUTE:
        // Umbraco sets the DataDirectory AppDomain property, and Microsoft.Data.Sqlite
        // resolves relative Data Source paths against it, not the content root.
        var dataDir = Path.Combine(
            builder.Config[HostDefaults.ContentRootKey] ?? Directory.GetCurrentDirectory(),
            "umbraco",
            "Data");

        var memberDbPath = builder.Config["ConnectionStrings:PdfCuratorMemberDb"]
            ?? $"Data Source={Path.Combine(dataDir, "pdfcurator-member.db")}";

        builder.Services.AddDbContextFactory<MemberDbContext>(o =>
            o.UseSqlite(memberDbPath));

        builder.Services.AddScoped<MemberAuthorizeFilter>();

#if NET10_0_OR_GREATER
        var curatorDbPath = builder.Config["ConnectionStrings:PdfCuratorDb"]
            ?? $"Data Source={Path.Combine(dataDir, "pdfcurator.db")}";

        builder.Services.AddDbContextFactory<CuratorDbContext>(o =>
            o.UseSqlite(curatorDbPath));

        builder.AddNotificationAsyncHandler<UmbracoApplicationStartingNotification, PdfCuratorDatabaseHandler>();
#endif

        builder.Services.AddScoped<MemberGroupScopingService>();
        builder.Services.AddMemoryCache();
    }
}

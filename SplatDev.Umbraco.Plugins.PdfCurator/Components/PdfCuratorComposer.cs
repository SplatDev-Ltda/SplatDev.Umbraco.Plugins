using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

#if NET10_0_OR_GREATER
using PdfCurator.Core.Data;
#endif

using SplatDev.Umbraco.Plugins.PdfCurator.Authorization;
using SplatDev.Umbraco.Plugins.PdfCurator.Migrations;
using SplatDev.Umbraco.Plugins.PdfCurator.Models;

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

        var memberDbPath = builder.Config["ConnectionStrings:PdfCuratorMemberDb"]
            ?? "Data Source=Data/Umbraco/pdfcurator-member.db";

        builder.Services.AddDbContextFactory<MemberDbContext>(o =>
            o.UseSqlite(memberDbPath));

        builder.Services.AddScoped<MemberAuthorizeFilter>();

#if NET10_0_OR_GREATER
        var curatorDbPath = builder.Config["ConnectionStrings:PdfCuratorDb"]
            ?? "Data Source=Data/Umbraco/pdfcurator.db";

        builder.Services.AddDbContextFactory<CuratorDbContext>(o =>
            o.UseSqlite(curatorDbPath));

        builder.AddNotificationAsyncHandler<UmbracoApplicationStartingNotification, PdfCuratorDatabaseHandler>();
#endif
    }
}

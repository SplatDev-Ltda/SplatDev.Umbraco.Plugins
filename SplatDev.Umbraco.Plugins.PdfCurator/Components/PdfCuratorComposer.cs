using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using SplatDev.Umbraco.Plugins.PdfCurator.Authorization;
using SplatDev.Umbraco.Plugins.PdfCurator.Migrations;
using SplatDev.Umbraco.Plugins.PdfCurator.Models;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

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
    }
}

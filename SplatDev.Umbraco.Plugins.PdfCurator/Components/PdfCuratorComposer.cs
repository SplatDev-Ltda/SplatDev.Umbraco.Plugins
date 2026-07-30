using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using SplatDev.DigitalBookCurator.Core.Context;
using SplatDev.DigitalBookCurator.Core.Repositories;
using SplatDev.Umbraco.Plugins.PdfCurator.Models;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Components;

public class PdfCuratorComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        IConfiguration config = builder.Config;

        var pdfCuratorOptions = config
            .GetSection(PdfCuratorOptions.SectionName)
            .Get<PdfCuratorOptions>() ?? new PdfCuratorOptions();

        builder.Services.Configure<PdfCuratorOptions>(
            config.GetSection(PdfCuratorOptions.SectionName));

        builder.Services.AddDbContext<CuratorDbContext>(options =>
            options.UseSqlite("name=ConnectionStrings:CuratorDb"));

        builder.Services.AddScoped<IBookRepository, BookRepository>();
        builder.Services.AddScoped<FileManagerService>();
    }
}

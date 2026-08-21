using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.NewsTicker.Models;
using SplatDev.Umbraco.Plugins.NewsTicker.Services;
using SplatDev.Umbraco.Plugins.NewsTicker.Components;
using SplatDev.Umbraco.Plugins.NewsTicker.Persistence;

namespace SplatDev.Umbraco.Plugins.NewsTicker.Composers;

public class NewsTickerComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<NewsTickerSettings>(
            builder.Config.GetSection(NewsTickerSettings.SectionKey));

        builder.Services.AddDbContext<NewsTickerDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<NewsTickerSchemaComponent>();

        builder.Services.AddScoped<INewsTickerService, NewsTickerService>();
    }
}

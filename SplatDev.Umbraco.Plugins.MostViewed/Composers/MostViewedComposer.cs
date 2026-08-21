using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Web.Common.ApplicationBuilder;
using SplatDev.Umbraco.Plugins.MostViewed.Middleware;
using SplatDev.Umbraco.Plugins.MostViewed.Models;
using SplatDev.Umbraco.Plugins.MostViewed.Services;
using SplatDev.Umbraco.Plugins.MostViewed.Components;
using SplatDev.Umbraco.Plugins.MostViewed.Persistence;

namespace SplatDev.Umbraco.Plugins.MostViewed.Composers;

public class MostViewedComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<MostViewedDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<MostViewedSchemaComponent>();

        builder.Services.AddScoped<IMostViewedService, MostViewedService>();
        builder.Services.AddTransient<PageViewMiddleware>();

        builder.Services.Configure<UmbracoPipelineOptions>(options =>
        {
            options.AddFilter(new UmbracoPipelineFilter("MostViewedMiddleware")
            {
                PostPipeline = app => app.UseMiddleware<PageViewMiddleware>()
            });
        });
    }
}

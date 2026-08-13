using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Web.Common.ApplicationBuilder;
using SplatDev.Umbraco.Plugins.Analytics.Middleware;
using SplatDev.Umbraco.Plugins.Analytics.Models;
using SplatDev.Umbraco.Plugins.Analytics.Services;

namespace SplatDev.Umbraco.Plugins.Analytics.Composers;

public sealed class AnalyticsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<AnalyticsDbContext>(options => options.UseSqlServer(builder.Config.GetSection("ConnectionStrings:umbracoDbDSN").Value ?? string.Empty));
        builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
        builder.Services.AddTransient<AnalyticsMiddleware>();
        builder.Services.Configure<UmbracoPipelineOptions>(options => options.AddFilter(new UmbracoPipelineFilter("Analytics") { PostPipeline = app => app.UseMiddleware<AnalyticsMiddleware>() }));
    }
}

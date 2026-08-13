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
        var connectionString = builder.Config.GetSection("ConnectionStrings:umbracoDbDSN").Value;
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Database connection string 'umbracoDbDSN' is missing or empty; Analytics requires the Umbraco SQL Server database.");

        builder.Services.AddDbContext<AnalyticsDbContext>(options => options.UseSqlServer(connectionString));
        builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
        builder.Services.AddTransient<AnalyticsMiddleware>();
        builder.Services.Configure<UmbracoPipelineOptions>(options => options.AddFilter(new UmbracoPipelineFilter("Analytics") { PostPipeline = app => app.UseMiddleware<AnalyticsMiddleware>() }));
    }
}

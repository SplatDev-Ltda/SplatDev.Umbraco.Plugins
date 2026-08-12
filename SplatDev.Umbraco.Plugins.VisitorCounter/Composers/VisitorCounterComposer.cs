using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Web.Common.ApplicationBuilder;
using SplatDev.Umbraco.Plugins.VisitorCounter.Components;
using SplatDev.Umbraco.Plugins.VisitorCounter.Middleware;
using SplatDev.Umbraco.Plugins.VisitorCounter.Models;
using SplatDev.Umbraco.Plugins.VisitorCounter.Services;

namespace SplatDev.Umbraco.Plugins.VisitorCounter.Composers;

public class VisitorCounterSchemaComposer : ComponentComposer<VisitorCounterSchemaComponent>
{
}

public class VisitorCounterComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<VisitorCounterDbContext>(options =>
            options.UseSqlServer(
                builder.Config.GetConnectionString("umbracoDbDSN") ?? string.Empty));

        builder.Services.AddScoped<IVisitorCounterService, VisitorCounterService>();
        builder.Services.AddTransient<VisitorCounterMiddleware>();

        builder.Services.Configure<UmbracoPipelineOptions>(options =>
        {
            options.AddFilter(new UmbracoPipelineFilter("VisitorCounterMiddleware")
            {
                PostPipeline = app => app.UseMiddleware<VisitorCounterMiddleware>()
            });
        });
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Web.Common.ApplicationBuilder;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;
using Umbraco.Cms.Infrastructure.Migrations;
using SplatDev.Umbraco.Plugins.Analytics.Migrations;
using SplatDev.Umbraco.Plugins.Analytics.Middleware;
using SplatDev.Umbraco.Plugins.Analytics.Models;
using SplatDev.Umbraco.Plugins.Analytics.Services;

namespace SplatDev.Umbraco.Plugins.Analytics.Composers;

public sealed class AnalyticsComposer : ComponentComposer<AnalyticsMigrationComponent>
{
    public override void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<AnalyticsDbContext>(options => options.UseSqlServer(builder.Config.GetSection("ConnectionStrings:umbracoDbDSN").Value ?? string.Empty));
        builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
        builder.Services.AddTransient<AnalyticsMiddleware>();
        builder.Services.Configure<UmbracoPipelineOptions>(options => options.AddFilter(new UmbracoPipelineFilter("Analytics") { PostPipeline = app => app.UseMiddleware<AnalyticsMiddleware>() }));
    }
}

public sealed class AnalyticsMigrationComponent(
    ICoreScopeProvider coreScopeProvider,
    IMigrationPlanExecutor migrationPlanExecutor,
    IKeyValueService keyValueService,
    IRuntimeState runtimeState) : IComponent
{
    public void Initialize()
    {
        if (runtimeState.Level < RuntimeLevel.Run) return;
        var plan = new MigrationPlan("SplatDev.Analytics");
        plan.From(string.Empty).To<AnalyticsMigration>("analytics-db");
        new Upgrader(plan).Execute(migrationPlanExecutor, coreScopeProvider, keyValueService);
    }

    public void Terminate() { }
}

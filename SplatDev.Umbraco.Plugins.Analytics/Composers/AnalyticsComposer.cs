using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Plugins.Analytics.Configuration;
using SplatDev.Umbraco.Plugins.Analytics.Data;
using SplatDev.Umbraco.Plugins.Analytics.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extensions;

namespace SplatDev.Umbraco.Plugins.Analytics.Composers;

/// <summary>Registers the services, options and schema this plugin needs.</summary>
public class AnalyticsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<AnalyticsOptions>(
            builder.Config.GetSection(AnalyticsOptions.SectionName));

        // Share Umbraco's connection rather than asking for a second one: the tables live
        // in Umbraco's database, and a plugin that needs its own connection string is a
        // plugin most sites never finish installing.
        var connectionString = builder.Config.GetUmbracoConnectionString(out var providerName);

        builder.Services.AddDbContext<AnalyticsDbContext>(options =>
        {
            if (string.IsNullOrWhiteSpace(connectionString))
                return;

            if (providerName?.Contains("Sqlite", StringComparison.OrdinalIgnoreCase) == true)
                options.UseSqlite(connectionString);
            else
                options.UseSqlServer(connectionString);
        });

        builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
        builder.Services.AddSingleton<IGeoLookup, Ip2LocationGeoLookup>();
        builder.Services.AddHostedService<AnalyticsRetentionService>();

        builder.Components().Append<Components.AnalyticsSchemaComponent>();
    }
}

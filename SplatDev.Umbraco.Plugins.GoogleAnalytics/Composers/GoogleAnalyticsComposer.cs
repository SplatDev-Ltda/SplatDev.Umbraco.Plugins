using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.GoogleAnalytics.Services;

namespace SplatDev.Umbraco.Plugins.GoogleAnalytics.Composers;

public class GoogleAnalyticsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IGoogleAnalyticsService, GoogleAnalyticsService>();
    }
}

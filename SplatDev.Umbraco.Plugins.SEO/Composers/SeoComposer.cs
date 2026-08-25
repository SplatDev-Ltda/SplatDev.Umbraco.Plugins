using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Plugins.SEO.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.SEO.Composers;

public class SeoComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // SeoAnalyzer holds no state and reads no configuration, so one instance serves
        // every request. SeoApiController takes it by constructor injection; without this
        // the controller cannot be activated and every call to the dashboard's API 500s.
        builder.Services.AddSingleton<SeoAnalyzer>();
    }
}

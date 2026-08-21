using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.SEO.Composers;

public class SeoComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // SEO models and extension methods are static — no DI registration required.
        // The App_Plugins dashboard is auto-discovered by Umbraco via umbraco-package.json.
    }
}

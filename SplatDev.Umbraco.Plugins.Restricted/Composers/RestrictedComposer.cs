using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Restricted.Services;

namespace SplatDev.Umbraco.Plugins.Restricted.Composers;

public class RestrictedComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IRestrictedContentService, RestrictedContentService>();
    }
}

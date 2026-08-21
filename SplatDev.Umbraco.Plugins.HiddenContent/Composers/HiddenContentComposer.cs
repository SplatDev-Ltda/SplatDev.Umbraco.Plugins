using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.HiddenContent.Services;

namespace SplatDev.Umbraco.Plugins.HiddenContent.Composers;

public class HiddenContentComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IHiddenContentService, HiddenContentService>();
    }
}

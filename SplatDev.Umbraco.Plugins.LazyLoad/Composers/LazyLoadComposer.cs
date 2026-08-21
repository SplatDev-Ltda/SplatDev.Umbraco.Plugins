using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.LazyLoad.Services;
using SplatDev.Umbraco.Plugins.LazyLoad.TagHelpers;

namespace SplatDev.Umbraco.Plugins.LazyLoad.Composers;

public class LazyLoadComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<ILazyLoadService, LazyLoadService>();
        builder.Services.AddTransient<LazyImageTagHelper>();
        builder.Services.AddTransient<LazyIframeTagHelper>();
    }
}

using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.LiveVideo.Services;

namespace SplatDev.Umbraco.Plugins.LiveVideo.Composers;

public class LiveVideoComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<ILiveVideoService, LiveVideoService>();
    }
}

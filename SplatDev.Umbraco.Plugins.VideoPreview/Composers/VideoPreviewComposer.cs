using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.VideoPreview.Services;

namespace SplatDev.Umbraco.Plugins.VideoPreview.Composers;

public class VideoPreviewComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddHttpClient();
        builder.Services.AddScoped<IVideoPreviewService, VideoPreviewService>();
    }
}

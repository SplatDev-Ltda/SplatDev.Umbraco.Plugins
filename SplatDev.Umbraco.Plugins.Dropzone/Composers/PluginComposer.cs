using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Dropzone.Services;

using SplatDev.Umbraco.Plugins.Dropzone.Models;
namespace SplatDev.Umbraco.Plugins.Dropzone.Composers;

public class PluginComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<DropzoneOptions>(
            builder.Config.GetSection(DropzoneOptions.SectionKey));

        builder.Services.AddScoped<IDropzoneService, DropzoneService>();
    }
}

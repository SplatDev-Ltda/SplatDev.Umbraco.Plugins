using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Plugins.IspServices.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.IspServices.Composers;

public class IspServicesComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IISPService, ISPService>();
    }
}

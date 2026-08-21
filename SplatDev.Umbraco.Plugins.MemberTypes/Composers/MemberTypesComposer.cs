using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.MemberTypes.Services;

namespace SplatDev.Umbraco.Plugins.MemberTypes.Composers;

public class MemberTypesComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IMemberTypesService, MemberTypesService>();
    }
}

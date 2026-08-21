using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.DictionaryManager.Services;

namespace SplatDev.Umbraco.Plugins.DictionaryManager.Composers;

public class DictionaryManagerComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IDictionaryManagerService, DictionaryManagerService>();
    }
}

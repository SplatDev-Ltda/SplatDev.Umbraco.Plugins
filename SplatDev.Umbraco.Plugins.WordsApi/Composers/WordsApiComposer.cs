using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Plugins.WordsApi.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.WordsApi.Composers;

public class WordsApiComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IWordsApiService, WordsApiService>();
    }
}

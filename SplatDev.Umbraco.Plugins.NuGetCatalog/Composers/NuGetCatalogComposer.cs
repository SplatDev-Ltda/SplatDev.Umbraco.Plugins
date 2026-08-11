using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.NuGetCatalog.Models;
using SplatDev.Umbraco.Plugins.NuGetCatalog.Services;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.NuGetCatalog.Composers;

public class NuGetCatalogComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<NuGetCatalogOptions>(
            builder.Config.GetSection(NuGetCatalogOptions.SectionName));

        builder.Services.AddMemoryCache();

        builder.Services.AddHttpClient<INuGetSearchClient, NuGetSearchClient>(http =>
        {
            // nuget.org asks for a User-Agent it can attribute; an unidentified client is
            // the sort of thing that gets rate limited first.
            http.DefaultRequestHeaders.UserAgent.ParseAdd("SplatDev.Umbraco.Plugins.NuGetCatalog");
            http.Timeout = TimeSpan.FromSeconds(20);
        });

        builder.Services.AddSingleton<ICatalogStore>(sp =>
        {
            // Absolute path: Umbraco sets the DataDirectory AppDomain property, and a
            // relative path here would resolve against it rather than the content root.
            var dataDirectory = Path.Combine(
                builder.Config[HostDefaults.ContentRootKey] ?? Directory.GetCurrentDirectory(),
                "umbraco",
                "Data");

            return new CatalogStore(
                sp.GetRequiredService<IOptions<NuGetCatalogOptions>>(),
                sp.GetRequiredService<ILogger<CatalogStore>>(),
                dataDirectory);
        });

        builder.Services.AddSingleton<ICatalogService, CatalogService>();
    }
}

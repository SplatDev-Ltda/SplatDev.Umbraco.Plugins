using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.MemberRegistration.Composers;

/// <summary>
/// Serves this plugin's App_Plugins assets straight out of the assembly.
/// </summary>
/// <remarks>
/// The files are embedded (see the .csproj), so installing the NuGet package copies
/// nothing into the consuming site. There is no content-copy step that can silently
/// fail, and no loose files to drift or clean up.
///
/// No <c>root</c> is passed on purpose: the embedded manifest mirrors the project
/// layout, so "App_Plugins/Name/x.js" answers a request for "/App_Plugins/Name/x.js".
/// Rooting the provider at "App_Plugins" makes it look for "App_Plugins/App_Plugins/..."
/// and every asset 404s.
/// </remarks>
public class EmbeddedAppPluginsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<StaticFileOptions>(options =>
        {
            var embedded = new ManifestEmbeddedFileProvider(
                typeof(EmbeddedAppPluginsComposer).Assembly);

            options.FileProvider = options.FileProvider is null
                ? embedded
                : new CompositeFileProvider(options.FileProvider, embedded);
        });
    }
}

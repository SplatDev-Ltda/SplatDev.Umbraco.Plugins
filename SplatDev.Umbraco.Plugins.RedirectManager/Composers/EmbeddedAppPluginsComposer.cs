using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

#if NET10_0_OR_GREATER
using System.Text.Json;

using Umbraco.Cms.Core.Manifest;
using Umbraco.Cms.Infrastructure.Manifest;
#endif

namespace SplatDev.Umbraco.Plugins.RedirectManager.Composers;

/// <summary>
/// Serves this plugin's App_Plugins assets straight out of the assembly, and tells the
/// backoffice they exist.
/// </summary>
/// <remarks>
/// The files are embedded (see the .csproj), so installing the NuGet package copies
/// nothing into the consuming site. There is no content-copy step that can silently
/// fail, and no loose files to drift or clean up.
///
/// Serving the files is only half of it. Umbraco discovers backoffice extensions by
/// enumerating physical directories under App_Plugins, so an embedded-only plugin stays
/// invisible however happily its umbraco-package.json answers over HTTP - the section
/// simply never appears. The reader below closes that gap by handing Umbraco the
/// manifest directly.
///
/// No <c>root</c> is passed to the file provider on purpose: the embedded manifest
/// mirrors the project layout, so "App_Plugins/Name/x.js" answers a request for
/// "/App_Plugins/Name/x.js". Rooting it at "App_Plugins" makes it look for
/// "App_Plugins/App_Plugins/..." and every asset 404s.
/// </remarks>
public class EmbeddedAppPluginsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // Configure<IWebHostEnvironment> rather than a plain Configure: the web root
        // provider has to be resolved from the environment, see below.
        builder.Services.AddOptions<StaticFileOptions>()
            .Configure<IWebHostEnvironment>((options, env) =>
            {
                var embedded = new ManifestEmbeddedFileProvider(
                    typeof(EmbeddedAppPluginsComposer).Assembly);

                // Compose, never replace. A null FileProvider does not mean "nothing is
                // serving files" - it means the static-file middleware will fall back to
                // the web root. Assigning ours straight into it therefore unmounts
                // wwwroot for the whole site: every asset 404s, the backoffice included.
                options.FileProvider = new CompositeFileProvider(
                    options.FileProvider ?? env.WebRootFileProvider,
                    embedded);
            });

#if NET10_0_OR_GREATER
        builder.Services.AddSingleton<IPackageManifestReader, EmbeddedPackageManifestReader>();
#endif
    }
}

#if NET10_0_OR_GREATER
/// <summary>
/// Reads this assembly's embedded umbraco-package.json files so the backoffice registers
/// the extensions with nothing on disk.
/// </summary>
internal sealed class EmbeddedPackageManifestReader : IPackageManifestReader
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public Task<IEnumerable<PackageManifest>> ReadPackageManifestsAsync()
    {
        var provider = new ManifestEmbeddedFileProvider(
            typeof(EmbeddedPackageManifestReader).Assembly);

        var manifests = new List<PackageManifest>();

        foreach (var entry in provider.GetDirectoryContents("App_Plugins"))
        {
            if (!entry.IsDirectory)
            {
                continue;
            }

            var file = provider.GetFileInfo($"App_Plugins/{entry.Name}/umbraco-package.json");
            if (!file.Exists)
            {
                continue;
            }

            PackageManifest? manifest;
            try
            {
                using var stream = file.CreateReadStream();
                manifest = JsonSerializer.Deserialize<PackageManifest>(stream, SerializerOptions);
            }
            catch (JsonException)
            {
                // A malformed manifest must not take the site down at startup: skip it
                // and let the rest of the backoffice load.
                continue;
            }

            if (manifest is not null)
            {
                manifests.Add(manifest);
            }
        }

        return Task.FromResult<IEnumerable<PackageManifest>>(manifests);
    }
}
#endif

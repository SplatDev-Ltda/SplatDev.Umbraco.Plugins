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

namespace SplatDev.Umbraco.Plugins.EmailNotifications.Composers;

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
                var embedded = EmbeddedAssets.CreateFileProvider();
                if (embedded is null)
                {
                    return;
                }

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

/// <summary>
/// Locates this assembly's embedded App_Plugins content.
/// </summary>
internal static class EmbeddedAssets
{
    private const string AppPlugins = "App_Plugins";

    private static readonly System.Reflection.Assembly Assembly =
        typeof(EmbeddedAssets).Assembly;

    /// <summary>
    /// Builds a file provider over the embedded assets, or null when there are none.
    /// </summary>
    /// <remarks>
    /// ManifestEmbeddedFileProvider needs a manifest that the
    /// Microsoft.Extensions.FileProviders.Embedded build task is supposed to generate, and
    /// its constructor throws when that manifest is absent. It is absent more often than
    /// expected - several plugins set GenerateEmbeddedFilesManifest and reference the
    /// package and still ship without one - and because this runs from a composer, the
    /// exception surfaced as "Application startup exception" and took the entire site down
    /// rather than just disabling one plugin's assets.
    ///
    /// So: prefer the manifest provider when it works, fall back to the plain
    /// EmbeddedFileProvider (which needs no manifest, just the resources) when it does
    /// not, and never let either failure escape.
    /// </remarks>
    public static IFileProvider? CreateFileProvider()
    {
        try
        {
            return new ManifestEmbeddedFileProvider(Assembly);
        }
        catch (InvalidOperationException)
        {
            // No manifest was embedded. EmbeddedFileProvider maps a request path onto a
            // resource name by swapping '/' for '.', which is exactly how these assets are
            // named, so "/App_Plugins/Name/x.js" still resolves.
            try
            {
                return new EmbeddedFileProvider(Assembly, Assembly.GetName().Name);
            }
            catch (Exception)
            {
                return null;
            }
        }
        catch (Exception)
        {
            return null;
        }
    }

    /// <summary>
    /// Returns every embedded umbraco-package.json as an open stream.
    /// </summary>
    /// <remarks>
    /// Reads the resource names directly rather than walking directories through a file
    /// provider: directory enumeration only works with a generated manifest, which is the
    /// very thing that cannot be relied on here.
    /// </remarks>
    public static IEnumerable<(string Folder, Stream Stream)> OpenPackageManifests()
    {
        const string Suffix = ".umbraco-package.json";
        var marker = $".{AppPlugins}.";

        foreach (var name in Assembly.GetManifestResourceNames())
        {
            if (!name.EndsWith(Suffix, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            // Only this plugin's own App_Plugins content, not anything else that happens
            // to be embedded with a similar name.
            var at = name.IndexOf(marker, StringComparison.Ordinal);
            if (at < 0)
            {
                continue;
            }

            // Everything between ".App_Plugins." and the suffix is the folder name, which is
            // not always a single segment - EmailTemplates ships as "SplatDev.EmailTemplates",
            // so splitting on '.' would keep only half of it.
            var start = at + marker.Length;
            var folder = name.Substring(start, name.Length - start - Suffix.Length);

            var stream = Assembly.GetManifestResourceStream(name);
            if (stream is not null)
            {
                yield return (folder, stream);
            }
        }
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

    private readonly IWebHostEnvironment _environment;

    public EmbeddedPackageManifestReader(IWebHostEnvironment environment) =>
        _environment = environment;

    public Task<IEnumerable<PackageManifest>> ReadPackageManifestsAsync()
    {
        var manifests = new List<PackageManifest>();

        foreach (var (folder, stream) in EmbeddedAssets.OpenPackageManifests())
        {
            using (stream)
            {
                // Umbraco enumerates physical App_Plugins directories itself, so a site that
                // still has a real folder for this plugin - one an older content-copying
                // release left behind - registers every alias twice. The backoffice then
                // logs "Extension with alias X is already registered" and drops one, which
                // is how staging ended up with fifteen of them. Let the physical copy win:
                // it is the one Umbraco found on its own, and yielding to it is what makes
                // an upgrade over such a site quiet rather than noisy.
                if (HasPhysicalCopy(folder))
                {
                    continue;
                }

                try
                {
                    var manifest = JsonSerializer.Deserialize<PackageManifest>(stream, SerializerOptions);
                    if (manifest is not null)
                    {
                        manifests.Add(manifest);
                    }
                }
                catch (JsonException)
                {
                    // A malformed manifest must not take the site down at startup: skip it
                    // and let the rest of the backoffice load.
                }
            }
        }

        return Task.FromResult<IEnumerable<PackageManifest>>(manifests);
    }

    private bool HasPhysicalCopy(string folder)
    {
        try
        {
            var root = _environment.ContentRootPath;
            return !string.IsNullOrEmpty(root)
                && File.Exists(Path.Combine(root, "App_Plugins", folder, "umbraco-package.json"));
        }
        catch (Exception)
        {
            // A path this plugin cannot probe is no reason to fail startup, and registering
            // the embedded manifest is the safe side of the decision.
            return false;
        }
    }
}
#endif

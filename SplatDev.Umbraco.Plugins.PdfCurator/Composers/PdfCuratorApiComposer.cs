#if NET10_0_OR_GREATER
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PdfCurator.Core.Pipeline;
using PdfCurator.Web;
using SplatDev.Umbraco.Plugins.PdfCurator.Models;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Web.Common.ApplicationBuilder;
using Umbraco.Cms.Web.Common.Authorization;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Composers;

/// <summary>
/// Hosts the PdfCurator.Web API inside Umbraco, under this plugin's own route prefix.
/// </summary>
/// <remarks>
/// The backoffice bundle this plugin ships calls /stats/overview, /stats/categories and
/// /stats/timeline. Those endpoints live in PdfCurator.Web, which the plugin already
/// references, but nothing ever mapped them into the Umbraco host - so every call answered
/// 404 and the dashboard reported zero for every figure whatever the library held. The only
/// controller here was a ping.
///
/// The prefix comes from PdfCuratorOptions.ApiBase, which already existed and already held
/// this value, rather than being written out a second time here.
///
/// The endpoints are put behind BackOfficeAccess deliberately. AddPdfCuratorWeb registers
/// its view and admin policies as RequireAssertion(_ => true), which is reasonable for the
/// standalone app that owns its own host, but mapping that into Umbraco unchanged would
/// expose the whole book library - listings, uploads and scans - to anonymous callers.
/// </remarks>
public class PdfCuratorApiComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        var options = new PdfCuratorOptions();
        builder.Config.GetSection(PdfCuratorOptions.SectionName).Bind(options);

        // PdfCurator.Core resolves every path against Root, and its services take
        // CuratorOptions by constructor injection - without this registration the container
        // fails validation at startup rather than at first use.
        var contentRoot = builder.Config[HostDefaults.ContentRootKey] ?? Directory.GetCurrentDirectory();
        var root = Path.IsPathRooted(options.LibraryRoot)
            ? options.LibraryRoot
            : Path.Combine(contentRoot, options.LibraryRoot);

        var curator = new CuratorOptions { Root = root };
        // The pipeline writes into these; the standalone host creates them for the same
        // reason. Missing directories surface much later and much less clearly.
        foreach (var path in new[] { curator.Root, curator.LibraryPath, curator.ExcludedPath, curator.QuarantinePath })
        {
            Directory.CreateDirectory(path);
        }

        builder.Services.AddSingleton(curator);
        builder.Services.AddPdfCuratorWeb();

        builder.Services.Configure<UmbracoPipelineOptions>(pipeline =>
        {
            pipeline.AddFilter(new UmbracoPipelineFilter(nameof(PdfCuratorApiComposer))
            {
                Endpoints = app => app.UseEndpoints(endpoints =>
                    endpoints.MapPdfCuratorApi(options.ApiBase)
                             .RequireAuthorization(AuthorizationPolicies.BackOfficeAccess)),
            });
        });
    }
}
#endif

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Polly;
using Polly.Extensions.Http;
using SplatDev.Umbraco.Plugins.D4Sign.Models;
using SplatDev.Umbraco.Plugins.D4Sign.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.D4Sign.Composers;

/// <summary>
/// Registers all D4Sign plugin services into the Umbraco DI container.
/// Discovered automatically by Umbraco's <see cref="IComposer"/> scan on startup —
/// no explicit registration required in the host application when installed via NuGet.
/// </summary>
public class D4SignComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // ── Serve embedded App_Plugins as static files ─────────────────────────
        // Registers the assembly's embedded resources under /App_Plugins/D4Sign/
        // so the Lit 3 dashboard.js and umbraco-package.json are accessible at
        // runtime without copying files to wwwroot. Works for both direct project
        // references and NuGet package installs.
        builder.Services.Configure<StaticFileOptions>(opts =>
        {
            var embeddedProvider = new ManifestEmbeddedFileProvider(typeof(EmbeddedAppPluginsComposer).Assembly);

            opts.FileProvider = opts.FileProvider is null
                ? embeddedProvider
                : new CompositeFileProvider(opts.FileProvider, embeddedProvider);
        });

        // ── Options ────────────────────────────────────────────────────────────
        builder.Services.Configure<D4SignOptions>(
            builder.Config.GetSection(D4SignOptions.SectionKey));

        // ── HTTP client ────────────────────────────────────────────────────────
        builder.Services.AddTransient<D4SignAuthHandler>();

        builder.Services.AddHttpClient(D4SignDefaults.HttpClientName, (sp, client) =>
        {
            var opts = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<D4SignOptions>>().Value;
            client.BaseAddress = new Uri(opts.BaseUrl);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        })
        .AddHttpMessageHandler<D4SignAuthHandler>()
        .AddPolicyHandler(RetryPolicy());

        // ── Core service ───────────────────────────────────────────────────────
        builder.Services.AddScoped<ID4SignService, D4SignService>();
    }

    /// <summary>Three retries with exponential backoff on transient HTTP errors.</summary>
    private static IAsyncPolicy<HttpResponseMessage> RetryPolicy() =>
        HttpPolicyExtensions
            .HandleTransientHttpError()
            .WaitAndRetryAsync(3, attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)));
}

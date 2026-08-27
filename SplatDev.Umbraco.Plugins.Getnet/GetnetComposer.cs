using System;
using System.Net;
using System.Net.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.Extensions.Http;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Payments.Getnet;
#if NET10_0_OR_GREATER
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using SplatDev.Umbraco.Plugins.Getnet.Components;
using SplatDev.Umbraco.Plugins.Getnet.Models;
using SplatDev.Umbraco.Plugins.Getnet.Services;
#endif

namespace SplatDev.Umbraco.Plugins.Getnet;

/// <summary>
/// Registers the Getnet (Santander acquirer) SDK: binds the <c>Getnet</c> config section into
/// <see cref="GetnetApiOptions"/>, registers <see cref="GetnetApiClient"/>, and configures the named
/// <c>"Getnet"</c> <see cref="HttpClient"/> (no client certificate — Getnet uses OAuth2 + HTTP Basic).
///
/// Application-specific pieces (webhook handling, backoffice API, and any payment orchestration over the
/// host's own tables) stay in the consuming app and depend on <see cref="GetnetApiClient"/>.
/// </summary>
public sealed class GetnetComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        var cfg = builder.Config;

        var options = new GetnetApiOptions
        {
            BaseUrl = cfg["Getnet:BaseUrl"] ?? "https://api-sandbox.getnet.com.br",
            TokenPath = cfg["Getnet:TokenPath"] ?? "/auth/oauth/v2/token",
            SellerId = cfg["Getnet:SellerId"] ?? string.Empty,
            ClientId = cfg["Getnet:ClientId"] ?? string.Empty,
            ClientSecret = cfg["Getnet:ClientSecret"] ?? string.Empty,
            EnableDevelopmentMockWithoutCredentials =
                bool.TryParse(cfg["Getnet:EnableDevelopmentMockWithoutCredentials"], out var mock) && mock,
            PixPaymentPath = cfg["Getnet:PixPaymentPath"] ?? "/v1/payment/qrcode/pix",
            BoletoPaymentPath = cfg["Getnet:BoletoPaymentPath"] ?? "/v1/payment/boleto",
            PaymentLinkPath = cfg["Getnet:PaymentLinkPath"] ?? "/v1/payment-link",
            PaymentStatusPath = cfg["Getnet:PaymentStatusPath"] ?? "/v1/payment/credit/",
            PaymentsListPath = cfg["Getnet:PaymentsListPath"] ?? "/v1/payment/credit",
            PaymentsFromDateQueryParam = cfg["Getnet:PaymentsFromDateQueryParam"] ?? "start_date",
            PaymentsToDateQueryParam = cfg["Getnet:PaymentsToDateQueryParam"] ?? "end_date",
        };

        builder.Services.AddSingleton(options);

#if NET10_0_OR_GREATER
        // The dashboard reads a local ledger of payment attempts: Getnet answers about one
        // payment at a time and offers no history to page through, so reporting has to come
        // from what this site recorded as it went.
        //
        // Paths must be ABSOLUTE. Umbraco sets the DataDirectory AppDomain property and
        // Microsoft.Data.Sqlite resolves a relative Data Source against it rather than the
        // content root, so a relative path lands somewhere nobody expects.
        var dataDir = Path.Combine(
            cfg[HostDefaults.ContentRootKey] ?? Directory.GetCurrentDirectory(),
            "umbraco",
            "Data");

        var connection = cfg.GetConnectionString("GetnetDb")
            ?? $"Data Source={Path.Combine(dataDir, "getnet.db")}";

        builder.Services.AddDbContextFactory<GetnetDbContext>(o => o.UseSqlite(connection));
        builder.Services.AddScoped<IGetnetTransactionService, GetnetTransactionService>();
        builder.Components().Append<GetnetSchemaComponent>();
#endif
        // Singleton, not scoped. The client caches its OAuth token behind a SemaphoreSlim
        // in instance state; registered per-request that cache is discarded every request
        // and every call re-authenticates. Its four dependencies — IHttpClientFactory, the
        // options singleton registered just above, IHostEnvironment and ILogger — are all
        // singletons themselves, so there is no captive dependency.
        builder.Services.AddSingleton<GetnetApiClient>();

        builder.Services.AddHttpClient("Getnet", client =>
        {
            client.BaseAddress = new Uri(options.BaseUrl);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.Timeout = TimeSpan.FromSeconds(30);
        })
        .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
        {
            AutomaticDecompression = DecompressionMethods.All,
        })
        .AddPolicyHandler(GetRetryPolicy());
    }

    private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy() =>
        HttpPolicyExtensions
            .HandleTransientHttpError()
            .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromMilliseconds(300 * retryAttempt));
}

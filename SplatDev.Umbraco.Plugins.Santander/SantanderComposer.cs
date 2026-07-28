using System.Security.Cryptography.X509Certificates;
using Polly;
using Polly.Extensions.Http;
using SplatDev.Payments.Santander;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.Santander;

/// <summary>
/// Wires the Santander Open Banking API suite: options (manual binding, project convention),
/// the authenticated client, the 8 product services, and the named mTLS HttpClient.
/// </summary>
public class SantanderComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        var cfg = builder.Config;

        var opts = new SantanderApiOptions
        {
            BaseUrl = cfg["Santander:BaseUrl"] ?? "https://trust-sandbox.api.santander.com.br",
            TokenPath = cfg["Santander:TokenPath"] ?? "/auth/oauth/v2/token",
            ClientId = cfg["Santander:ClientId"] ?? string.Empty,
            ClientSecret = cfg["Santander:ClientSecret"] ?? string.Empty,
            CertificatePath = cfg["Santander:CertificatePath"] ?? string.Empty,
            CertificatePassword = cfg["Santander:CertificatePassword"] ?? string.Empty,
            CertificateBase64 = cfg["Santander:CertificateBase64"] ?? string.Empty,
            ApiKey = cfg["Santander:ApiKey"] ?? string.Empty,
            EnableDevelopmentMockWithoutCredentials =
                bool.TryParse(cfg["Santander:EnableDevelopmentMockWithoutCredentials"], out var mock) && mock,
            WorkspaceId = cfg["Santander:WorkspaceId"] ?? string.Empty,
            CovenantCode = cfg["Santander:CovenantCode"] ?? string.Empty,
            BankId = cfg["Santander:BankId"] ?? "90400888000142",
            AccountId = cfg["Santander:AccountId"] ?? string.Empty,
            PixKey = cfg["Santander:PixKey"] ?? string.Empty,
        };

        BindProduct(cfg, "Santander:PixQrCode", opts.PixQrCode);
        BindProduct(cfg, "Santander:BalanceStatement", opts.BalanceStatement);
        BindProduct(cfg, "Santander:Payments", opts.Payments);
        BindProduct(cfg, "Santander:Boletos", opts.Boletos);
        BindProduct(cfg, "Santander:OpenFx", opts.OpenFx);
        BindProduct(cfg, "Santander:ExportCharge", opts.ExportCharge);
        BindProduct(cfg, "Santander:Vouchers", opts.Vouchers);
        BindProduct(cfg, "Santander:PixAutomatico", opts.PixAutomatico);

        builder.Services.AddSingleton(opts);
        // Singleton so the OAuth token cache is shared across requests (client is stateless otherwise).
        builder.Services.AddSingleton<SantanderApiClient>();
        builder.Services.AddScoped<SantanderPixQrCodeService>();
        builder.Services.AddScoped<SantanderBalanceStatementService>();
        builder.Services.AddScoped<SantanderPaymentsService>();
        builder.Services.AddScoped<SantanderBoletoService>();
        builder.Services.AddScoped<SantanderOpenFxService>();
        builder.Services.AddScoped<SantanderExportChargeService>();
        builder.Services.AddScoped<SantanderVouchersService>();
        builder.Services.AddScoped<SantanderPixAutomaticoService>();

        builder.Services.AddHttpClient(SantanderApiClient.HttpClientName, client =>
        {
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.Timeout = TimeSpan.FromSeconds(45);
        })
        .ConfigurePrimaryHttpMessageHandler(() =>
        {
            var handler = new HttpClientHandler
            {
                AutomaticDecompression = System.Net.DecompressionMethods.All,
            };
            var certificate = LoadCertificate(opts);
            if (certificate is not null)
            {
                handler.ClientCertificateOptions = ClientCertificateOption.Manual;
                handler.ClientCertificates.Add(certificate);
            }
            return handler;
        })
        .AddPolicyHandler(GetRetryPolicy());
    }

    private static void BindProduct(IConfiguration cfg, string section, SantanderProductOptions product)
    {
        product.BaseUrl = cfg[$"{section}:BaseUrl"] ?? product.BaseUrl;
        product.BasePath = cfg[$"{section}:BasePath"] ?? product.BasePath;
        product.CreatePath = cfg[$"{section}:CreatePath"] ?? product.CreatePath;
        product.ListPath = cfg[$"{section}:ListPath"] ?? product.ListPath;
        product.BalancesPath = cfg[$"{section}:BalancesPath"] ?? product.BalancesPath;
        product.StatementsPath = cfg[$"{section}:StatementsPath"] ?? product.StatementsPath;
        product.WorkspacesPath = cfg[$"{section}:WorkspacesPath"] ?? product.WorkspacesPath;
    }

    /// <summary>mTLS is mandatory on Santander hosts (even the token call); absent config → no cert (mock/dev).</summary>
    internal static X509Certificate2? LoadCertificate(SantanderApiOptions opts)
    {
        if (!string.IsNullOrWhiteSpace(opts.CertificateBase64))
            return X509CertificateLoader.LoadPkcs12(
                Convert.FromBase64String(opts.CertificateBase64), opts.CertificatePassword);

        if (!string.IsNullOrWhiteSpace(opts.CertificatePath) && File.Exists(opts.CertificatePath))
            return X509CertificateLoader.LoadPkcs12FromFile(opts.CertificatePath, opts.CertificatePassword);

        return null;
    }

    private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy() =>
        HttpPolicyExtensions
            .HandleTransientHttpError()
            .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}

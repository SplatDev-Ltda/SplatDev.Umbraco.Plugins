namespace SplatDev.Payments.Santander;

/// <summary>
/// Configuration for the Santander Open Banking (bank-direct) API suite.
/// Distinct from the Getnet acquirer gateway (Services/Locacao/Getnet*): these APIs run on
/// the trust-*.api.santander.com.br hosts with OAuth2 client_credentials + mTLS (ICP-Brasil
/// e-CNPJ certificate) + X-Application-Key header.
/// The developer portal blocks unauthenticated doc access, so every product path is
/// configurable; defaults are the best-known values (boletos confirmed against sandbox).
/// </summary>
public sealed class SantanderApiOptions
{
    public string BaseUrl { get; set; } = "https://trust-sandbox.api.santander.com.br";
    public string TokenPath { get; set; } = "/auth/oauth/v2/token";
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>PFX/P12 path for the ICP-Brasil e-CNPJ certificate (mTLS is required even for the token call).</summary>
    public string CertificatePath { get; set; } = string.Empty;
    public string CertificatePassword { get; set; } = string.Empty;
    /// <summary>Alternative to CertificatePath: base64-encoded PFX bytes.</summary>
    public string CertificateBase64 { get; set; } = string.Empty;

    /// <summary>Guards the santander-banking controller (X-RISIN-Api-Key header). Endpoints return 401 while unset.</summary>
    public string ApiKey { get; set; } = string.Empty;

    public bool EnableDevelopmentMockWithoutCredentials { get; set; }

    /// <summary>Default workspace for boleto issuance (auto-discovered via GET workspaces when empty).</summary>
    public string WorkspaceId { get; set; } = string.Empty;
    /// <summary>Convênio (covenant) code used on boleto issuance.</summary>
    public string CovenantCode { get; set; } = string.Empty;
    /// <summary>Bank identifier (CNPJ root) for balance/statement endpoints.</summary>
    public string BankId { get; set; } = "90400888000142";
    /// <summary>Account identifier (agência.conta) for balance/statement endpoints.</summary>
    public string AccountId { get; set; } = string.Empty;
    /// <summary>Pix key (chave) used when creating Pix charges.</summary>
    public string PixKey { get; set; } = string.Empty;

    public SantanderProductOptions PixQrCode { get; set; } = new()
    {
        BasePath = "/api/v1/cob",
    };

    public SantanderProductOptions BalanceStatement { get; set; } = new()
    {
        BasePath = "/bank_account_information/v1",
        BalancesPath = "/banks/{bankId}/balances",
        StatementsPath = "/banks/{bankId}/statements",
    };

    public SantanderProductOptions Payments { get; set; } = new()
    {
        BasePath = "/management_payments_partners/v1",
        CreatePath = "/payment_orders",
    };

    public SantanderProductOptions Boletos { get; set; } = new()
    {
        // Confirmed against sandbox: GET /collection_bill_management/v2/workspaces -> 200
        BasePath = "/collection_bill_management/v2",
        WorkspacesPath = "/workspaces",
        CreatePath = "/workspaces/{workspaceId}/bank_slips",
    };

    public SantanderProductOptions OpenFx { get; set; } = new()
    {
        BasePath = "/openfx/v1",
        CreatePath = "/quotes",
    };

    public SantanderProductOptions ExportCharge { get; set; } = new()
    {
        BasePath = "/export_charge/v1",
        CreatePath = "/charges",
    };

    public SantanderProductOptions Vouchers { get; set; } = new()
    {
        BasePath = "/payment_receipts/v1",
        ListPath = "/receipts",
    };

    public SantanderProductOptions PixAutomatico { get; set; } = new()
    {
        BasePath = "/api/v1",
        CreatePath = "/rec",      // recurrence resource
        LocationPath = "/locrec", // recurrence location (must be minted before the rec; loc = its integer id)
    };
}

/// <summary>
/// Per-product endpoint configuration. BaseUrl overrides the global host when a product runs
/// on a different gateway (e.g. Pix recebimentos on trust-pix-h.santander.com.br).
/// </summary>
public sealed class SantanderProductOptions
{
    public string BaseUrl { get; set; } = string.Empty;
    public string BasePath { get; set; } = string.Empty;
    public string CreatePath { get; set; } = string.Empty;
    public string ListPath { get; set; } = string.Empty;
    public string BalancesPath { get; set; } = string.Empty;
    public string StatementsPath { get; set; } = string.Empty;
    public string WorkspacesPath { get; set; } = string.Empty;
    public string LocationPath { get; set; } = string.Empty;
}

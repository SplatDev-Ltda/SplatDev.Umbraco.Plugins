namespace SplatDev.Payments.BancoInter;

public class BancoInterSettings
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public bool Sandbox { get; set; } = true;

    /// <summary>Path to PEM-encoded client certificate file (required for production mTLS).</summary>
    public string? CertificatePath { get; set; }

    /// <summary>Path to PEM-encoded private key file (required for production mTLS).</summary>
    public string? CertificateKeyPath { get; set; }

    /// <summary>
    /// Shared secret that Banco Inter's Pix webhook must present, as a <c>?secret=</c>
    /// query value on the callback URL registered with the bank.
    /// </summary>
    /// <remarks>
    /// The webhook cannot use the backoffice's own authorization: the caller is Inter's
    /// server, which has no backoffice session. It was left under BackOfficeAccess, so
    /// every callback was rejected with a 401 and charges stayed pending after the payer
    /// had actually paid.
    ///
    /// The endpoint cannot simply be opened either — it marks a transaction RECEBIDO, so
    /// an anonymous caller could mark any charge as settled. It is therefore gated on
    /// this secret, and refuses everything while the secret is unset rather than
    /// defaulting to open.
    /// </remarks>
    public string? WebhookSecret { get; set; }

    public string BaseUrl => Sandbox
        ? "https://cdpj-sandbox.partners.uatinter.co"
        : "https://cdpj.partners.uatinter.co";

    public string TokenUrl => $"{BaseUrl}/oauth/v2/token";
}

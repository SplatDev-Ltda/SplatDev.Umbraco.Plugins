namespace SplatDev.Umbraco.Plugins.WhatsApp.Models;

/// <summary>
/// Configuration for the WhatsApp Business Cloud API integration.
/// Bound from the <c>SplatDev:WhatsApp</c> configuration section.
/// </summary>
/// <remarks>
/// None of these values belong in a committed file. Use user-secrets locally and an
/// environment file (or Key Vault) on the server. The environment-variable form follows
/// the convention already used across SplatDev deployments, e.g.
/// <c>SplatDev__WhatsApp__AccessToken</c>.
/// </remarks>
public class WhatsAppOptions
{
    public const string SectionName = "SplatDev:WhatsApp";

    /// <summary>Phone number ID that messages are sent from (not the display number).</summary>
    public string PhoneNumberId { get; set; } = string.Empty;

    /// <summary>WhatsApp Business Account (WABA) ID — needed to list message templates.</summary>
    public string BusinessAccountId { get; set; } = string.Empty;

    /// <summary>
    /// Graph API access token. A permanent System User token is strongly preferred;
    /// the 24-hour tokens the Meta dashboard hands out will break the integration daily.
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Shared secret echoed back during Meta's <c>GET</c> webhook verification handshake.
    /// Any non-empty value you also enter in the Meta app configuration will do.
    /// </summary>
    public string WebhookVerifyToken { get; set; } = string.Empty;

    /// <summary>
    /// Meta app secret, used to validate the <c>X-Hub-Signature-256</c> header on incoming
    /// webhooks. When empty, signature validation is skipped and every delivery is logged as
    /// unverified — acceptable for local development, not for production.
    /// </summary>
    public string AppSecret { get; set; } = string.Empty;

    /// <summary>Graph API version, e.g. <c>v21.0</c>.</summary>
    public string GraphApiVersion { get; set; } = "v21.0";

    /// <summary>Base Graph API URL. Overridable so tests can point at a stub.</summary>
    public string GraphApiBaseUrl { get; set; } = "https://graph.facebook.com";

    /// <summary>
    /// Length of the customer-service window. Meta's is 24 hours; exposed only so the
    /// dashboard can warn slightly early if an operator wants a safety margin.
    /// </summary>
    public int CustomerServiceWindowHours { get; set; } = 24;

    /// <summary>True when enough is configured to talk to the Graph API at all.</summary>
    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(PhoneNumberId) && !string.IsNullOrWhiteSpace(AccessToken);

    public string ApiRoot => $"{GraphApiBaseUrl.TrimEnd('/')}/{GraphApiVersion}";
}

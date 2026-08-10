using SplatDev.Umbraco.Plugins.WhatsApp.Models;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Services;

/// <summary>Thin typed wrapper over the WhatsApp Business Cloud API.</summary>
public interface IWhatsAppClient
{
    /// <summary>
    /// Sends a free-form text message. Only valid inside the 24-hour customer-service window;
    /// outside it Meta rejects the send and <see cref="SendResult.Error"/> explains why.
    /// </summary>
    Task<SendResult> SendTextAsync(string to, string body, CancellationToken ct = default);

    /// <summary>
    /// Sends an approved template. Valid at any time, including a first contact and after
    /// the window has closed.
    /// </summary>
    /// <param name="variables">Positional body variables substituted into {{1}}, {{2}}, …</param>
    Task<SendResult> SendTemplateAsync(
        string to,
        string templateName,
        string languageCode,
        IReadOnlyList<string>? variables = null,
        CancellationToken ct = default);

    /// <summary>Lists message templates on the business account.</summary>
    Task<IReadOnlyList<MessageTemplate>> GetTemplatesAsync(CancellationToken ct = default);

    /// <summary>Fetches health and identity of the configured sending number.</summary>
    Task<PhoneNumberStatus?> GetPhoneNumberStatusAsync(CancellationToken ct = default);
}

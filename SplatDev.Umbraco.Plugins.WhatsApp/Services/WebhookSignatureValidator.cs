using System.Security.Cryptography;
using System.Text;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Services;

/// <summary>
/// Validates Meta's <c>X-Hub-Signature-256</c> header: an HMAC-SHA256 of the raw request
/// body keyed with the app secret, formatted as <c>sha256=&lt;hex&gt;</c>.
/// </summary>
public static class WebhookSignatureValidator
{
    private const string Prefix = "sha256=";

    /// <summary>
    /// Returns true when <paramref name="signatureHeader"/> matches the body.
    /// </summary>
    /// <remarks>
    /// The body must be the exact bytes Meta sent. Re-serializing a deserialized payload
    /// changes whitespace and key order, which changes the hash.
    /// </remarks>
    public static bool IsValid(string? signatureHeader, byte[] body, string appSecret)
    {
        if (string.IsNullOrWhiteSpace(signatureHeader) || string.IsNullOrEmpty(appSecret))
        {
            return false;
        }

        if (!signatureHeader.StartsWith(Prefix, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var provided = signatureHeader[Prefix.Length..];

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(appSecret));
        var expected = Convert.ToHexString(hmac.ComputeHash(body ?? Array.Empty<byte>()));

        // Compare over bytes with a fixed-time routine so the comparison cannot be used
        // as an oracle to recover the expected signature one character at a time.
        var providedBytes = Encoding.ASCII.GetBytes(provided.ToUpperInvariant());
        var expectedBytes = Encoding.ASCII.GetBytes(expected);

        return CryptographicOperations.FixedTimeEquals(providedBytes, expectedBytes);
    }
}

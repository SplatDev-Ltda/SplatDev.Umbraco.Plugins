using System.Security.Cryptography;
using System.Text;

using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.ContentPackages.Models;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Services;

/// <inheritdoc />
public class DownloadTokenService : IDownloadTokenService
{
    private readonly ContentPackagesOptions _options;

    public DownloadTokenService(IOptions<ContentPackagesOptions> options)
    {
        _options = options.Value;
    }

    public string Issue(string leadPublicId, string slug, AssetKind kind)
    {
        var expiry = DateTimeOffset.UtcNow.AddDays(_options.TokenTtlDays).ToUnixTimeSeconds();
        var signature = Sign(BuildPayload(leadPublicId, slug, kind, expiry));

        return $"?t={Uri.EscapeDataString(leadPublicId)}&e={expiry}&s={signature}";
    }

    public TokenValidation Validate(
        string? leadPublicId, string slug, AssetKind kind, long expiryUnix, string? signature)
    {
        if (string.IsNullOrWhiteSpace(_options.SigningKey))
        {
            // Failing closed matters: with no key every signature would otherwise verify
            // against an empty key and the gate would be open.
            return TokenValidation.Invalid(TokenFailure.NotConfigured);
        }

        if (string.IsNullOrWhiteSpace(leadPublicId) ||
            string.IsNullOrWhiteSpace(signature) ||
            string.IsNullOrWhiteSpace(slug) ||
            expiryUnix <= 0)
        {
            return TokenValidation.Invalid(TokenFailure.Malformed);
        }

        // Signature first — the cheapest rejection, and it avoids leaking timing
        // information about whether a given lead or expiry exists.
        var expected = Sign(BuildPayload(leadPublicId!, slug, kind, expiryUnix));
        if (!FixedTimeEquals(signature!, expected))
        {
            return TokenValidation.Invalid(TokenFailure.BadSignature);
        }

        if (DateTimeOffset.FromUnixTimeSeconds(expiryUnix) <= DateTimeOffset.UtcNow)
        {
            return TokenValidation.Invalid(TokenFailure.Expired);
        }

        return TokenValidation.Valid(leadPublicId!);
    }

    /// <summary>
    /// Slug and kind are part of the signed payload so a link cannot be moved between
    /// packages or formats.
    /// </summary>
    internal static string BuildPayload(string leadPublicId, string slug, AssetKind kind, long expiryUnix) =>
        $"{leadPublicId}|{slug.ToLowerInvariant()}|{kind}|{expiryUnix}";

    private string Sign(string payload)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_options.SigningKey));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload))).ToLowerInvariant();
    }

    internal static bool FixedTimeEquals(string a, string b)
    {
        var left = Encoding.ASCII.GetBytes(a.ToLowerInvariant());
        var right = Encoding.ASCII.GetBytes(b.ToLowerInvariant());

        return CryptographicOperations.FixedTimeEquals(left, right);
    }
}

using SplatDev.Umbraco.Plugins.ContentPackages.Models;

namespace SplatDev.Umbraco.Plugins.ContentPackages.Services;

/// <summary>Why a token was rejected. Never surfaced verbatim to the visitor.</summary>
public enum TokenFailure
{
    None = 0,
    Malformed = 1,
    BadSignature = 2,
    Expired = 3,
    NotConfigured = 4,
}

public record TokenValidation(bool Ok, TokenFailure Failure, string? LeadPublicId = null)
{
    public static TokenValidation Valid(string leadPublicId) =>
        new(true, TokenFailure.None, leadPublicId);

    public static TokenValidation Invalid(TokenFailure failure) => new(false, failure);
}

/// <summary>
/// Mints and verifies stateless, signed asset links.
/// </summary>
/// <remarks>
/// Stateless by design: a forged signature is rejected without touching the database, so
/// the endpoint cannot be used to probe storage. Revocation is therefore a separate check
/// on the lead row — see <c>SPEC.md</c>.
/// </remarks>
public interface IDownloadTokenService
{
    /// <summary>Builds the query string for an asset link.</summary>
    string Issue(string leadPublicId, string slug, AssetKind kind);

    /// <summary>
    /// Verifies signature and expiry for a specific slug and kind. Binding both into the
    /// payload stops a valid PDF link being replayed for another package's PPTX.
    /// </summary>
    TokenValidation Validate(string? leadPublicId, string slug, AssetKind kind, long expiryUnix, string? signature);
}

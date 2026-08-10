using System.Security.Cryptography;
using System.Text;

using SplatDev.Umbraco.Plugins.WhatsApp.Services;

using Xunit;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Tests;

public class WebhookSignatureValidatorTests
{
    private const string AppSecret = "test-app-secret";

    private static string Sign(byte[] body, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        return "sha256=" + Convert.ToHexString(hmac.ComputeHash(body)).ToLowerInvariant();
    }

    [Fact]
    public void Accepts_a_correctly_signed_payload()
    {
        var body = Encoding.UTF8.GetBytes("""{"object":"whatsapp_business_account"}""");

        Assert.True(WebhookSignatureValidator.IsValid(Sign(body, AppSecret), body, AppSecret));
    }

    [Fact]
    public void Accepts_an_uppercase_hex_signature()
    {
        // Meta sends lowercase, but the comparison must not hinge on casing.
        var body = Encoding.UTF8.GetBytes("{}");
        var signature = Sign(body, AppSecret).ToUpperInvariant().Replace("SHA256=", "sha256=");

        Assert.True(WebhookSignatureValidator.IsValid(signature, body, AppSecret));
    }

    [Fact]
    public void Rejects_a_tampered_body()
    {
        var original = Encoding.UTF8.GetBytes("""{"amount":10}""");
        var tampered = Encoding.UTF8.GetBytes("""{"amount":99}""");

        Assert.False(WebhookSignatureValidator.IsValid(Sign(original, AppSecret), tampered, AppSecret));
    }

    [Fact]
    public void Rejects_a_signature_made_with_the_wrong_secret()
    {
        var body = Encoding.UTF8.GetBytes("{}");

        Assert.False(WebhookSignatureValidator.IsValid(Sign(body, "other-secret"), body, AppSecret));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("deadbeef")]          // missing the sha256= prefix
    [InlineData("sha1=deadbeef")]     // wrong algorithm prefix
    public void Rejects_a_malformed_or_missing_header(string? header)
    {
        var body = Encoding.UTF8.GetBytes("{}");

        Assert.False(WebhookSignatureValidator.IsValid(header, body, AppSecret));
    }

    [Fact]
    public void Rejects_everything_when_no_app_secret_is_configured()
    {
        // The controller decides whether to skip validation; the validator itself must
        // never report success without a secret to check against.
        var body = Encoding.UTF8.GetBytes("{}");

        Assert.False(WebhookSignatureValidator.IsValid(Sign(body, AppSecret), body, string.Empty));
    }

    [Fact]
    public void Handles_an_empty_body()
    {
        var body = Array.Empty<byte>();

        Assert.True(WebhookSignatureValidator.IsValid(Sign(body, AppSecret), body, AppSecret));
    }
}

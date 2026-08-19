using System.Text;
using SplatDev.Umbraco.Plugins.TwoFactor.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.TwoFactor.Tests;

/// <summary>
/// Checks the TOTP primitives against the vectors published in the RFCs, rather than
/// against our own output. A self-consistent implementation can be confidently wrong;
/// the point of these vectors is that an authenticator app agrees with them.
/// </summary>
public class TotpTests
{
    // RFC 4648 §10.
    [Theory]
    [InlineData("", "")]
    [InlineData("f", "MY======")]
    [InlineData("fo", "MZXQ====")]
    [InlineData("foo", "MZXW6===")]
    [InlineData("foob", "MZXW6YQ=")]
    [InlineData("fooba", "MZXW6YTB")]
    [InlineData("foobar", "MZXW6YTBOI======")]
    public void Base32_matches_rfc4648_vectors(string input, string expected)
    {
        Assert.Equal(expected, Base32.Encode(Encoding.ASCII.GetBytes(input)));
    }

    [Theory]
    [InlineData("f")]
    [InlineData("foobar")]
    [InlineData("the quick brown fox")]
    public void Base32_round_trips(string input)
    {
        var bytes = Encoding.ASCII.GetBytes(input);
        Assert.Equal(bytes, Base32.Decode(Base32.Encode(bytes)));
    }

    [Fact]
    public void Base32_decode_is_case_insensitive_like_authenticator_apps()
    {
        Assert.Equal(Base32.Decode("MZXW6YTB"), Base32.Decode("mzxw6ytb"));
    }

    [Fact]
    public void Base32_decode_rejects_non_alphabet_characters()
    {
        Assert.Throws<FormatException>(() => Base32.Decode("MZXW6YT1"));
    }

    // RFC 6238 Appendix B. The published values are 8 digits; TOTP truncates from the
    // right, so the low 6 digits are what a 6-digit authenticator shows for the same step.
    [Theory]
    [InlineData(59L, "94287082")]
    [InlineData(1111111109L, "07081804")]
    [InlineData(1111111111L, "14050471")]
    [InlineData(1234567890L, "89005924")]
    [InlineData(2000000000L, "69279037")]
    [InlineData(20000000000L, "65353130")]
    public void ComputeOtp_matches_rfc6238_sha1_vectors(long unixTime, string expected8)
    {
        // The RFC's SHA-1 seed: ASCII "12345678901234567890".
        var key = Encoding.ASCII.GetBytes("12345678901234567890");
        var timeStep = unixTime / 30;

        var expected6 = expected8[^6..];
        Assert.Equal(expected6, TwoFactorService.ComputeOtp(key, timeStep));
    }

    [Fact]
    public void Generated_secret_is_enrollable_in_an_authenticator_app()
    {
        // The bug this guards: the previous version emitted Base64, which contains
        // characters outside the Base32 alphabet and cannot be typed into or scanned by
        // Google Authenticator, so enrolment could never complete.
        for (var i = 0; i < 50; i++)
        {
            var secret = Base32.Encode(System.Security.Cryptography.RandomNumberGenerator.GetBytes(20));

            Assert.Matches("^[A-Z2-7]+=*$", secret);
            Assert.Equal(20, Base32.Decode(secret).Length);
        }
    }

    [Fact]
    public void Adjacent_time_steps_produce_different_codes()
    {
        var key = Encoding.ASCII.GetBytes("12345678901234567890");
        Assert.NotEqual(TwoFactorService.ComputeOtp(key, 1000), TwoFactorService.ComputeOtp(key, 1001));
    }
}

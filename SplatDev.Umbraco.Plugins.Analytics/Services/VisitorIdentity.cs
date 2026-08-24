using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Analytics.Configuration;

namespace SplatDev.Umbraco.Plugins.Analytics.Services;

/// <summary>Turns a request into a stable, non-reversible visitor id.</summary>
public interface IVisitorIdentity
{
    string Compute(string? ipAddress, string? userAgent);

    /// <summary>What to store of the address, per configuration. Null when nothing is kept.</summary>
    string? StorableAddress(string? ipAddress);
}

public class VisitorIdentity : IVisitorIdentity
{
    private readonly AnalyticsOptions _options;
    private readonly string _salt;

    public VisitorIdentity(IOptions<AnalyticsOptions> options)
    {
        _options = options.Value;

        // A salt is what stops the hash being reversible: an IPv4 range is small enough to
        // hash exhaustively and compare against. Generated once per process when unset,
        // which is enough to protect the stored value; set it in configuration to keep
        // visitors recognisable across restarts.
        _salt = string.IsNullOrWhiteSpace(_options.VisitorIdSalt)
            ? Convert.ToHexString(RandomNumberGenerator.GetBytes(16))
            : _options.VisitorIdSalt!;
    }

    public string Compute(string? ipAddress, string? userAgent)
    {
        var material = $"{ipAddress ?? "0.0.0.0"}|{userAgent ?? string.Empty}|{_salt}";
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(material)))[..32];
    }

    public string? StorableAddress(string? ipAddress) => _options.StoreIpAddress switch
    {
        IpStorage.Full => ipAddress,
        IpStorage.Anonymised => Anonymise(ipAddress),
        _ => null,
    };

    /// <summary>Zeroes the host bits, keeping enough to tell networks apart.</summary>
    private static string? Anonymise(string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress) || !IPAddress.TryParse(ipAddress, out var parsed))
            return null;

        var bytes = parsed.GetAddressBytes();
        var keep = bytes.Length == 4 ? 3 : 6;   // IPv4 /24, IPv6 /48
        for (var i = keep; i < bytes.Length; i++)
            bytes[i] = 0;

        return new IPAddress(bytes).ToString();
    }
}

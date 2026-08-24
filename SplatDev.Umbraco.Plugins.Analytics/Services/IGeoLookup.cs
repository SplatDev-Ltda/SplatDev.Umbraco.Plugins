using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Analytics.Configuration;
using SplatDev.Umbraco.Plugins.Analytics.Models;

namespace SplatDev.Umbraco.Plugins.Analytics.Services;

/// <summary>Resolves an address to a place, when the site has data to resolve it against.</summary>
public interface IGeoLookup
{
    Task<IpMapping?> LookupAsync(string ipAddress, CancellationToken ct = default);
}

/// <summary>
/// Reads an IP2Location BIN file, when one is configured.
/// </summary>
/// <remarks>
/// The v8 plugin required that data file to be present. It is a separate licensed download
/// that goes stale, so here it is optional: with no path configured this returns null and
/// the country and city columns simply stay empty. Nothing else in the plugin depends on
/// geo being available.
///
/// The reader is deliberately not implemented against the IP2Location SDK — taking a
/// dependency on a package for a feature most sites will not switch on is the kind of thing
/// that put an unused email stack into every package in this repo. A site that wants geo
/// registers its own <see cref="IGeoLookup"/>; this implementation reports clearly that
/// nothing is wired up rather than pretending to work.
/// </remarks>
public class Ip2LocationGeoLookup : IGeoLookup
{
    private readonly AnalyticsOptions _options;
    private readonly ILogger<Ip2LocationGeoLookup> _logger;
    private bool _warned;

    public Ip2LocationGeoLookup(IOptions<AnalyticsOptions> options, ILogger<Ip2LocationGeoLookup> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public Task<IpMapping?> LookupAsync(string ipAddress, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.Ip2LocationBinPath))
            return Task.FromResult<IpMapping?>(null);

        if (!File.Exists(_options.Ip2LocationBinPath))
        {
            // Said once, not once per visit.
            if (!_warned)
            {
                _warned = true;
                _logger.LogWarning(
                    "Analytics: Ip2LocationBinPath is set to {Path} but no file is there, so visits are recorded without location.",
                    _options.Ip2LocationBinPath);
            }
            return Task.FromResult<IpMapping?>(null);
        }

        if (!_warned)
        {
            _warned = true;
            _logger.LogInformation(
                "Analytics: an IP2Location file is configured, but no reader is registered for it. " +
                "Register your own IGeoLookup implementation to record location against visits.");
        }

        return Task.FromResult<IpMapping?>(null);
    }
}

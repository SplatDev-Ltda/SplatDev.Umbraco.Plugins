using System.Collections.Concurrent;

namespace SplatDev.Cache;

public class CacheKeyBuilder : ICacheKeyBuilder
{
    private readonly CacheOptions _options;

    public CacheKeyBuilder(CacheOptions options)
    {
        _options = options;
    }

    public string Build(params string[] segments)
    {
        var prefix = string.IsNullOrEmpty(_options.KeyPrefix)
            ? string.Empty
            : _options.KeyPrefix + _options.KeySeparator;

        return prefix + string.Join(_options.KeySeparator, segments);
    }

    public string BuildPattern(params string[] segments)
    {
        return Build(segments) + _options.KeySeparator + "*";
    }
}

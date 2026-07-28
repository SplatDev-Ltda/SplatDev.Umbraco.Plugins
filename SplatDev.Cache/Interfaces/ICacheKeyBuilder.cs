namespace SplatDev.Cache;

public interface ICacheKeyBuilder
{
    string Build(params string[] segments);

    string BuildPattern(params string[] segments);
}

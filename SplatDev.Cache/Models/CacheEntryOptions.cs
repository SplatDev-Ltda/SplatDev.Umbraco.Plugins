namespace SplatDev.Cache;

public sealed class CacheEntryOptions
{
    public TimeSpan? AbsoluteExpiration { get; set; }

    public TimeSpan? SlidingExpiration { get; set; }
}

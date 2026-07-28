namespace SplatDev.Cache;

public class CacheOptions
{
    public string KeyPrefix { get; set; } = string.Empty;

    public TimeSpan DefaultTtl { get; set; } = TimeSpan.FromMinutes(30);

    public string KeySeparator { get; set; } = ":";
}

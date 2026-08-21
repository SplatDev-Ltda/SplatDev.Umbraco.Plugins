namespace SplatDev.Umbraco.Plugins.Tweets.Models;

public class TweetSettings
{
    public const string SectionKey = "UmbracoCms:Tweets";

    public string BearerToken { get; set; } = string.Empty;
    public string TwitterHandle { get; set; } = string.Empty;
    public int MaxTweets { get; set; } = 10;
    public int RefreshIntervalMinutes { get; set; } = 60;
    public bool CacheEnabled { get; set; } = true;
}

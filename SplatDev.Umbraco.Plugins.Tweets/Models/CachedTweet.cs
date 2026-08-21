namespace SplatDev.Umbraco.Plugins.Tweets.Models;

public class CachedTweet
{
    public int Id { get; set; }
    public string TweetId { get; set; } = string.Empty;
    public string AuthorHandle { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorAvatarUrl { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string TweetUrl { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; }
    public int LikeCount { get; set; }
    public int RetweetCount { get; set; }
    public DateTime CachedAt { get; set; } = DateTime.UtcNow;
}

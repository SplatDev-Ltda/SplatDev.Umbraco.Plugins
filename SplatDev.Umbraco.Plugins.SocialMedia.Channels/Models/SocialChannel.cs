namespace SplatDev.Umbraco.Plugins.SocialMedia.Channels.Models
{
    public class SocialChannel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime ConnectedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ScheduledPost> ScheduledPosts { get; set; } = new List<ScheduledPost>();
    }
}

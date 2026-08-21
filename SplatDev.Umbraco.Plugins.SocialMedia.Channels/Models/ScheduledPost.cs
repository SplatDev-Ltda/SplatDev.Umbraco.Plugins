namespace SplatDev.Umbraco.Plugins.SocialMedia.Channels.Models
{
    public class ScheduledPost
    {
        public int Id { get; set; }
        public int ChannelId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? MediaUrl { get; set; }
        public DateTime ScheduledAt { get; set; }
        public DateTime? PublishedAt { get; set; }

        /// <summary>
        /// Allowed values: "pending", "published", "failed"
        /// </summary>
        public string Status { get; set; } = "pending";
        public string? ErrorMessage { get; set; }

        public SocialChannel Channel { get; set; } = null!;
    }
}

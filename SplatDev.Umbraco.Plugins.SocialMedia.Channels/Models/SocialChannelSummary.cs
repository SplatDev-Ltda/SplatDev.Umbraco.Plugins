namespace SplatDev.Umbraco.Plugins.SocialMedia.Channels.Models
{
    /// <summary>
    /// A connected channel as the backoffice is allowed to see it.
    /// </summary>
    /// <remarks>
    /// GetChannels and AddChannel used to return the <see cref="SocialChannel"/> entity
    /// straight out of the database, which carries AccessToken and RefreshToken. Every
    /// connected account's OAuth credentials were therefore serialised into the JSON sent
    /// to the browser, where they sit in memory, in devtools, and in any proxy log along
    /// the way. A dashboard needs to know a channel is connected and whether its token
    /// still works — it never needs the token itself.
    /// </remarks>
    public class SocialChannelSummary
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime ConnectedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }

        /// <summary>Whether a token is stored at all, without revealing it.</summary>
        public bool HasAccessToken { get; set; }

        /// <summary>Whether the stored token's expiry has passed.</summary>
        public bool TokenExpired { get; set; }

        public static SocialChannelSummary From(SocialChannel channel) => new()
        {
            Id = channel.Id,
            Name = channel.Name,
            Platform = channel.Platform,
            IsActive = channel.IsActive,
            ConnectedAt = channel.ConnectedAt,
            ExpiresAt = channel.ExpiresAt,
            HasAccessToken = !string.IsNullOrWhiteSpace(channel.AccessToken),
            TokenExpired = channel.ExpiresAt is { } expiry && expiry <= DateTime.UtcNow,
        };
    }
}

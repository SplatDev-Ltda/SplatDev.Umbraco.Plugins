namespace SplatDev.Umbraco.Plugins.SocialMedia.Share.Models
{
    public class ShareLink
    {
        public SharePlatform Platform { get; set; }
        public string Url { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string IconClass { get; set; } = string.Empty;
    }
}

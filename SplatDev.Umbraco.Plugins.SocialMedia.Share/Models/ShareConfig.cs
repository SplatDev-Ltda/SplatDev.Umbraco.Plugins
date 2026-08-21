namespace SplatDev.Umbraco.Plugins.SocialMedia.Share.Models
{
    public class ShareConfig
    {
        public List<SharePlatform> EnabledPlatforms { get; set; } = new List<SharePlatform>
        {
            SharePlatform.Facebook,
            SharePlatform.Twitter,
            SharePlatform.LinkedIn,
            SharePlatform.WhatsApp,
            SharePlatform.Email
        };

        public bool ShowLabels { get; set; } = true;
    }
}

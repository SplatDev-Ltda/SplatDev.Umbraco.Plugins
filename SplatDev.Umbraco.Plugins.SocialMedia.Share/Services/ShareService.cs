using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.SocialMedia.Share.Models;

namespace SplatDev.Umbraco.Plugins.SocialMedia.Share.Services
{
    public class ShareService(IOptions<ShareConfig> options) : IShareService
    {
        private readonly ShareConfig _config = options.Value;

        public IEnumerable<ShareLink> GetShareLinks(string pageUrl, string pageTitle)
        {
            var encodedUrl = Uri.EscapeDataString(pageUrl);
            var encodedTitle = Uri.EscapeDataString(pageTitle);

            foreach (var platform in _config.EnabledPlatforms)
            {
                yield return platform switch
                {
                    SharePlatform.Facebook => new ShareLink
                    {
                        Platform = SharePlatform.Facebook,
                        Url = $"https://www.facebook.com/sharer/sharer.php?u={encodedUrl}",
                        Label = "Share on Facebook",
                        IconClass = "icon-facebook"
                    },
                    SharePlatform.Twitter => new ShareLink
                    {
                        Platform = SharePlatform.Twitter,
                        Url = $"https://twitter.com/intent/tweet?url={encodedUrl}&text={encodedTitle}",
                        Label = "Share on Twitter / X",
                        IconClass = "icon-twitter"
                    },
                    SharePlatform.LinkedIn => new ShareLink
                    {
                        Platform = SharePlatform.LinkedIn,
                        Url = $"https://www.linkedin.com/sharing/share-offsite/?url={encodedUrl}",
                        Label = "Share on LinkedIn",
                        IconClass = "icon-linkedin"
                    },
                    SharePlatform.WhatsApp => new ShareLink
                    {
                        Platform = SharePlatform.WhatsApp,
                        Url = $"https://wa.me/?text={encodedTitle}%20{encodedUrl}",
                        Label = "Share on WhatsApp",
                        IconClass = "icon-whatsapp"
                    },
                    SharePlatform.Email => new ShareLink
                    {
                        Platform = SharePlatform.Email,
                        Url = $"mailto:?subject={encodedTitle}&body={encodedUrl}",
                        Label = "Share via Email",
                        IconClass = "icon-email"
                    },
                    SharePlatform.Telegram => new ShareLink
                    {
                        Platform = SharePlatform.Telegram,
                        Url = $"https://t.me/share/url?url={encodedUrl}&text={encodedTitle}",
                        Label = "Share on Telegram",
                        IconClass = "icon-telegram"
                    },
                    SharePlatform.Reddit => new ShareLink
                    {
                        Platform = SharePlatform.Reddit,
                        Url = $"https://www.reddit.com/submit?url={encodedUrl}&title={encodedTitle}",
                        Label = "Share on Reddit",
                        IconClass = "icon-reddit"
                    },
                    _ => throw new ArgumentOutOfRangeException(nameof(platform), platform, "Unsupported share platform")
                };
            }
        }
    }
}

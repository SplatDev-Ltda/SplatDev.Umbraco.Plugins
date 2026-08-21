namespace SplatDev.Umbraco.Plugins.SocialMedia.Login.Models
{
    public class SocialLoginConfig
    {
        public SocialProvider Provider { get; set; }
        public string AppId { get; set; } = string.Empty;
        public string AppSecret { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
        public string RedirectPath { get; set; } = string.Empty;
    }
}

namespace SplatDev.Umbraco.Plugins.SocialMedia.Login.Models
{
    public class SocialLoginResult
    {
        public bool Success { get; set; }
        public SocialProvider Provider { get; set; }
        public string? Email { get; set; }
        public string? ExternalId { get; set; }
        public string? Error { get; set; }
    }
}

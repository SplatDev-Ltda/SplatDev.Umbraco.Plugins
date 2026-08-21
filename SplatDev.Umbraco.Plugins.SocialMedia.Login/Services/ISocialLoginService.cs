using SplatDev.Umbraco.Plugins.SocialMedia.Login.Models;

namespace SplatDev.Umbraco.Plugins.SocialMedia.Login.Services
{
    public interface ISocialLoginService
    {
        List<SocialLoginConfig> GetEnabledProviders();
        string GetLoginUrl(SocialProvider provider, string redirectUri);
    }
}

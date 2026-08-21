using Microsoft.Extensions.Configuration;

using Umbraco.Cms.Core.Services;

using SplatDev.Umbraco.Plugins.SocialMedia.Login.Models;

namespace SplatDev.Umbraco.Plugins.SocialMedia.Login.Services
{
    public class SocialLoginService(IMemberService memberService, IConfiguration configuration) : ISocialLoginService
    {
        private readonly IMemberService _memberService = memberService;
        private readonly IConfiguration _configuration = configuration;

        public List<SocialLoginConfig> GetEnabledProviders()
        {
            var providers = new List<SocialLoginConfig>();
            var section = _configuration.GetSection("SocialMedia:Login:Providers");

            foreach (SocialProvider provider in Enum.GetValues<SocialProvider>())
            {
                var providerSection = section.GetSection(provider.ToString());
                var config = new SocialLoginConfig
                {
                    Provider = provider,
                    AppId = providerSection["AppId"] ?? string.Empty,
                    AppSecret = providerSection["AppSecret"] ?? string.Empty,
                    IsEnabled = providerSection.GetValue<bool>("IsEnabled"),
                    RedirectPath = providerSection["RedirectPath"] ?? $"/oauth/{provider.ToString().ToLower()}/callback"
                };

                if (config.IsEnabled && !string.IsNullOrWhiteSpace(config.AppId))
                {
                    providers.Add(config);
                }
            }

            return providers;
        }

        public string GetLoginUrl(SocialProvider provider, string redirectUri)
        {
            var section = _configuration.GetSection($"SocialMedia:Login:Providers:{provider}");
            var appId = section["AppId"] ?? string.Empty;
            var encodedRedirect = Uri.EscapeDataString(redirectUri);

            return provider switch
            {
                SocialProvider.Facebook =>
                    $"https://www.facebook.com/v18.0/dialog/oauth?client_id={appId}&redirect_uri={encodedRedirect}&scope=email",

                SocialProvider.Google =>
                    $"https://accounts.google.com/o/oauth2/v2/auth?client_id={appId}&redirect_uri={encodedRedirect}&response_type=code&scope=email+profile",

                SocialProvider.Twitter =>
                    $"https://twitter.com/i/oauth2/authorize?client_id={appId}&redirect_uri={encodedRedirect}&response_type=code&scope=tweet.read+users.read",

                SocialProvider.Apple =>
                    $"https://appleid.apple.com/auth/authorize?client_id={appId}&redirect_uri={encodedRedirect}&response_type=code&scope=email+name",

                _ => throw new ArgumentOutOfRangeException(nameof(provider), provider, "Unsupported social login provider")
            };
        }
    }
}

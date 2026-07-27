using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using SplatDev.Umbraco.Plugins.OAuth.Providers;

using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extensions;

namespace SplatDev.Umbraco.Plugins.OAuth.Extensions
{
    public static class GoogleMemberAuthenticationExtensions
    {
        public static IUmbracoBuilder AddGoogleMemberAuthentication(this IUmbracoBuilder builder)
        {
            builder.Services.ConfigureOptions<GoogleMemberExternalLoginProviderOptions>();

            builder.AddMemberExternalLogins(logins =>
            {
                logins.AddMemberLogin(
                    memberAuthenticationBuilder =>
                    {
                        // The scheme must be set with this method to work for the back office
                        var schemeName =
                            memberAuthenticationBuilder.SchemeForMembers(GoogleMemberExternalLoginProviderOptions
                                .SchemeName);

                        ArgumentNullException.ThrowIfNull(schemeName);

                        var config = builder.Config;

                        memberAuthenticationBuilder.AddGoogle(
                            schemeName,
                            options =>
                            {
                                var callbackPath = config.GetValue<string>("OAuth:Applications:Google:CallbackPath");
                                if (!string.IsNullOrWhiteSpace(callbackPath))
                                    options.CallbackPath = callbackPath; ///oauth%3Fp=google
                                options.ClientId = config.GetValue<string>("OAuth:Applications:Google:ClientId") ?? "";
                                options.ClientSecret = config.GetValue<string>("OAuth:Applications:Google:ClientSecret") ?? "";
                            });
                    });
            });
            return builder;
        }
    }
}

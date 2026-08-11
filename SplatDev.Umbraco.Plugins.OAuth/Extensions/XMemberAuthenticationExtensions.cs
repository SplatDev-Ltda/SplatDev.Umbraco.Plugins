using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using SplatDev.Umbraco.Plugins.OAuth.Providers;

using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extensions;

namespace SplatDev.Umbraco.Plugins.OAuth.Extensions
{
    public static class XMemberAuthenticationExtensions
    {
        public static IUmbracoBuilder AddXMemberAuthentication(this IUmbracoBuilder builder)
        {
            // Registering a provider with no credentials is fatal, not inert: ASP.NET Core
            // validates OAuth options on every request and throws
            // "The 'ClientId' option must be provided", which surfaces as a 500 on every
            // page of the site - backoffice included - the moment this package is
            // installed without being configured. An unconfigured external login should
            // simply not be offered.
            if (string.IsNullOrWhiteSpace(builder.Config.GetValue<string>("OAuth:Applications:X:ConsumerKey")))
            {
                return builder;
            }

            builder.Services.ConfigureOptions<XMemberExternalLoginProviderOptions>();

            builder.AddMemberExternalLogins(logins =>
            {
                logins.AddMemberLogin(
                    memberAuthenticationBuilder =>
                    {
                        // The scheme must be set with this method to work for the back office
                        var schemeName =
                            memberAuthenticationBuilder.SchemeForMembers(XMemberExternalLoginProviderOptions
                                .SchemeName);

                        ArgumentNullException.ThrowIfNull(schemeName);

                        var config = builder.Config;

                        memberAuthenticationBuilder.AddTwitter(
                            schemeName,
                            options =>
                            {
                                var callbackPath = config.GetValue<string>("OAuth:Applications:X:CallbackPath");
                                if (!string.IsNullOrWhiteSpace(callbackPath))
                                    options.CallbackPath = callbackPath; ///oauth%3Fp=x
                                options.ConsumerKey = config.GetValue<string>("OAuth:Applications:X:ConsumerKey") ?? "";
                                options.ConsumerSecret = config.GetValue<string>("OAuth:Applications:X:ConsumerSecret") ?? "";
                                options.RetrieveUserDetails = true;
                            });
                    });
            });
            return builder;
        }
    }
}

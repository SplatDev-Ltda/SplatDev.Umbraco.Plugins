using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

using SplatDev.Umbraco.Plugins.SocialMedia.Login.Services;

namespace SplatDev.Umbraco.Plugins.SocialMedia.Login.Composers
{
    public class SocialLoginComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddScoped<ISocialLoginService, SocialLoginService>();
        }
    }
}

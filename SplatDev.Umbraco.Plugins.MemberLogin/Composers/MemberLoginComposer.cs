using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.MemberLogin.Services;

namespace SplatDev.Umbraco.Plugins.MemberLogin.Composers;

public class MemberLoginComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IMemberLoginService, MemberLoginService>();
    }
}

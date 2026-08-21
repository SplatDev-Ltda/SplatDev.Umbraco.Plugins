using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Smtp.Services;

namespace SplatDev.Umbraco.Plugins.Smtp.Composers;

public class SmtpComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<ISmtpService, SmtpService>();
    }
}

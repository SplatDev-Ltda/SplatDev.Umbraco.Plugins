using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.EmailTemplates.Components;
using SplatDev.Umbraco.Plugins.EmailTemplates.Services;

namespace SplatDev.Umbraco.Plugins.EmailTemplates.Composers;

public class EmailTemplatesComponentComposer : ComponentComposer<EmailTemplatesComponent>
{
}

public class EmailTemplatesComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IEmailTemplateService, EmailTemplateService>();
        builder.Services.AddScoped<IEmailStyleService, EmailStyleService>();
    }
}

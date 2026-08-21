using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Faqs.Models;
using SplatDev.Umbraco.Plugins.Faqs.Services;
using SplatDev.Umbraco.Plugins.Faqs.Components;
using SplatDev.Umbraco.Plugins.Faqs.Persistence;

namespace SplatDev.Umbraco.Plugins.Faqs.Composers;

public class FaqsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<FaqsDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<FaqsSchemaComponent>();

        builder.Services.AddScoped<IFaqsService, FaqsService>();
    }
}

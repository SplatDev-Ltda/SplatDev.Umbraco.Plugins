using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Newsletters.Models;
using SplatDev.Umbraco.Plugins.Newsletters.Services;
using SplatDev.Umbraco.Plugins.Newsletters.Components;
using SplatDev.Umbraco.Plugins.Newsletters.Persistence;

namespace SplatDev.Umbraco.Plugins.Newsletters.Composers;

public class NewslettersComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<NewslettersDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<NewslettersSchemaComponent>();

        builder.Services.AddScoped<INewslettersService, NewslettersService>();
    }
}

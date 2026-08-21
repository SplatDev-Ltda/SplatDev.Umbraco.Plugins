using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Forums.Models;
using SplatDev.Umbraco.Plugins.Forums.Services;
using SplatDev.Umbraco.Plugins.Forums.Components;
using SplatDev.Umbraco.Plugins.Forums.Persistence;

namespace SplatDev.Umbraco.Plugins.Forums.Composers;

public class ForumsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<ForumsDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<ForumsSchemaComponent>();

        builder.Services.AddScoped<IForumsService, ForumsService>();
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.DefaultValue.Models;
using SplatDev.Umbraco.Plugins.DefaultValue.Services;
using SplatDev.Umbraco.Plugins.DefaultValue.Components;
using SplatDev.Umbraco.Plugins.DefaultValue.Persistence;

namespace SplatDev.Umbraco.Plugins.DefaultValue.Composers;

public class DefaultValueComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<DefaultValueDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<DefaultValueSchemaComponent>();

        builder.Services.AddScoped<IDefaultValueService, DefaultValueService>();
    }
}

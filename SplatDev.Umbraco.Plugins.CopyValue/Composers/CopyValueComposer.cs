using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.CopyValue.Models;
using SplatDev.Umbraco.Plugins.CopyValue.Services;
using SplatDev.Umbraco.Plugins.CopyValue.Components;
using SplatDev.Umbraco.Plugins.CopyValue.Persistence;

namespace SplatDev.Umbraco.Plugins.CopyValue.Composers;

public class CopyValueComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<CopyValueDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<CopyValueSchemaComponent>();

        builder.Services.AddScoped<ICopyValueService, CopyValueService>();
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Gdrp.Models;
using SplatDev.Umbraco.Plugins.Gdrp.Services;
using SplatDev.Umbraco.Plugins.Gdrp.Components;
using SplatDev.Umbraco.Plugins.Gdrp.Persistence;

namespace SplatDev.Umbraco.Plugins.Gdrp.Composers;

public class GdrpComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IGdrpService, GdrpService>();

        builder.Services.AddDbContext<GdrpDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<GdrpSchemaComponent>();
    }
}

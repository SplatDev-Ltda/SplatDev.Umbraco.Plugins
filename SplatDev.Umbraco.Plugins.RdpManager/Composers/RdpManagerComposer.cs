using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

using SplatDev.Umbraco.Plugins.RdpManager.Models;
using SplatDev.Umbraco.Plugins.RdpManager.Services;
using SplatDev.Umbraco.Plugins.RdpManager.Components;
using SplatDev.Umbraco.Plugins.RdpManager.Persistence;

namespace SplatDev.Umbraco.Plugins.RdpManager.Composers
{
    public class RdpManagerComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddDbContext<RdpManagerDbContext>(options =>
                SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<RdpManagerSchemaComponent>();

            builder.Services.AddScoped<IRdpManagerService, RdpManagerService>();
        }
    }
}

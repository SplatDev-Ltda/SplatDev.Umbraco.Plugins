using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

using SplatDev.Umbraco.Plugins.RdpManager.Models;
using SplatDev.Umbraco.Plugins.RdpManager.Services;
using SplatDev.Umbraco.Plugins.RdpManager.Components;
using SplatDev.Umbraco.Plugins.RdpManager.Persistence;

using SplatDev.Directory.Extensions;
using SplatDev.Directory.Ldap;
using SplatDev.Directory.EntraId;

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

            // Directory lookups for filling a connection in from Active Directory, LDAP
            // or Entra ID. Both providers are registered; each reports itself
            // unconfigured until a site supplies its settings, and the resolver picks
            // whichever is usable. Nothing here reaches a directory until then, and
            // creating accounts stays off until a site sets Directory:AllowUserCreation.
            builder.Services.AddSplatDirectory(builder.Config);
            builder.Services.AddSplatLdapDirectory();
            builder.Services.AddSplatEntraDirectory();
        }
    }
}

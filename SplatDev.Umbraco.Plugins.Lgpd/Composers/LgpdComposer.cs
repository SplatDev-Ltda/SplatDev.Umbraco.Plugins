using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Plugins.Lgpd.Components;
using SplatDev.Umbraco.Plugins.Lgpd.Models;
using SplatDev.Umbraco.Plugins.Lgpd.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

using SplatDev.Umbraco.Plugins.Lgpd.Persistence;
namespace SplatDev.Umbraco.Plugins.Lgpd.Composers;

public class LgpdComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<LgpdOptions>(builder.Config.GetSection("Lgpd"));

        builder.Services.AddDbContext<LgpdDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Services.AddScoped<ILgpdService, LgpdService>();

        // Creates the lgpd schema on first run. Registering the migration class
        // without this leaves it as dead code and the tables never exist.
        builder.Components().Append<LgpdComponent>();
    }
}

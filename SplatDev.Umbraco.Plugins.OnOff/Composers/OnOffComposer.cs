using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.OnOff.Models;
using SplatDev.Umbraco.Plugins.OnOff.Services;
using SplatDev.Umbraco.Plugins.OnOff.Components;
using SplatDev.Umbraco.Plugins.OnOff.Persistence;

namespace SplatDev.Umbraco.Plugins.OnOff.Composers;

public class OnOffComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<OnOffDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<OnOffSchemaComponent>();

        builder.Services.AddScoped<IOnOffService, OnOffService>();
    }
}

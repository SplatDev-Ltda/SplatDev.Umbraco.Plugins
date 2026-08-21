using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

using SplatDev.Umbraco.Plugins.Settings.Models;
using SplatDev.Umbraco.Plugins.Settings.Services;
using SplatDev.Umbraco.Plugins.Settings.Components;
using SplatDev.Umbraco.Plugins.Settings.Persistence;

namespace SplatDev.Umbraco.Plugins.Settings.Composers
{
    public class SettingsComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddDbContext<SettingsDbContext>(options =>
                SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<SettingsSchemaComponent>();

            builder.Services.AddScoped<ISettingsService, SettingsService>();
        }
    }
}

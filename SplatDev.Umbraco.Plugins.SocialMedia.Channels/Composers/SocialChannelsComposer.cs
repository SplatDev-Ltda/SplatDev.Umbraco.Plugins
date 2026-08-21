using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

using SplatDev.Umbraco.Plugins.SocialMedia.Channels.Models;
using SplatDev.Umbraco.Plugins.SocialMedia.Channels.Services;
using SplatDev.Umbraco.Plugins.SocialMedia.Channels.Components;
using SplatDev.Umbraco.Plugins.SocialMedia.Channels.Persistence;

namespace SplatDev.Umbraco.Plugins.SocialMedia.Channels.Composers
{
    public class SocialChannelsComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddDbContext<SocialChannelsDbContext>(options =>
                SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<SocialMediaChannelsSchemaComponent>();

            builder.Services.AddScoped<ISocialChannelsService, SocialChannelsService>();
        }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.StarRatings.Models;
using SplatDev.Umbraco.Plugins.StarRatings.Services;
using SplatDev.Umbraco.Plugins.StarRatings.Components;
using SplatDev.Umbraco.Plugins.StarRatings.Persistence;

namespace SplatDev.Umbraco.Plugins.StarRatings.Composers;

public class StarRatingsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddDbContext<StarRatingsDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<StarRatingsSchemaComponent>();

        builder.Services.AddScoped<IStarRatingsService, StarRatingsService>();
    }
}

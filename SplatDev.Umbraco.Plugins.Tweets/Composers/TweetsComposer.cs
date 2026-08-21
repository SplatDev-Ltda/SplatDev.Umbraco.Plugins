using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using SplatDev.Umbraco.Plugins.Tweets.Models;
using SplatDev.Umbraco.Plugins.Tweets.Services;
using SplatDev.Umbraco.Plugins.Tweets.Components;
using SplatDev.Umbraco.Plugins.Tweets.Persistence;

namespace SplatDev.Umbraco.Plugins.Tweets.Composers;

public class TweetsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<TweetSettings>(
            builder.Config.GetSection(TweetSettings.SectionKey));

        builder.Services.AddDbContext<TweetsDbContext>(options =>
            SplatDevDbContextConfig.UseUmbracoDatabase(options, builder.Config));

        builder.Components().Append<TweetsSchemaComponent>();

        builder.Services.AddHttpClient("TwitterV2");

        builder.Services.AddScoped<ITweetsService, TweetsService>();
    }
}

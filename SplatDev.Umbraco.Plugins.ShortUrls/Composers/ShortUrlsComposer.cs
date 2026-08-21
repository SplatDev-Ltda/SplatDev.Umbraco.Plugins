using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using SplatDev.Umbraco.Plugins.ShortUrls.Models;
using SplatDev.Umbraco.Plugins.ShortUrls.Services;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace SplatDev.Umbraco.Plugins.ShortUrls.Composers;

public class ShortUrlsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // IShortUrlService<T> is generic — use AddShortUrls<T>() below to register
        // the concrete implementation once the consuming app defines its IShortUrl entity.
    }
}

public static class ShortUrlsBuilderExtensions
{
    /// <summary>
    /// Registers the ShortUrl service for a specific entity type.
    /// Call this from your application composer:
    ///   builder.AddShortUrls&lt;YourShortUrlEntity&gt;();
    /// where YourShortUrlEntity implements IShortUrl and is tracked by your DbContext.
    /// </summary>
    public static IUmbracoBuilder AddShortUrls<T>(this IUmbracoBuilder builder)
        where T : class, IShortUrl
    {
        builder.Services.AddScoped<IShortUrlService, ShortUrlService<T>>();
        return builder;
    }
}

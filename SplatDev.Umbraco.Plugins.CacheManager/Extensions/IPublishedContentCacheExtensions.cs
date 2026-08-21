using Umbraco.Cms.Core;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Web;

namespace SplatDev.Umbraco.Plugins.CacheManager.Extensions
{
    public static class IPublishedContentCacheExtensions
    {
        public static IPublishedContentCache GetPublishedContentCache(this IUmbracoContextFactory contextFactory)
        {
            using UmbracoContextReference umbracoContextReference = contextFactory.EnsureUmbracoContext();
            return umbracoContextReference.UmbracoContext.Content!;
        }
    }
}

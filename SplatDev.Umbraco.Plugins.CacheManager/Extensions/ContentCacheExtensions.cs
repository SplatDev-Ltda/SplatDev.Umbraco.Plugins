using Microsoft.AspNetCore.Http;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;
using SplatDev.Umbraco.Plugins.CacheManager.Models;

namespace SplatDev.Umbraco.Plugins.CacheManager.Extensions
{
    public static class ContentCacheExtensions
    {
        public static IPublishedContentCache GetPublishedContentCache(IUmbracoContextFactory contextFactory)
        {
            using UmbracoContextReference umbracoContextReference = contextFactory.EnsureUmbracoContext();
            return umbracoContextReference.UmbracoContext.Content!;
        }
        public static Configuration? GetConfiguration(this IPublishedContentCache contentCache)
        {
#if NET10_0_OR_GREATER
            return null; // GetAtRoot() removed in Umbraco 17
#else
            return contentCache.GetAtRoot().DescendantsOrSelfOfType(nameof(Configuration)).FirstOrDefault()?.SafeCast<Configuration>();
#endif
        }

        public static string GetCurrentDomainWithSchema(this HttpContext httpContext)
        {
            var request = httpContext.Request;
            var scheme = request.Scheme;
            var host = request.Host.Value;

            return $"{scheme}://{host}";
        }
    }
}

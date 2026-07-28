using System.Text.Json;

using SplatDev.Umbraco.Common.Extensions;
using SplatDev.Umbraco.Markup.Extensions;

using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Extensions;

namespace SplatDev.Umbraco.Markup.Extensions
{
    public static class PublishedContentExtensions
    {
        public static bool HasGridValue(this IPublishedContent content, string alias)
        {
            try
            {
                var value = content.Value(alias);
                if (value is null) return false;

                var json = value.ToString()!;
                using var doc = JsonDocument.Parse(json);

                if (!doc.RootElement.TryGetProperty("sections", out var sections)
                    || sections.ValueKind != JsonValueKind.Array)
                    return false;

                foreach (var section in sections.EnumerateArray())
                {
                    if (!section.TryGetProperty("rows", out var rows)
                        || rows.ValueKind != JsonValueKind.Array)
                        continue;

                    foreach (var row in rows.EnumerateArray())
                    {
                        if (!row.TryGetProperty("areas", out var areas)
                            || areas.ValueKind != JsonValueKind.Array)
                            continue;

                        foreach (var area in areas.EnumerateArray())
                        {
                            if (area.TryGetProperty("controls", out var controls)
                                && controls.ValueKind == JsonValueKind.Array
                                && controls.EnumerateArray().Any())
                                return true;
                        }
                    }
                }
            }
            catch { }
            return false;
        }
        /// <summary>
        /// Returns children of the <paramref name="source"/>, of the given type <see cref="{T}"/>, that satisfy provided <paramref name="predicate"/>.
        /// </summary>
        /// <typeparam name="T">Type of the children to return.</typeparam>
        /// <param name="source">The source.</param>
        /// <param name="predicate">The predicate that child has to satisfy.</param>
        /// <returns>Children of given type <see><cref>{T}</cref></see>, that satisfy provided <paramref name="predicate"/>.</returns>
        public static IEnumerable<T>? Children<T>(this IPublishedContent source, Func<T, bool> predicate) where T : class, IPublishedContent
            => source?.Children<T>()?.Where(predicate) ?? [];

        /// <summary>
        /// Returns descendants of the <paramref name="source"/>, of the given <see cref="{T}"/>, that satisfy provided <paramref name="predicate"/>.
        /// </summary>
        /// <typeparam name="T">Type of the descendants to return.</typeparam>
        /// <param name="source">The source.</param>
        /// <param name="predicate">The predicate that descendant has to satisfy.</param>
        /// <returns>Descendants of given type <see><cref>{T}</cref></see>, that satisfy provided <paramref name="predicate"/>.</returns>
        public static IEnumerable<T> Descendants<T>(this IPublishedContent source, Func<T, bool> predicate) where T : class, IPublishedContent
            => source?.Descendants<T>().Where(predicate) ?? [];

        /// <summary>
        /// Returns the <paramref name="source"/> and its descendants, of the given type <see cref="{T}"/>, that satisfy provided <paramref name="predicate"/>.
        /// </summary>
        /// <typeparam name="T">Type of the descendants to return.</typeparam>
        /// <param name="source">The source.</param>
        /// <param name="predicate">The predicate that descendant has to satisfy.</param>
        /// <returns><paramref name="source"/> and its descendants of given type <see><cref>{T}</cref></see>, that satisfy provided <paramref name="predicate"/>.</returns>
        public static IEnumerable<T> DescendantsOrSelf<T>(this IPublishedContent source, Func<T, bool> predicate) where T : class, IPublishedContent
            => source?.DescendantsOrSelf<T>().Where(predicate) ?? [];

#if !NET10_0_OR_GREATER
        public static T? GetPublishedContentOfType<T>(this IPublishedContentCache cache, string name = "") where T : class, IPublishedContent
        {
            var nodes = cache.GetAtRoot().DescendantsOrSelf<T>();
            if (!string.IsNullOrEmpty(name)) nodes = nodes.Where(x => x.Name.Equals(name));
            return nodes.FirstOrDefault();
        }

        public static IPublishedContent? GetPublishedContentOfType(this IPublishedContentCache cache, string docTypeAlias, string name = "")
        {
            var nodes = cache.GetAtRoot().DescendantsOrSelfOfType(docTypeAlias);
            if (!string.IsNullOrEmpty(name)) nodes = nodes.Where(x => x.Name.Equals(name));
            return nodes.FirstOrDefault();
        }
#endif
    }
}

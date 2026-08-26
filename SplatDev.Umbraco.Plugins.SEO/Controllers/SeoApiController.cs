using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.SEO.Models;
// The Models.SEO type and this assembly's root namespace share a name, so an unqualified
// SEO binds to the namespace. Alias it rather than renaming a shipped public type.
using SeoModel = SplatDev.Umbraco.Plugins.SEO.Models.SEO;
using SplatDev.Umbraco.Plugins.SEO.Services;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
#if NET10_0_OR_GREATER
using Umbraco.Cms.Core.Services.Navigation;
#endif
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Extensions;

namespace SplatDev.Umbraco.Plugins.SEO.Controllers;

/// <summary>
/// Backs the SEO dashboard's Analysis tab.
/// </summary>
/// <remarks>
/// Until this existed the dashboard rendered five hardcoded pages behind a notice saying
/// "Phase 3 BE APIs are pending", so every install showed the same fictional site.
///
/// The route template is declared for both targets. On Umbraco 13 the
/// "umbraco/api/{controller}/{action}" convention would find this anyway; on 17 nothing
/// routes a plain controller by convention, so without it every call would 404 while the
/// dashboard rendered perfectly — which is the failure this repository has hit repeatedly.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/seo/[action]")]
public sealed class SeoApiController : ControllerBase
{
    private readonly IUmbracoContextAccessor _contextAccessor;
    private readonly SeoAnalyzer _analyzer;
    private readonly SeoDefaultsStore _defaults;
#if NET10_0_OR_GREATER
    private readonly IDocumentNavigationQueryService _navigation;

    public SeoApiController(
        IUmbracoContextAccessor contextAccessor,
        SeoAnalyzer analyzer,
        SeoDefaultsStore defaults,
        IDocumentNavigationQueryService navigation)
    {
        _contextAccessor = contextAccessor;
        _analyzer = analyzer;
        _defaults = defaults;
        _navigation = navigation;
    }
#else
    public SeoApiController(
        IUmbracoContextAccessor contextAccessor,
        SeoAnalyzer analyzer,
        SeoDefaultsStore defaults)
    {
        _contextAccessor = contextAccessor;
        _analyzer = analyzer;
        _defaults = defaults;
    }
#endif

    /// <summary>Every published page, scored.</summary>
    [HttpGet]
    public async Task<IActionResult> Analysis()
    {
        var pages = await AnalyseAllAsync();
        if (pages is null)
        {
            // No content cache means the site is still starting, not that there is nothing
            // to report. Say so rather than returning an empty list the dashboard would
            // render as "no issues".
            return StatusCode(503, new { error = "The published content cache is not available yet." });
        }

        return Ok(pages);
    }

    /// <summary>Counts by score, for the dashboard's summary row.</summary>
    [HttpGet]
    public async Task<IActionResult> Summary()
    {
        var pages = await AnalyseAllAsync();
        if (pages is null)
        {
            return StatusCode(503, new { error = "The published content cache is not available yet." });
        }

        return Ok(new
        {
            total = pages.Count,
            good = pages.Count(p => p.Score == SeoScore.Good),
            warning = pages.Count(p => p.Score == SeoScore.Warning),
            poor = pages.Count(p => p.Score == SeoScore.Poor),
        });
    }

    /// <summary>The site-wide defaults, for the Meta Tags and Open Graph tabs.</summary>
    [HttpGet]
    public IActionResult Defaults() => Ok(_defaults.Get());

    /// <summary>Saves the site-wide defaults.</summary>
    [HttpPost]
    public IActionResult SaveDefaults([FromBody] SeoDefaults defaults)
    {
        if (defaults is null) return BadRequest(new { error = "No settings were supplied." });

        _defaults.Save(defaults);
        return Ok(_defaults.Get());
    }

    /// <summary>
    /// Null when the content cache is not up yet, which is different from an empty site.
    /// </summary>
    /// <remarks>
    /// Umbraco 13 reads the roots synchronously; 17 replaced that with GetAtRootAsync and
    /// dropped the sync overload from IPublishedContentCache, so this is one of the places
    /// the two majors genuinely diverge.
    /// </remarks>
    private async Task<List<PageAnalysis>?> AnalyseAllAsync()
    {
        if (!_contextAccessor.TryGetUmbracoContext(out var context) || context.Content is null)
        {
            return null;
        }

#if NET10_0_OR_GREATER
        // Umbraco 17 removed root enumeration from IPublishedContentCache entirely — it is
        // down to GetByIdAsync. Walking the tree now means asking the navigation service
        // for keys and resolving each one. Returning null here instead, as one other
        // plugin in this repo does, would leave the dashboard empty on the newer major.
        var pages = new List<IPublishedContent>();
        if (_navigation.TryGetRootKeys(out var rootKeys))
        {
            foreach (var rootKey in rootKeys)
            {
                var keys = new List<Guid> { rootKey };
                if (_navigation.TryGetDescendantsKeys(rootKey, out var descendants))
                {
                    keys.AddRange(descendants);
                }

                foreach (var key in keys)
                {
                    var node = await context.Content.GetByIdAsync(key);
                    if (node is not null) pages.Add(node);
                }
            }
        }

        var roots = pages;
#else
        var roots = context.Content.GetAtRoot().SelectMany(r => r.DescendantsOrSelf()).ToList();
        await Task.CompletedTask;
#endif

        return roots
            .Where(p => p.IsPublished())
            .Select(p => _analyzer.Analyse(p.Name, p.Url(), ReadSeo(p)))
            .ToList();
    }

    /// <summary>
    /// Reads whatever SEO properties the document type happens to expose.
    /// </summary>
    /// <remarks>
    /// Property aliases are a site-level decision, so several spellings are accepted rather
    /// than imposing one. A page with none of them simply scores on what it has.
    /// </remarks>
    private static SeoModel ReadSeo(IPublishedContent page) => new()
    {
        Title = First(page, "seoMetaTitle", "metaTitle", "seoTitle", "browserTitle"),
        Description = First(page, "seoMetaDescription", "metaDescription", "seoDescription"),
        Canonical = First(page, "seoCanonical", "canonicalUrl", "canonical"),
        Robots = First(page, "seoRobots", "robots", "metaRobots"),
    };

    private static string First(IPublishedContent page, params string[] aliases)
    {
        foreach (var alias in aliases)
        {
            if (page.HasProperty(alias))
            {
                var value = page.Value<string>(alias);
                if (!string.IsNullOrWhiteSpace(value)) return value;
            }
        }

        return string.Empty;
    }
}

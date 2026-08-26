namespace SplatDev.Umbraco.Plugins.SEO.Models;

/// <summary>
/// Site-wide SEO fallbacks, edited from the dashboard's Meta Tags and Open Graph tabs.
/// </summary>
/// <remarks>
/// Site-wide rather than per-page on purpose: neither tab has a page selector, and per-page
/// values belong on the site's own document types, which this plugin does not own.
///
/// Property names match the JSON the dashboard already posts — metaTitle, ogType and the
/// rest — so the element needs no reshaping.
/// </remarks>
public sealed class SeoDefaults
{
    public string MetaTitle { get; set; } = string.Empty;

    public string MetaDescription { get; set; } = string.Empty;

    public string CanonicalUrl { get; set; } = string.Empty;

    public string Keywords { get; set; } = string.Empty;

    public bool NoIndex { get; set; }

    public bool NoFollow { get; set; }

    public string OgTitle { get; set; } = string.Empty;

    public string OgDescription { get; set; } = string.Empty;

    public string OgImageUrl { get; set; } = string.Empty;

    /// <summary>"website", "article" or "product" — the values the dashboard offers.</summary>
    public string OgType { get; set; } = "website";

    /// <summary>
    /// The robots directive these flags add up to, in the form a meta tag expects.
    /// </summary>
    public string ToRobots() => (NoIndex, NoFollow) switch
    {
        (true, true) => "noindex,nofollow",
        (true, false) => "noindex,follow",
        (false, true) => "index,nofollow",
        _ => "index,follow",
    };
}

using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.Restricted.Models;
using SplatDev.Umbraco.Plugins.Restricted.Services;
using Umbraco.Cms.Core.Web;

namespace SplatDev.Umbraco.Plugins.Restricted.ViewComponents;

/// <summary>
/// Describes the protection on a page — by default, the page being rendered.
/// </summary>
/// <remarks>
/// The argument was a required <c>int nodeId</c>, which meant every template had to know
/// and hard-code a numeric id that changes between environments. It now defaults to the
/// current page and accepts a key, id or UDI when a template genuinely means another node.
/// </remarks>
public class RestrictedViewComponent : ViewComponent
{
    private readonly IRestrictedContentService _service;
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;

    public RestrictedViewComponent(
        IRestrictedContentService service,
        IUmbracoContextAccessor umbracoContextAccessor)
    {
        _service = service;
        _umbracoContextAccessor = umbracoContextAccessor;
    }

    public async Task<IViewComponentResult> InvokeAsync(string? node = null)
    {
        var reference = node;

        if (string.IsNullOrWhiteSpace(reference)
            && _umbracoContextAccessor.TryGetUmbracoContext(out var context)
            && context.PublishedRequest?.PublishedContent is { } current)
        {
            reference = current.Key.ToString();
        }

        var restriction = string.IsNullOrWhiteSpace(reference)
            ? null
            : await _service.GetRestrictedNodeAsync(reference);

        ViewBag.IsRestricted = restriction is not null;
        ViewBag.NodeName = restriction?.Node.Name;

        return View(restriction?.MemberGroups ?? new List<MemberGroupRef>());
    }
}

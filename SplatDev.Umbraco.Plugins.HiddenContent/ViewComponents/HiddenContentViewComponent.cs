using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.HiddenContent.Services;
using Umbraco.Cms.Core.Web;

namespace SplatDev.Umbraco.Plugins.HiddenContent.ViewComponents;

/// <summary>
/// Reports whether a page is hidden from navigation — by default, the page being rendered.
/// </summary>
/// <remarks>
/// The argument was a required <c>int nodeId</c>, so every template had to hard-code a
/// numeric id that differs between environments. It now defaults to the current page and
/// accepts a key, id or UDI when a template genuinely means another node.
/// </remarks>
public class HiddenContentViewComponent : ViewComponent
{
    private readonly IHiddenContentService _service;
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;

    public HiddenContentViewComponent(
        IHiddenContentService service,
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

        var isHidden = string.IsNullOrWhiteSpace(reference)
            ? null
            : await _service.IsHiddenAsync(reference);

        ViewBag.IsHidden = isHidden ?? false;
        ViewBag.Found = isHidden is not null;

        return View(isHidden ?? false);
    }
}

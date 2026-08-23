using Microsoft.AspNetCore.Mvc;

namespace SplatDev.Umbraco.Plugins.Newsletters.ViewComponents;

public class NewsletterSubscribeViewComponent : ViewComponent
{
    public IViewComponentResult Invoke(string? buttonLabel = null, string? placeholderText = null)
    {
        ViewData["ButtonLabel"] = buttonLabel ?? "Subscribe";
        ViewData["PlaceholderText"] = placeholderText ?? "Enter your email address";
        return View();
    }
}

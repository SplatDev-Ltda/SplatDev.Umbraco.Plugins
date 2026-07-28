using Microsoft.AspNetCore.Razor.TagHelpers;
using SplatDev.Umbraco.Plugins.LazyLoad.Services;

namespace SplatDev.Umbraco.Plugins.LazyLoad.TagHelpers;

[HtmlTargetElement("img")]
public class LazyImageTagHelper : TagHelper
{
    private readonly ILazyLoadService _service;

    public LazyImageTagHelper(ILazyLoadService service)
    {
        _service = service;
    }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var settings = _service.GetSettings();
        if (!settings.Enabled) return;

        var src = output.Attributes["src"]?.Value?.ToString();
        if (!string.IsNullOrEmpty(src))
        {
            output.Attributes.SetAttribute("data-src", src);
            output.Attributes.SetAttribute("src", settings.Placeholder);
            var existing = output.Attributes["class"]?.Value?.ToString() ?? "";
            output.Attributes.SetAttribute("class", (existing + " lazy").Trim());
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SplatDev.Umbraco.Plugins.Tweets.Models;
using SplatDev.Umbraco.Plugins.Tweets.Services;

namespace SplatDev.Umbraco.Plugins.Tweets.ViewComponents;

public class TweetsViewComponent : ViewComponent
{
    private readonly ITweetsService _service;
    private readonly TweetSettings _settings;

    public TweetsViewComponent(ITweetsService service, IOptions<TweetSettings> settings)
    {
        _service = service;
        _settings = settings.Value;
    }

    public async Task<IViewComponentResult> InvokeAsync(int? maxItems = null)
    {
        var tweets = await _service.GetCachedTweetsAsync();

        if (maxItems.HasValue && maxItems.Value > 0)
            tweets = tweets.Take(maxItems.Value).ToList();

        ViewData["Settings"] = _settings;
        return View(tweets);
    }
}

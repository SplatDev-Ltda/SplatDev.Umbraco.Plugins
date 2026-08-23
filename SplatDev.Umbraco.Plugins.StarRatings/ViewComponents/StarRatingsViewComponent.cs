using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.StarRatings.Models;
using SplatDev.Umbraco.Plugins.StarRatings.Services;

namespace SplatDev.Umbraco.Plugins.StarRatings.ViewComponents;

public class StarRatingsViewComponent : ViewComponent
{
    private readonly IStarRatingsService _service;

    public StarRatingsViewComponent(IStarRatingsService service) => _service = service;

    public async Task<IViewComponentResult> InvokeAsync(Guid contentKey)
    {
        var average = await _service.GetAverageAsync(contentKey);
        var count = await _service.GetVoteCountAsync(contentKey);

        var model = new ContentRatingSummary
        {
            ContentKey = contentKey,
            AverageRating = average,
            TotalVotes = count
        };

        return View(model);
    }
}

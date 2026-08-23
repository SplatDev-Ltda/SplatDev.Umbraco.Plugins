using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.VisitorCounter.Services;

namespace SplatDev.Umbraco.Plugins.VisitorCounter.ViewComponents;

public class VisitorCounterViewModel
{
    public long TotalVisits { get; set; }
    public long UniqueVisits { get; set; }
    public int PeriodDays { get; set; }
}

public class VisitorCounterViewComponent : ViewComponent
{
    private readonly IVisitorCounterService _service;

    public VisitorCounterViewComponent(IVisitorCounterService service) => _service = service;

    public async Task<IViewComponentResult> InvokeAsync(int days = 30)
    {
        var total = await _service.GetTotalVisitsAsync();
        var unique = await _service.GetUniqueVisitsAsync(days);

        return View(new VisitorCounterViewModel
        {
            TotalVisits = total,
            UniqueVisits = unique,
            PeriodDays = days
        });
    }
}

using Microsoft.AspNetCore.Mvc;
using SplatDev.Umbraco.Plugins.Rsvp.Services;

namespace SplatDev.Umbraco.Plugins.Rsvp.ViewComponents;

public class RsvpViewComponent : ViewComponent
{
    private readonly IRsvpService _service;

    public RsvpViewComponent(IRsvpService service)
    {
        _service = service;
    }

    public async Task<IViewComponentResult> InvokeAsync(int eventId, CancellationToken cancellationToken = default)
    {
        var rsvpEvent = await _service.GetEventAsync(eventId, cancellationToken);
        return View(rsvpEvent);
    }
}

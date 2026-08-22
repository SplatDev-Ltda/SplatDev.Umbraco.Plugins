using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Rsvp.Models;
using SplatDev.Umbraco.Plugins.Rsvp.Services;

namespace SplatDev.Umbraco.Plugins.Rsvp.Controllers;

/// <remarks>
/// Previously anonymous. GetAttendees returned every attendee's name, email and phone for any event id to any caller - a straight personal-data disclosure - and CancelRegistration cancelled anyone's booking by id. Browsing events and registering stay open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/rsvp/[action]")]
public class RsvpApiController : ControllerBase
{
    private readonly IRsvpService _service;

    public RsvpApiController(IRsvpService service)
    {
        _service = service;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetEvents(CancellationToken cancellationToken = default)
        => Ok((await _service.GetEventsAsync(cancellationToken)).Select(RsvpEventDto.From));

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetEvent(int id, CancellationToken cancellationToken = default)
    {
        var rsvpEvent = await _service.GetEventAsync(id, cancellationToken);
        return rsvpEvent is null ? NotFound() : Ok(RsvpEventDto.From(rsvpEvent));
    }

    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] RsvpEvent rsvpEvent, CancellationToken cancellationToken = default)
    {
        // Without [ApiController] an unbindable body arrives as null instead of being
        // rejected for us, and reading it throws a 500 where a 400 belongs.
        if (rsvpEvent is null) return BadRequest("An event is required.");
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var created = await _service.CreateEventAsync(rsvpEvent, cancellationToken);
        return CreatedAtAction(nameof(GetEvent), new { id = created.Id }, RsvpEventDto.From(created));
    }

    [HttpPut]
    public async Task<IActionResult> UpdateEvent(int id, [FromBody] RsvpEvent rsvpEvent, CancellationToken cancellationToken = default)
    {
        if (rsvpEvent is null) return BadRequest("An event is required.");
        if (id != rsvpEvent.Id) return BadRequest("ID mismatch.");
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var updated = await _service.UpdateEventAsync(rsvpEvent, cancellationToken);
        return updated is null ? NotFound() : Ok(RsvpEventDto.From(updated));
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteEvent(int id, CancellationToken cancellationToken = default)
    {
        var deleted = await _service.DeleteEventAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RsvpAttendee attendee, CancellationToken cancellationToken = default)
    {
        if (attendee is null) return BadRequest("Your details are required.");
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.RegisterAsync(attendee, cancellationToken);
        if (!result.Success) return BadRequest(new { message = result.Message });

        // Returning the saved entity here is what made registering fail: it carries the
        // event, which carries the attendees, which carry the event. The person was
        // registered and then handed a 500.
        return Ok(new
        {
            message = result.Message,
            attendee = result.Attendee is null ? null : RsvpAttendeeDto.From(result.Attendee),
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAttendees(int eventId, CancellationToken cancellationToken = default)
        => Ok((await _service.GetAttendeesAsync(eventId, cancellationToken)).Select(RsvpAttendeeDto.From));

    [HttpPost]
    public async Task<IActionResult> CancelRegistration(int attendeeId, CancellationToken cancellationToken = default)
    {
        var cancelled = await _service.CancelRegistrationAsync(attendeeId, cancellationToken);
        return cancelled ? Ok(new { message = "Registration cancelled." }) : NotFound();
    }
}

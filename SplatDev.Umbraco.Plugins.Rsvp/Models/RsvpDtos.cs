namespace SplatDev.Umbraco.Plugins.Rsvp.Models;

/// <summary>
/// An event as the API returns it, carrying counts rather than the people.
/// </summary>
/// <remarks>
/// Two problems, and one shape fixes both.
///
/// The endpoints serialized the <see cref="RsvpEvent"/> entity straight out of EF. The
/// queries Include the attendees, and every attendee carries an Event back-reference,
/// so System.Text.Json looped:
///
///     Path: $.Attendees.Event.Attendees.Event.Attendees.Event...
///
/// The moment one person registered, Register returned 500 having already saved them,
/// and GetEvents returned 500 for everyone from then on. An event with nobody on it
/// serialized fine, so an untouched install looked healthy.
///
/// The second problem is why this type carries no people at all. GetEvents and GetEvent
/// are deliberately anonymous so a front end can list what is on — but they Include the
/// attendees, so each one would have handed every registered person's name, e-mail and
/// phone number to any caller. That is the same disclosure the authorization work closed
/// on GetAttendees, reachable by a different route. Counts are what a public listing
/// needs; the people are behind GetAttendees, which requires backoffice access.
/// </remarks>
public class RsvpEventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime EventDate { get; set; }
    public string? Location { get; set; }
    public int? MaxCapacity { get; set; }
    public DateTime? RegistrationDeadline { get; set; }
    public bool IsPublished { get; set; }

    /// <summary>How many people hold a confirmed place.</summary>
    public int ConfirmedCount { get; set; }

    /// <summary>How many are waiting for one.</summary>
    public int WaitlistedCount { get; set; }

    /// <summary>Places left, or null when the event has no capacity limit.</summary>
    public int? SpacesRemaining { get; set; }

    public static RsvpEventDto From(RsvpEvent rsvpEvent)
    {
        var attendees = rsvpEvent.Attendees ?? new List<RsvpAttendee>();
        var confirmed = attendees.Count(a => a.Status == AttendeeStatus.Confirmed);

        return new RsvpEventDto
        {
            Id = rsvpEvent.Id,
            Title = rsvpEvent.Title,
            Description = rsvpEvent.Description,
            EventDate = rsvpEvent.EventDate,
            Location = rsvpEvent.Location,
            MaxCapacity = rsvpEvent.MaxCapacity,
            RegistrationDeadline = rsvpEvent.RegistrationDeadline,
            IsPublished = rsvpEvent.IsPublished,
            ConfirmedCount = confirmed,
            WaitlistedCount = attendees.Count(a => a.Status == AttendeeStatus.Waitlisted),
            SpacesRemaining = rsvpEvent.MaxCapacity is { } capacity
                ? Math.Max(0, capacity - confirmed)
                : null,
        };
    }
}

/// <summary>
/// An attendee, without the back-reference to the event.
/// </summary>
/// <remarks>
/// Only returned by GetAttendees, which requires backoffice access. Nothing anonymous
/// returns this type.
/// </remarks>
public class RsvpAttendeeDto
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public AttendeeStatus Status { get; set; }
    public DateTime RegisteredAt { get; set; }

    public static RsvpAttendeeDto From(RsvpAttendee attendee) => new()
    {
        Id = attendee.Id,
        EventId = attendee.EventId,
        FirstName = attendee.FirstName,
        LastName = attendee.LastName,
        Email = attendee.Email,
        Phone = attendee.Phone,
        Status = attendee.Status,
        RegisteredAt = attendee.RegisteredAt,
    };
}

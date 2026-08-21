using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.Rsvp.Models;

public enum AttendeeStatus
{
    Confirmed,
    Waitlisted,
    Cancelled
}

public class RsvpAttendee
{
    public int Id { get; set; }

    public int EventId { get; set; }

    [Required, MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, MaxLength(200), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? Phone { get; set; }

    public AttendeeStatus Status { get; set; } = AttendeeStatus.Confirmed;

    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

    public RsvpEvent? Event { get; set; }
}

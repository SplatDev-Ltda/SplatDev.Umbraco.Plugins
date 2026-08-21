using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.Rsvp.Models;

public class RsvpEvent
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime EventDate { get; set; }

    [MaxLength(300)]
    public string? Location { get; set; }

    public int? MaxCapacity { get; set; }

    public DateTime? RegistrationDeadline { get; set; }

    public bool IsPublished { get; set; }

    public ICollection<RsvpAttendee> Attendees { get; set; } = new List<RsvpAttendee>();
}

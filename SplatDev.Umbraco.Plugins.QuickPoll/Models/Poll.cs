using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.QuickPoll.Models;

public class Poll
{
    public int Id { get; set; }

    [Required, MaxLength(500)]
    public string Question { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ExpiresAt { get; set; }

    public ICollection<PollOption> Options { get; set; } = new List<PollOption>();

    public ICollection<PollVote> Votes { get; set; } = new List<PollVote>();
}

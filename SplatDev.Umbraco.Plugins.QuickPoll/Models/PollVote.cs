using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.QuickPoll.Models;

public class PollVote
{
    public int Id { get; set; }

    public int PollId { get; set; }

    public int OptionId { get; set; }

    [MaxLength(45)]
    public string VoterIp { get; set; } = string.Empty;

    public DateTime VotedAt { get; set; } = DateTime.UtcNow;

    public Poll? Poll { get; set; }

    public PollOption? Option { get; set; }
}

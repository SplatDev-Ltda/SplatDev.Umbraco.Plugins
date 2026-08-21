using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.QuickPoll.Models;

public class PollOption
{
    public int Id { get; set; }

    public int PollId { get; set; }

    [Required, MaxLength(300)]
    public string OptionText { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public int VoteCount { get; set; }

    public Poll? Poll { get; set; }

    public ICollection<PollVote> Votes { get; set; } = new List<PollVote>();
}

namespace SplatDev.Umbraco.Plugins.QuickPoll.Models;

/// <summary>
/// A poll as the API returns it.
/// </summary>
/// <remarks>
/// The endpoints used to serialize the <see cref="Poll"/> entity straight out of EF.
/// Because the queries Include the options, and every option carries a Poll
/// back-reference, System.Text.Json walked Poll to Option to Poll and gave up:
///
///     A possible object cycle was detected.
///
/// That is a 500 from both GetAll and Create, so a site with even one poll could not
/// list its polls — and creating a poll saved it and then failed on the way back, so
/// making a single poll was enough to break the dashboard for good. An empty install
/// looked fine, which is why it survived.
///
/// Projecting is the fix rather than a serializer setting: nothing outside this shape
/// can leak, and the shape is what the dashboard actually needs.
/// </remarks>
public class PollDto
{
    public int Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int TotalVotes { get; set; }
    public List<PollOptionDto> Options { get; set; } = new();

    public static PollDto From(Poll poll) => new()
    {
        Id = poll.Id,
        Question = poll.Question,
        IsActive = poll.IsActive,
        CreatedAt = poll.CreatedAt,
        ExpiresAt = poll.ExpiresAt,
        TotalVotes = poll.Options?.Sum(o => o.VoteCount) ?? 0,
        Options = poll.Options?
            .OrderBy(o => o.SortOrder)
            .Select(PollOptionDto.From)
            .ToList() ?? new List<PollOptionDto>(),
    };
}

/// <summary>One option on a poll, without the back-reference to its poll.</summary>
public class PollOptionDto
{
    public int Id { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public int VoteCount { get; set; }

    public static PollOptionDto From(PollOption option) => new()
    {
        Id = option.Id,
        OptionText = option.OptionText,
        SortOrder = option.SortOrder,
        VoteCount = option.VoteCount,
    };
}

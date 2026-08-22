namespace SplatDev.Umbraco.Plugins.Surveys.Models;

/// <summary>
/// A survey as the API returns it.
/// </summary>
/// <remarks>
/// The endpoints serialized the <see cref="Survey"/> entity straight out of EF. The
/// queries Include the questions, and every question carries a Survey back-reference,
/// so System.Text.Json walks Survey to Question to Survey and fails with "a possible
/// object cycle was detected" — a 500 from the listing.
///
/// It does not show on an empty install: a survey with no questions serializes fine.
/// The failure arrives the first time someone adds a question, which is to say the
/// first time the plugin is actually used. QuickPoll had the identical defect and was
/// already broken; this projection keeps Surveys from getting there.
/// </remarks>
public class SurveyDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int ResponseCount { get; set; }
    public List<SurveyQuestionDto> Questions { get; set; } = new();

    public static SurveyDto From(Survey survey) => new()
    {
        Id = survey.Id,
        Title = survey.Title,
        Description = survey.Description,
        IsPublished = survey.IsPublished,
        CreatedAt = survey.CreatedAt,
        ExpiresAt = survey.ExpiresAt,
        ResponseCount = survey.Responses?.Count ?? 0,
        Questions = survey.Questions?
            .OrderBy(q => q.SortOrder)
            .Select(SurveyQuestionDto.From)
            .ToList() ?? new List<SurveyQuestionDto>(),
    };
}

/// <summary>A question, without the back-reference to its survey.</summary>
public class SurveyQuestionDto
{
    public int Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public List<SurveyOptionDto> Options { get; set; } = new();

    public static SurveyQuestionDto From(SurveyQuestion question) => new()
    {
        Id = question.Id,
        QuestionText = question.QuestionText,
        QuestionType = question.QuestionType,
        SortOrder = question.SortOrder,
        IsRequired = question.IsRequired,
        Options = question.Options?
            .OrderBy(o => o.SortOrder)
            .Select(SurveyOptionDto.From)
            .ToList() ?? new List<SurveyOptionDto>(),
    };
}

/// <summary>An answer option, without the back-reference to its question.</summary>
public class SurveyOptionDto
{
    public int Id { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public static SurveyOptionDto From(SurveyOption option) => new()
    {
        Id = option.Id,
        OptionText = option.OptionText,
        SortOrder = option.SortOrder,
    };
}

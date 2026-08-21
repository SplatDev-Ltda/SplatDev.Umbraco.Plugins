using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.Surveys.Models;

public enum QuestionType
{
    MultipleChoice,
    FreeText,
    Rating
}

public class SurveyQuestion
{
    public int Id { get; set; }

    public int SurveyId { get; set; }

    [Required, MaxLength(500)]
    public string QuestionText { get; set; } = string.Empty;

    public QuestionType QuestionType { get; set; } = QuestionType.FreeText;

    public int SortOrder { get; set; }

    public bool IsRequired { get; set; }

    public Survey? Survey { get; set; }

    public ICollection<SurveyOption> Options { get; set; } = new List<SurveyOption>();

    public ICollection<SurveyAnswer> Answers { get; set; } = new List<SurveyAnswer>();
}

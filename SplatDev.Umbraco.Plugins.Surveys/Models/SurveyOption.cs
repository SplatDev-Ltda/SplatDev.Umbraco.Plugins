using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.Surveys.Models;

public class SurveyOption
{
    public int Id { get; set; }

    public int QuestionId { get; set; }

    [Required, MaxLength(300)]
    public string OptionText { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public SurveyQuestion? Question { get; set; }
}

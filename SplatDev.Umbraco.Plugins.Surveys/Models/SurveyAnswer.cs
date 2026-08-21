namespace SplatDev.Umbraco.Plugins.Surveys.Models;

public class SurveyAnswer
{
    public int Id { get; set; }

    public int ResponseId { get; set; }

    public int QuestionId { get; set; }

    public string? AnswerText { get; set; }

    public int? SelectedOptionId { get; set; }

    public SurveyResponse? Response { get; set; }

    public SurveyQuestion? Question { get; set; }

    public SurveyOption? SelectedOption { get; set; }
}

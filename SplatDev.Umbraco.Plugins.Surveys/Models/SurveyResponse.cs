using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.Surveys.Models;

public class SurveyResponse
{
    public int Id { get; set; }

    public int SurveyId { get; set; }

    [MaxLength(200)]
    public string? RespondentEmail { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public Survey? Survey { get; set; }

    public ICollection<SurveyAnswer> Answers { get; set; } = new List<SurveyAnswer>();
}

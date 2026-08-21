using System.ComponentModel.DataAnnotations;

namespace SplatDev.Umbraco.Plugins.Surveys.Models;

public class Survey
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsPublished { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ExpiresAt { get; set; }

    public ICollection<SurveyQuestion> Questions { get; set; } = new List<SurveyQuestion>();

    public ICollection<SurveyResponse> Responses { get; set; } = new List<SurveyResponse>();
}

namespace SplatDev.Umbraco.Plugins.StarRatings.Models;

/// <summary>
/// Computed (not stored) summary of ratings for a single piece of content.
/// </summary>
public class ContentRatingSummary
{
    public Guid ContentKey { get; set; }

    /// <summary>Average star rating (1.0–5.0). Zero when no votes exist.</summary>
    public double AverageRating { get; set; }

    public int TotalVotes { get; set; }
}

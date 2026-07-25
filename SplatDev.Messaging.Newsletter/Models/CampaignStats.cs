namespace SplatDev.Messaging.Newsletter.Models;

public sealed class CampaignStats
{
    public string CampaignId { get; set; } = string.Empty;

    public int SentCount { get; set; }

    public int OpenCount { get; set; }

    public int ClickCount { get; set; }

    public int BounceCount { get; set; }

    public int ComplaintCount { get; set; }

    public int UnsubscribeCount { get; set; }

    public decimal OpenRate => SentCount > 0 ? (decimal)OpenCount / SentCount : 0;

    public decimal ClickRate => SentCount > 0 ? (decimal)ClickCount / SentCount : 0;
}

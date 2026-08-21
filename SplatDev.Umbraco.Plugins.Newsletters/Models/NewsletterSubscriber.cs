namespace SplatDev.Umbraco.Plugins.Newsletters.Models;

public class NewsletterSubscriber
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
    public bool IsConfirmed { get; set; }
    public DateTime? UnsubscribedAt { get; set; }
}

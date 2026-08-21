namespace SplatDev.Umbraco.Plugins.EmailNotifications.Models;

public class Subscriber
{
    public int Id { get; set; }
    public string? MemberId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? ListId { get; set; }
    public bool OptedIn { get; set; }
    public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
    public DateTime? OptedOutAt { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

namespace SplatDev.Umbraco.Plugins.EmailNotifications.Models;

public enum NotificationType
{
    Contract = 0,
    Payment = 1,
    System = 2,
    Newsletter = 3
}

public class Notification
{
    public int Id { get; set; }
    public string MemberId { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }
}

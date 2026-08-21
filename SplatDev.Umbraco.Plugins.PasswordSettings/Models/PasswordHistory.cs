namespace SplatDev.Umbraco.Plugins.PasswordSettings.Models;

public class PasswordHistory
{
    public int Id { get; set; }
    public int MemberId { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
}

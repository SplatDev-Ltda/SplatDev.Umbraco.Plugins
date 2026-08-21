namespace SplatDev.Umbraco.Plugins.MemberRegistration.Models;

public class RegistrationToken
{
    public int Id { get; set; }
    public int MemberId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
}

namespace SplatDev.Umbraco.Plugins.PasswordSettings.Models;

public class PasswordPolicy
{
    public int Id { get; set; }
    public int MinLength { get; set; } = 8;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireDigit { get; set; } = true;
    public bool RequireSpecial { get; set; } = false;
    public int ExpirationDays { get; set; } = 90;
    public int HistoryCount { get; set; } = 5;
}

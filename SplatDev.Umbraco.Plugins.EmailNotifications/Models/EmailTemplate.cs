namespace SplatDev.Umbraco.Plugins.EmailNotifications.Models;

public class EmailTemplate
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? HeaderHtml { get; set; }
    public string BodyHtml { get; set; } = string.Empty;
    public string? FooterHtml { get; set; }
    public string? GlobalStyles { get; set; }
    public bool IsBuiltIn { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

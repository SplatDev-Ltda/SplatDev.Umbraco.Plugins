namespace SplatDev.Umbraco.Plugins.Smtp.Models;

public class SmtpTestResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Error { get; set; }
}

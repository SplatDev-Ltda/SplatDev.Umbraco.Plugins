namespace SplatDev.Umbraco.Plugins.CustomLogin.Models;

public class CustomLoginSettings
{
    public string BrandName { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string BackgroundColor { get; set; } = "#ffffff";
    public string AccentColor { get; set; } = "#1a73e8";
    public string SupportEmail { get; set; } = string.Empty;
    public bool EnableSso { get; set; } = false;
}

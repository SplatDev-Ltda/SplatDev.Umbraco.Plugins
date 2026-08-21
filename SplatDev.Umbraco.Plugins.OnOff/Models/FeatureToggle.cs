namespace SplatDev.Umbraco.Plugins.OnOff.Models;

public class FeatureToggle
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Alias { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public DateTime? ScheduledEnableAt { get; set; }
    public DateTime? ScheduledDisableAt { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

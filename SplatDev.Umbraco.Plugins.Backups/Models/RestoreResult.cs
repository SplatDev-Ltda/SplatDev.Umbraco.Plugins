namespace SplatDev.Umbraco.Plugins.Backups.Models;

public class RestoreResult
{
    public bool Success { get; set; }
    public int RestoredContentCount { get; set; }
    public int RestoredMediaCount { get; set; }
    public List<string> Errors { get; set; } = new();
}

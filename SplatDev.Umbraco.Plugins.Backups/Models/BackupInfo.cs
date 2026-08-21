namespace SplatDev.Umbraco.Plugins.Backups.Models;

public class BackupInfo
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public long SizeBytes { get; set; }
    public string Extension { get; set; } = string.Empty;
    public bool IsCompressed { get; set; }
    public bool IsEncrypted { get; set; }
}

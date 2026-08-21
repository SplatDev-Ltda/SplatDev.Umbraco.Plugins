namespace SplatDev.Umbraco.Plugins.Backups.Models;

public class BackupRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IncludeMedia { get; set; }
    public BackupScope Scope { get; set; } = BackupScope.ContentAndMedia;
    public bool Compress { get; set; }
    public bool Encrypt { get; set; }
    public string EncryptionKey { get; set; } = string.Empty;
    public List<string> CloudProviderIds { get; set; } = new();
}

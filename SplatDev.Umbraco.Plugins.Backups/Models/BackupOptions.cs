namespace SplatDev.Umbraco.Plugins.Backups.Models;

public class BackupOptions
{
    public BackupScope Scope { get; set; } = BackupScope.ContentAndMedia;
    public bool Compress { get; set; } = true;
    public bool Encrypt { get; set; }
    public string EncryptionKey { get; set; } = string.Empty;
    public List<string> CloudProviderIds { get; set; } = new();
    public bool KeepLocal { get; set; } = true;
}

namespace SplatDev.Umbraco.Plugins.Backups.Models;

public class RestoreOptions
{
    public BackupScope Scope { get; set; } = BackupScope.Full;
    public bool OverwriteExisting { get; set; }
    public string DecryptionKey { get; set; } = string.Empty;
}

namespace SplatDev.Umbraco.Plugins.Backups.Models;

public class StorageItem
{
    public string Name { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime LastModified { get; set; }
    public bool IsDirectory { get; set; }
}

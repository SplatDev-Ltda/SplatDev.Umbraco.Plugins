namespace SplatDev.Umbraco.Plugins.Backups.Models;

public class BackupResult
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string LocalPath { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public int ContentCount { get; set; }
    public int MediaCount { get; set; }
    public bool Compressed { get; set; }
    public bool Encrypted { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<CloudUploadResult> CloudUploads { get; set; } = new();
}

public class CloudUploadResult
{
    public string ProviderId { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
    public string RemotePath { get; set; } = string.Empty;
}

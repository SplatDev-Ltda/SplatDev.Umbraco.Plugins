namespace SplatDev.Umbraco.Plugins.Dropzone.Models;

public class UploadResult
{
    public bool Success { get; set; }
    public string? MediaKey { get; set; }
    public string? Name { get; set; }
    public string? MediaTypeAlias { get; set; }
    public long SizeBytes { get; set; }
    public string? Url { get; set; }
    public string? Error { get; set; }
}

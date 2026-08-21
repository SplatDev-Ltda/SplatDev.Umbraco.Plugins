namespace SplatDev.Umbraco.Plugins.Dropzone.Models;

/// <summary>
/// What the dashboard is allowed to upload, bound from configuration.
/// </summary>
/// <remarks>
/// The upload endpoint accepted any file of any size and filed all of them as Images.
/// These limits are enforced on the server; the dashboard reads them so it can say what
/// the rules are and reject a file before spending the upload on it.
/// </remarks>
public class DropzoneOptions
{
    public const string SectionKey = "Dropzone";

    /// <summary>
    /// Extensions that may be uploaded, without the leading dot. Empty means no restriction.
    /// </summary>
    public List<string> AllowedExtensions { get; set; } = new();

    /// <summary>
    /// Largest accepted file, in megabytes. Zero or less means no limit.
    /// </summary>
    public int MaxFileSizeMb { get; set; } = 25;

    /// <summary>
    /// When a name is already taken in the destination folder, upload alongside it under a
    /// suffixed name rather than adding a second item with an identical name.
    /// </summary>
    public bool RenameOnCollision { get; set; } = true;

    public long MaxFileSizeBytes => MaxFileSizeMb > 0 ? MaxFileSizeMb * 1024L * 1024L : 0;

    public bool IsExtensionAllowed(string fileName)
    {
        if (AllowedExtensions.Count == 0)
            return true;

        var ext = Path.GetExtension(fileName).TrimStart('.');
        return AllowedExtensions.Any(a =>
            string.Equals(a.TrimStart('.'), ext, StringComparison.OrdinalIgnoreCase));
    }
}

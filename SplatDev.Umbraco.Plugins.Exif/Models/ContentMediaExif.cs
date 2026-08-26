namespace SplatDev.Umbraco.Plugins.Exif.Models;

/// <summary>
/// One image found on a content node, with whatever EXIF it carries.
/// </summary>
public sealed class ContentMediaExif
{
    public Guid MediaKey { get; set; }

    public string Name { get; set; } = string.Empty;

    /// <summary>The property alias the image was found under.</summary>
    public string PropertyAlias { get; set; } = string.Empty;

    /// <summary>Null when the item carries no EXIF, which is normal for SVGs and PDFs.</summary>
    public ExifData? Exif { get; set; }
}

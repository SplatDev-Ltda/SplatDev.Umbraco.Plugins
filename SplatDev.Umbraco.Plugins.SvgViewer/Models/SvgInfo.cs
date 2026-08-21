namespace SplatDev.Umbraco.Plugins.SvgViewer.Models;

public class SvgInfo
{
    public Guid MediaKey { get; set; }
    public string FileName { get; set; } = "";
    public string SanitizedContent { get; set; } = "";
    public int Width { get; set; }
    public int Height { get; set; }
}

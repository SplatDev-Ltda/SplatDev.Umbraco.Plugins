namespace SplatDev.Umbraco.Plugins.LiveVideo.Models;

public class LiveVideoEmbedDto
{
    public string EmbedUrl { get; set; } = string.Empty;
    public string PlatformName { get; set; } = string.Empty;
    public bool IsLive { get; set; } = false;
}

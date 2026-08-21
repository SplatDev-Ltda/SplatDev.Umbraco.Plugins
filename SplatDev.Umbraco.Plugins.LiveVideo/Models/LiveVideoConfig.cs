namespace SplatDev.Umbraco.Plugins.LiveVideo.Models;

public enum LiveVideoPlatform
{
    YouTube,
    Twitch,
    Vimeo
}

public class LiveVideoConfig
{
    public LiveVideoPlatform Platform { get; set; } = LiveVideoPlatform.YouTube;
    public string ChannelId { get; set; } = string.Empty;
    public bool IsLive { get; set; } = false;
}

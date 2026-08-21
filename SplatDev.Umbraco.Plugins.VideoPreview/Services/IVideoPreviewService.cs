using SplatDev.Umbraco.Plugins.VideoPreview.Models;

namespace SplatDev.Umbraco.Plugins.VideoPreview.Services;

public interface IVideoPreviewService
{
    Task<VideoInfo?> GetVideoInfoAsync(string url);
}

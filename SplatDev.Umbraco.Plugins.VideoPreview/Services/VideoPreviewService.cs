using System.Text.Json;
using System.Text.RegularExpressions;
using SplatDev.Umbraco.Plugins.VideoPreview.Models;

namespace SplatDev.Umbraco.Plugins.VideoPreview.Services;

public class VideoPreviewService : IVideoPreviewService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public VideoPreviewService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<VideoInfo?> GetVideoInfoAsync(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return null;

        // YouTube
        var youtubeId = ExtractYouTubeId(url);
        if (youtubeId is not null)
        {
            return new VideoInfo
            {
                VideoId = youtubeId,
                Platform = "YouTube",
                ThumbnailUrl = $"https://img.youtube.com/vi/{youtubeId}/hqdefault.jpg",
                EmbedUrl = $"https://www.youtube.com/embed/{youtubeId}",
                Title = string.Empty
            };
        }

        // Vimeo
        var vimeoId = ExtractVimeoId(url);
        if (vimeoId is not null)
        {
            var vimeoInfo = await FetchVimeoInfoAsync(vimeoId);
            return vimeoInfo;
        }

        // Dailymotion
        var dailymotionId = ExtractDailymotionId(url);
        if (dailymotionId is not null)
        {
            return new VideoInfo
            {
                VideoId = dailymotionId,
                Platform = "Dailymotion",
                ThumbnailUrl = $"https://www.dailymotion.com/thumbnail/video/{dailymotionId}",
                EmbedUrl = $"https://www.dailymotion.com/embed/video/{dailymotionId}",
                Title = string.Empty
            };
        }

        return null;
    }

    private static string? ExtractYouTubeId(string url)
    {
        var patterns = new[]
        {
            @"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})"
        };
        foreach (var pattern in patterns)
        {
            var match = Regex.Match(url, pattern);
            if (match.Success)
                return match.Groups[1].Value;
        }
        return null;
    }

    private static string? ExtractVimeoId(string url)
    {
        var match = Regex.Match(url, @"vimeo\.com\/(?:video\/)?(\d+)");
        return match.Success ? match.Groups[1].Value : null;
    }

    private static string? ExtractDailymotionId(string url)
    {
        var match = Regex.Match(url, @"dailymotion\.com\/video\/([A-Za-z0-9]+)");
        return match.Success ? match.Groups[1].Value : null;
    }

    private async Task<VideoInfo?> FetchVimeoInfoAsync(string videoId)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync($"https://vimeo.com/api/v2/video/{videoId}.json");
            if (!response.IsSuccessStatusCode)
            {
                return new VideoInfo
                {
                    VideoId = videoId,
                    Platform = "Vimeo",
                    ThumbnailUrl = string.Empty,
                    EmbedUrl = $"https://player.vimeo.com/video/{videoId}",
                    Title = string.Empty
                };
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement[0];

            return new VideoInfo
            {
                VideoId = videoId,
                Platform = "Vimeo",
                ThumbnailUrl = root.TryGetProperty("thumbnail_large", out var thumb) ? thumb.GetString() ?? string.Empty : string.Empty,
                EmbedUrl = $"https://player.vimeo.com/video/{videoId}",
                Title = root.TryGetProperty("title", out var title) ? title.GetString() ?? string.Empty : string.Empty
            };
        }
        catch
        {
            return new VideoInfo
            {
                VideoId = videoId,
                Platform = "Vimeo",
                ThumbnailUrl = string.Empty,
                EmbedUrl = $"https://player.vimeo.com/video/{videoId}",
                Title = string.Empty
            };
        }
    }
}

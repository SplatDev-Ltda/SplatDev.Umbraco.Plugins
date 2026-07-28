namespace SplatDev.Search.Meilisearch.Models;

public sealed class MeilisearchOptions
{
    public string Host { get; set; } = "http://localhost:7700";

    public string MasterKey { get; set; } = string.Empty;

    public string? SearchKey { get; set; }
}

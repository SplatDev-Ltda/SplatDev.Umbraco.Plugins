namespace SplatDev.Search.OpenSearch.Models;

public sealed class OpenSearchOptions
{
    public string ConnectionString { get; set; } = "https://localhost:9200";

    public string? Username { get; set; }

    public string? Password { get; set; }

    public bool UseAwsSigV4 { get; set; }

    public string? AwsRegion { get; set; }

    public string? AwsAccessKey { get; set; }

    public string? AwsSecretKey { get; set; }
}

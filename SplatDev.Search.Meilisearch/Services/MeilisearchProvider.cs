using Meilisearch;

using SplatDev.Search;

namespace SplatDev.Search.Meilisearch.Services;

public sealed class MeilisearchProvider 
{
    private readonly MeilisearchClient _client;

    public MeilisearchProvider(string host, string apiKey)
    {
        _client = new MeilisearchClient(host, apiKey);
    }

    internal MeilisearchProvider(MeilisearchClient client)
    {
        _client = client;
    }

    public async Task IndexAsync<T>(string index, T document, CancellationToken cancellationToken = default)
        where T : class
    {
        var indexClient = _client.Index(index);
        await indexClient.AddDocumentsAsync([document], cancellationToken: cancellationToken);
    }

    public async Task IndexManyAsync<T>(
        string index,
        IEnumerable<T> documents,
        CancellationToken cancellationToken = default)
        where T : class
    {
        var indexClient = _client.Index(index);
        await indexClient.AddDocumentsAsync(documents, cancellationToken: cancellationToken);
    }

    public async Task<SearchResult<T>> SearchAsync<T>(
        string index,
        SearchRequest request,
        CancellationToken cancellationToken = default)
        where T : class
    {
        var indexClient = _client.Index(index);

        var searchQuery = new global::Meilisearch.SearchQuery
        {
            Q = request.Query ?? string.Empty,
            Offset = request.From,
            Limit = request.Size,
            Sort = request.Sort?.Select(s => $"{s.Field}:{s.Direction.ToString().ToLowerInvariant()}").ToArray(),
        };

        if (request.Filters is { Count: > 0 })
        {
            searchQuery.Filter = string.Join(" AND ", request.Filters.Select(kv => $"{kv.Key} = {kv.Value}"));
        }

        if (request.Fields is { Count: > 0 })
        {
            searchQuery.AttributesToRetrieve = [.. request.Fields];
        }

        var result = await indexClient.SearchAsync<T>(
            request.Query ?? string.Empty,
            searchQuery,
            cancellationToken);
        var paginated = result as PaginatedSearchResult<T>;

        return new SearchResult<T>
        {
            Documents = result.Hits.ToList().AsReadOnly(),
            Total = paginated?.TotalHits ?? result.Hits.Count,
            TookMs = result.ProcessingTimeMs,
        };
    }

    public async Task DeleteAsync(string index, string documentId, CancellationToken cancellationToken = default)
    {
        var indexClient = _client.Index(index);
        await indexClient.DeleteOneDocumentAsync(documentId, cancellationToken);
    }

    public async Task DeleteByQueryAsync(string index, string query, CancellationToken cancellationToken = default)
    {
        var indexClient = _client.Index(index);
        await indexClient.DeleteDocumentsAsync([query], cancellationToken);
    }

    public async Task<bool> IndexExistsAsync(string index, CancellationToken cancellationToken = default)
    {
        try
        {
            var indexClient = _client.Index(index);
            await indexClient.FetchInfoAsync(cancellationToken);
            return true;
        }
        catch (MeilisearchApiError)
        {
            return false;
        }
    }

    public async Task CreateIndexAsync(
        string index,
        object? mappings = null,
        CancellationToken cancellationToken = default)
    {
        await _client.CreateIndexAsync(index, cancellationToken: cancellationToken);
    }

    public async Task DeleteIndexAsync(string index, CancellationToken cancellationToken = default)
    {
        await _client.DeleteIndexAsync(index, cancellationToken);
    }
}

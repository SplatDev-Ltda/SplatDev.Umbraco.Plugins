using OpenSearch.Client;
using OpenSearch.Net;

using SplatDev.Search;

namespace SplatDev.Search.OpenSearch.Services;

public sealed class OpenSearchProvider 
{
    private readonly OpenSearchClient _client;

    public OpenSearchProvider(Uri nodeUri, string? username = null, string? password = null)
    {
        var pool = new SingleNodeConnectionPool(nodeUri);
        var settings = new ConnectionSettings(pool);

        if (username is not null && password is not null)
            settings.BasicAuthentication(username, password);

        _client = new OpenSearchClient(settings);
    }

    internal OpenSearchProvider(OpenSearchClient client)
    {
        _client = client;
    }

    public async Task IndexAsync<T>(string index, T document, CancellationToken cancellationToken = default)
        where T : class
    {
        var response = await _client.IndexAsync(document, i => i.Index(index), cancellationToken);

        if (!response.IsValid)
            throw new InvalidOperationException($"Index failed: {response.ServerError?.Error?.Reason}");
    }

    public async Task IndexManyAsync<T>(
        string index,
        IEnumerable<T> documents,
        CancellationToken cancellationToken = default)
        where T : class
    {
        var response = await _client.BulkAsync(b => b
            .Index(index)
            .IndexMany(documents), cancellationToken);

        if (!response.IsValid)
            throw new InvalidOperationException($"Bulk index failed: {response.ServerError?.Error?.Reason}");
    }

    public async Task<SearchResult<T>> SearchAsync<T>(
        string index,
        SearchRequest request,
        CancellationToken cancellationToken = default)
        where T : class
    {
        var response = await _client.SearchAsync<T>(s => s
            .Index(index)
            .From(request.From)
            .Size(request.Size)
            .Query(q => BuildQuery(request, q))
            .Sort(so => BuildSort(request, so))
            .Source(sf => BuildSource(request, sf)),
            cancellationToken);

        if (!response.IsValid)
            throw new InvalidOperationException($"Search failed: {response.ServerError?.Error?.Reason}");

        return new SearchResult<T>
        {
            Documents = response.Documents.ToList().AsReadOnly(),
            Total = response.Total,
            TookMs = (int)response.Took,
        };
    }

    public async Task DeleteAsync(string index, string documentId, CancellationToken cancellationToken = default)
    {
        await _client.DeleteAsync<object>(documentId, d => d.Index(index), cancellationToken);
    }

    public async Task DeleteByQueryAsync(string index, string query, CancellationToken cancellationToken = default)
    {
        await _client.DeleteByQueryAsync<object>(d => d
            .Index(index)
            .Query(q => q.QueryString(qs => qs.Query(query))),
            cancellationToken);
    }

    public async Task<bool> IndexExistsAsync(string index, CancellationToken cancellationToken = default)
    {
        var response = await _client.Indices.ExistsAsync(index, ct: cancellationToken);
        return response.Exists;
    }

    public async Task CreateIndexAsync(
        string index,
        object? mappings = null,
        CancellationToken cancellationToken = default)
    {
        await _client.Indices.CreateAsync(index, ct: cancellationToken);
    }

    public async Task DeleteIndexAsync(string index, CancellationToken cancellationToken = default)
    {
        await _client.Indices.DeleteAsync(index, ct: cancellationToken);
    }

    private static QueryContainer BuildQuery<T>(SearchRequest request, QueryContainerDescriptor<T> q) where T : class
    {
        QueryContainer container;

        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            container = q.MultiMatch(mm => mm
                .Query(request.Query)
                .Fields(request.Fields?.ToArray() ?? Infer.Fields("*")));
        }
        else
        {
            container = q.MatchAll();
        }

        if (request.Filters is { Count: > 0 })
        {
            foreach (var filter in request.Filters)
            {
                container = container && +q.Term(t => t
                    .Field(filter.Key)
                    .Value(filter.Value));
            }
        }

        return container;
    }

    private static IPromise<IList<ISort>> BuildSort<T>(SearchRequest request, SortDescriptor<T> so) where T : class
    {
        if (request.Sort is { Count: > 0 })
        {
            foreach (var s in request.Sort)
            {
                so.Field(
                    f => f.Field(s.Field).Order(s.Direction == SortDirection.Ascending
                        ? SortOrder.Ascending
                        : SortOrder.Descending));
            }
        }

        return so;
    }

    private static ISourceFilter BuildSource<T>(SearchRequest request, SourceFilterDescriptor<T> sf) where T : class
    {
        if (request.Fields is { Count: > 0 })
        {
            sf.Includes(f => f.Fields(request.Fields.ToArray()));
        }

        return sf;
    }
}

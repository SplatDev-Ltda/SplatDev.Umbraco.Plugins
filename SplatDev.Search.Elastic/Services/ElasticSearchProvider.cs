using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.QueryDsl;
using Elastic.Transport;

using SplatDev.Search;

namespace SplatDev.Search.Elastic.Services;

public sealed class ElasticSearchProvider 
{
    private readonly ElasticsearchClient _client;

    public ElasticSearchProvider(string cloudId, string apiKey)
    {
        var settings = new ElasticsearchClientSettings(cloudId, new Base64ApiKey(apiKey));
        _client = new ElasticsearchClient(settings);
    }

    public ElasticSearchProvider(Uri nodeUri)
    {
        var settings = new ElasticsearchClientSettings(nodeUri);
        _client = new ElasticsearchClient(settings);
    }

    internal ElasticSearchProvider(ElasticsearchClient client)
    {
        _client = client;
    }

    public async Task IndexAsync<T>(string index, T document, CancellationToken cancellationToken = default)
        where T : class
    {
        var response = await _client.IndexAsync(
            document,
            idx => idx.Index(index),
            cancellationToken);

        if (!response.IsValidResponse)
            throw new InvalidOperationException($"Index failed: {response.ElasticsearchServerError}");
    }

    public async Task IndexManyAsync<T>(
        string index,
        IEnumerable<T> documents,
        CancellationToken cancellationToken = default)
        where T : class
    {
        var response = await _client.BulkAsync(
            b => b.Index(index).IndexMany(documents),
            cancellationToken);

        if (!response.IsValidResponse)
            throw new InvalidOperationException($"Bulk index failed: {response.ElasticsearchServerError}");
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
            .Sort(so => BuildSort(request, so)),
            cancellationToken);

        if (!response.IsValidResponse)
            throw new InvalidOperationException($"Search failed: {response.ElasticsearchServerError}");

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
        await _client.DeleteByQueryAsync<Task>(index, d => d
            .Query(q => q.QueryString(qs => qs.Query(query))),
            cancellationToken);
    }

    public async Task<bool> IndexExistsAsync(string index, CancellationToken cancellationToken = default)
    {
        var response = await _client.Indices.ExistsAsync(index, cancellationToken);
        return response.Exists;
    }

    public async Task CreateIndexAsync(
        string index,
        object? mappings = null,
        CancellationToken cancellationToken = default)
    {
        await _client.Indices.CreateAsync<object>(index, cancellationToken);
    }

    public async Task DeleteIndexAsync(string index, CancellationToken cancellationToken = default)
    {
        await _client.Indices.DeleteAsync(index, cancellationToken);
    }

    private static QueryDescriptor<T> BuildQuery<T>(SearchRequest request, QueryDescriptor<T> q)
    {
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            q.MultiMatch(mm => mm
                .Query(request.Query)
                .Fields(global::Elastic.Clients.Elasticsearch.Fields.FromString("*")));
        }
        else
        {
            q.MatchAll(_ => { });
        }

        if (request.Filters is { Count: > 0 })
        {
            foreach (var filter in request.Filters)
            {
                var fieldValue = global::Elastic.Clients.Elasticsearch.FieldValue.String(
                    filter.Value?.ToString() ?? string.Empty);
                q.Bool(b => b.Filter(f => f
                    .Term(t => t
                        .Field(new global::Elastic.Clients.Elasticsearch.Field(filter.Key))
                        .Value(fieldValue))));
            }
        }

        return q;
    }

    private static void BuildSort<T>(SearchRequest request, SortOptionsDescriptor<T> so)
    {
        if (request.Sort is { Count: > 0 })
        {
            foreach (var s in request.Sort)
            {
                var order = s.Direction == SortDirection.Ascending
                    ? global::Elastic.Clients.Elasticsearch.SortOrder.Asc
                    : global::Elastic.Clients.Elasticsearch.SortOrder.Desc;

                so.Field(new global::Elastic.Clients.Elasticsearch.Field(s.Field), fs => fs.Order(order));
            }
        }
    }
}

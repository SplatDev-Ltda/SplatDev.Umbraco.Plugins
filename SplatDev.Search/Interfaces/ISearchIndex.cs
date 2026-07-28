namespace SplatDev.Search;

public interface ISearchIndex<TDoc>
    where TDoc : class
{
    Task IndexAsync(TDoc doc, CancellationToken cancellationToken = default);

    Task IndexManyAsync(IEnumerable<TDoc> docs, CancellationToken cancellationToken = default);

    Task DeleteAsync(string id, CancellationToken cancellationToken = default);

    Task DeleteByQueryAsync(SearchQuery query, CancellationToken cancellationToken = default);

    Task<RefreshResult> RefreshAsync(CancellationToken cancellationToken = default);
}

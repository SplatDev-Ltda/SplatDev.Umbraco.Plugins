namespace SplatDev.Search;

public interface ISearchProvider
{
    Task<SearchResult<T>> SearchAsync<T>(SearchQuery query, CancellationToken cancellationToken = default)
        where T : class;

    Task<AutocompleteResult> AutocompleteAsync(string prefix, AutocompleteOptions? options = null, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Facet>> FacetsAsync(SearchQuery query, IEnumerable<string> fields, CancellationToken cancellationToken = default);
}

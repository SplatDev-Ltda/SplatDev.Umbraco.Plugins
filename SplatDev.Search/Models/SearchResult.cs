namespace SplatDev.Search;

public sealed class SearchResult<TDoc>
    where TDoc : class
{
    public IReadOnlyList<TDoc> Documents { get; init; } = [];

    public long Total { get; init; }

    public int From { get; init; }

    public int Size { get; init; }

    public IReadOnlyList<Facet> Facets { get; init; } = [];

    public IReadOnlyDictionary<string, IReadOnlyList<string>>? Highlights { get; init; }

    public long TookMs { get; init; }
}

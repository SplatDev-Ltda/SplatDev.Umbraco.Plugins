namespace SplatDev.Search;

public sealed class Facet
{
    public string Field { get; init; } = string.Empty;

    public IReadOnlyList<FacetValue> Values { get; init; } = [];
}

public sealed class FacetValue
{
    public string Value { get; init; } = string.Empty;

    public long Count { get; init; }
}

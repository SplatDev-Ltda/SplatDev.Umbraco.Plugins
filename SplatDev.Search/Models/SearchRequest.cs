namespace SplatDev.Search;

public sealed class SearchRequest
{
    public string? Query { get; set; }

    public int From { get; set; }

    public int Size { get; set; } = 20;

    public Dictionary<string, object> Filters { get; set; } = [];

    public List<string> Fields { get; set; } = [];

    public List<SearchSortField> Sort { get; set; } = [];
}

public sealed class SearchSortField
{
    public string Field { get; set; } = string.Empty;

    public SortDirection Direction { get; set; } = SortDirection.Ascending;
}

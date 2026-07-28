namespace SplatDev.Search;

public class SearchOptions
{
    public string IndexPrefix { get; set; } = "splatdev";

    public string KeySeparator { get; set; } = "-";

    public RefreshPolicy DefaultRefresh { get; set; } = RefreshPolicy.None;

    public bool ThrowOnEmptyIndex { get; set; }

    public int BulkChunkSize { get; set; } = 500;
}

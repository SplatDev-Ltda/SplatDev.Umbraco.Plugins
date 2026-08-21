namespace SplatDev.Umbraco.Plugins.ExamineExtensions.Models;

public class SearchResult
{
    public long TotalItems { get; set; }
    public List<SearchResultItem> Items { get; set; } = new();
}

public class SearchResultItem
{
    public string Id { get; set; } = "";
    public float Score { get; set; }
    public Dictionary<string, string> Fields { get; set; } = new();
}

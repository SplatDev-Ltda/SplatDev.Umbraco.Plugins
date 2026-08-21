namespace SplatDev.Umbraco.Plugins.ExamineExtensions.Models;

public class SearchRequest
{
    public string Query { get; set; } = "";
    public string IndexName { get; set; } = "ExternalIndex";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string[]? Fields { get; set; }
}

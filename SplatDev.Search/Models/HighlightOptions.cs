namespace SplatDev.Search;

public sealed class HighlightOptions
{
    public List<string> Fields { get; set; } = [];

    public string PreTag { get; set; } = "<em>";

    public string PostTag { get; set; } = "</em>";

    public int FragmentSize { get; set; } = 100;

    public int NumberOfFragments { get; set; } = 5;
}

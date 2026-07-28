namespace SplatDev.Search;

public sealed class AutocompleteOptions
{
    public int Size { get; set; } = 5;

    public List<string> Fields { get; set; } = [];

    public bool Fuzzy { get; set; }

    public int Fuzziness { get; set; } = 1;
}

public sealed class AutocompleteResult
{
    public IReadOnlyList<string> Suggestions { get; init; } = [];

    public long TookMs { get; init; }
}

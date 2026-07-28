namespace SplatDev.Search;

public sealed class RefreshResult
{
    public bool Acknowledged { get; init; }

    public int ShardsTotal { get; init; }

    public int ShardsSuccessful { get; init; }
}

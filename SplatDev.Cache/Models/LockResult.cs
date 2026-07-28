namespace SplatDev.Cache;

public sealed class LockResult
{
    public bool Acquired { get; init; }

    public string Resource { get; init; } = string.Empty;

    public IDisposable? Handle { get; init; }

    public static LockResult Success(string resource, IDisposable handle) => new()
    {
        Acquired = true,
        Resource = resource,
        Handle = handle,
    };

    public static LockResult Failure(string resource) => new()
    {
        Acquired = false,
        Resource = resource,
        Handle = null,
    };
}

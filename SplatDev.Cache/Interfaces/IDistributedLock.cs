namespace SplatDev.Cache;

public interface IDistributedLock
{
    Task<LockResult> AcquireAsync(
        string resource,
        TimeSpan timeout,
        TimeSpan? autoRelease = null,
        CancellationToken cancellationToken = default);
}

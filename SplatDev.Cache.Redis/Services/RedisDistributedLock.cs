using StackExchange.Redis;

using SplatDev.Cache;

namespace SplatDev.Cache.Redis.Services;

public sealed class RedisDistributedLock : IDistributedLock
{
    private static readonly string UnlockScript = """
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
        """;

    private readonly IDatabase _database;

    public RedisDistributedLock(string connectionString)
    {
        var connection = ConnectionMultiplexer.Connect(new ConfigurationOptions
        {
            EndPoints = { connectionString },
            AbortOnConnectFail = false,
            ConnectTimeout = 5000,
        });
        _database = connection.GetDatabase();
    }

    public RedisDistributedLock(IConnectionMultiplexer connection)
    {
        _database = connection.GetDatabase();
    }

    public async Task<LockResult> AcquireAsync(
        string resource,
        TimeSpan timeout,
        TimeSpan? autoRelease = null,
        CancellationToken cancellationToken = default)
    {
        var lockValue = Guid.NewGuid().ToString("N");
        var expiry = autoRelease ?? TimeSpan.FromSeconds(30);
        var deadline = DateTime.UtcNow + timeout;

        while (DateTime.UtcNow < deadline)
        {
            var acquired = await _database.StringSetAsync(
                resource,
                lockValue,
                expiry,
                When.NotExists,
                CommandFlags.DemandMaster);

            if (acquired)
            {
                var handle = new RedisLockHandle(_database, resource, lockValue);
                return LockResult.Success(resource, handle);
            }

            await Task.Delay(100, cancellationToken);
        }

        return LockResult.Failure(resource);
    }

    private sealed class RedisLockHandle : IDisposable
    {
        private readonly IDatabase _database;
        private readonly RedisKey _resource;
        private readonly RedisValue _lockValue;
        private bool _disposed;

        public RedisLockHandle(IDatabase database, RedisKey resource, RedisValue lockValue)
        {
            _database = database;
            _resource = resource;
            _lockValue = lockValue;
        }

        public void Dispose()
        {
            if (_disposed)
                return;

            _disposed = true;

            _ = _database.ScriptEvaluateAsync(
                UnlockScript,
                [_resource],
                [_lockValue],
                CommandFlags.DemandMaster);
        }
    }
}

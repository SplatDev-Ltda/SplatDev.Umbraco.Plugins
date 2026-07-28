using System.Collections.Concurrent;
using System.Text.Json;

using Xunit;

namespace SplatDev.Tests.Cache;

public class CacheKeyBuilderTests
{
    [Fact]
    public void Build_WithSegments_JoinsWithSeparator()
    {
        var options = new SplatDev.Cache.CacheOptions
        {
            KeyPrefix = "splatdev",
            KeySeparator = ":",
        };
        var builder = new SplatDev.Cache.CacheKeyBuilder(options);

        var key = builder.Build("app", "user", "42");

        Assert.Equal("splatdev:app:user:42", key);
    }

    [Fact]
    public void Build_WithEmptyPrefix_OmitsPrefix()
    {
        var options = new SplatDev.Cache.CacheOptions
        {
            KeyPrefix = string.Empty,
            KeySeparator = ":",
        };
        var builder = new SplatDev.Cache.CacheKeyBuilder(options);

        var key = builder.Build("app", "user", "42");

        Assert.Equal("app:user:42", key);
    }

    [Fact]
    public void Build_WithSingleSegment_ReturnsPrefixedSegment()
    {
        var options = new SplatDev.Cache.CacheOptions
        {
            KeyPrefix = "splatdev",
            KeySeparator = ":",
        };
        var builder = new SplatDev.Cache.CacheKeyBuilder(options);

        var key = builder.Build("config");

        Assert.Equal("splatdev:config", key);
    }

    [Fact]
    public void BuildPattern_AppendsWildcardStar()
    {
        var options = new SplatDev.Cache.CacheOptions
        {
            KeyPrefix = "splatdev",
            KeySeparator = ":",
        };
        var builder = new SplatDev.Cache.CacheKeyBuilder(options);

        var pattern = builder.BuildPattern("app", "user");

        Assert.Equal("splatdev:app:user:*", pattern);
    }

    [Fact]
    public void BuildPattern_WithEmptyPrefix_ProducesCleanPattern()
    {
        var options = new SplatDev.Cache.CacheOptions
        {
            KeyPrefix = string.Empty,
            KeySeparator = ".",
        };
        var builder = new SplatDev.Cache.CacheKeyBuilder(options);

        var pattern = builder.BuildPattern("domain", "entity");

        Assert.Equal("domain.entity.*", pattern);
    }
}

public class PatternMatcherTests
{
    [Fact]
    public void GlobToRegex_Star_MatchesAnySequence()
    {
        Assert.True(SplatDev.Cache.PatternMatcher.IsMatch("splatdev:app:user:42", "splatdev:app:user:*"));
        Assert.True(SplatDev.Cache.PatternMatcher.IsMatch("splatdev:app:user:42:extra", "splatdev:app:user:*"));
        Assert.False(SplatDev.Cache.PatternMatcher.IsMatch("splatdev:other:key", "splatdev:app:user:*"));
    }

    [Fact]
    public void GlobToRegex_Star_MatchesStarOnly()
    {
        Assert.True(SplatDev.Cache.PatternMatcher.IsMatch("anything", "*"));
        Assert.True(SplatDev.Cache.PatternMatcher.IsMatch(string.Empty, "*"));
    }

    [Fact]
    public void GlobToRegex_QuestionMark_MatchesSingleCharacter()
    {
        Assert.True(SplatDev.Cache.PatternMatcher.IsMatch("abc", "a?c"));
        Assert.False(SplatDev.Cache.PatternMatcher.IsMatch("ac", "a?c"));
        Assert.False(SplatDev.Cache.PatternMatcher.IsMatch("abbc", "a?c"));
    }

    [Fact]
    public void GlobToRegex_LiteralDot_MatchesDot()
    {
        Assert.True(SplatDev.Cache.PatternMatcher.IsMatch("splatdev.cache.keys", "splatdev.cache.*"));
        Assert.False(SplatDev.Cache.PatternMatcher.IsMatch("splatdevXcacheXkeys", "splatdev.cache.*"));
    }

    [Fact]
    public void GlobToRegex_CaseInsensitive_ByDefault()
    {
        Assert.True(SplatDev.Cache.PatternMatcher.IsMatch("SPLATDEV:APP", "splatdev:*"));
    }

    [Fact]
    public void GlobToRegex_CaseSensitive_WhenRequested()
    {
        Assert.False(SplatDev.Cache.PatternMatcher.IsMatch("SPLATDEV:APP", "splatdev:*", caseInsensitive: false));
        Assert.True(SplatDev.Cache.PatternMatcher.IsMatch("splatdev:app", "splatdev:*", caseInsensitive: false));
    }

    [Fact]
    public void GlobToRegex_SpecialRegexChars_AreEscaped()
    {
        Assert.True(SplatDev.Cache.PatternMatcher.IsMatch("[test]", "[test]"));
        Assert.False(SplatDev.Cache.PatternMatcher.IsMatch("t", "[test]"));
    }
}

public class SystemTextJsonCacheSerializerTests
{
    private readonly SplatDev.Cache.SystemTextJsonCacheSerializer _serializer = new();

    [Fact]
    public void SerializeDeserialize_RoundTrip_ProducesEqualObject()
    {
        var original = new TestPayload { Id = 42, Name = "cache-test" };

        var bytes = _serializer.Serialize(original);
        var result = _serializer.Deserialize<TestPayload>(bytes);

        Assert.NotNull(result);
        Assert.Equal(original.Id, result.Id);
        Assert.Equal(original.Name, result.Name);
    }

    [Fact]
    public void Serialize_Null_ReturnsNull()
    {
        var bytes = _serializer.Serialize<TestPayload>(null);

        Assert.Null(bytes);
    }

    [Fact]
    public void Deserialize_Null_ReturnsDefault()
    {
        var result = _serializer.Deserialize<TestPayload>(null);

        Assert.Null(result);
    }

    [Fact]
    public void Deserialize_EmptyArray_ReturnsDefault()
    {
        var result = _serializer.Deserialize<TestPayload>([]);

        Assert.Null(result);
    }

    private sealed class TestPayload
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
    }
}

public class CacheOptionsTests
{
    [Fact]
    public void DefaultValues_MatchSpec()
    {
        var options = new SplatDev.Cache.CacheOptions();

        Assert.Equal(string.Empty, options.KeyPrefix);
        Assert.Equal(TimeSpan.FromMinutes(30), options.DefaultTtl);
        Assert.Equal(":", options.KeySeparator);
    }
}

public class LockResultTests
{
    [Fact]
    public void Success_SetsAcquiredTrue()
    {
        var handle = new TestDisposable();
        var result = SplatDev.Cache.LockResult.Success("res:1", handle);

        Assert.True(result.Acquired);
        Assert.Equal("res:1", result.Resource);
        Assert.NotNull(result.Handle);
        Assert.Same(handle, result.Handle);
    }

    [Fact]
    public void Failure_SetsAcquiredFalse()
    {
        var result = SplatDev.Cache.LockResult.Failure("res:1");

        Assert.False(result.Acquired);
        Assert.Equal("res:1", result.Resource);
        Assert.Null(result.Handle);
    }

    private sealed class TestDisposable : IDisposable
    {
        public void Dispose() { }
    }
}

public class CacheStampedeGuardTests
{
    [Fact]
    public async Task GetOrCreateWithStampedeProtectionAsync_ReturnsCachedValue_WhenAlreadySet()
    {
        var guard = new SplatDev.Cache.CacheStampedeGuard();
        var factoryCallCount = 0;

        Task<TestPayload?> GetAsync(string key, CancellationToken ct)
        {
            return Task.FromResult<TestPayload?>(new TestPayload { Id = 1, Name = "cached" });
        }

        Task SetAsync(string key, TestPayload value, SplatDev.Cache.CacheEntryOptions? opts, CancellationToken ct)
        {
            return Task.CompletedTask;
        }

        var result = await guard.GetOrCreateWithStampedeProtectionAsync(
            "key1",
            ct =>
            {
                Interlocked.Increment(ref factoryCallCount);
                return Task.FromResult(new TestPayload { Id = 2, Name = "factory" })!;
            },
            GetAsync,
            SetAsync);

        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("cached", result.Name);
        Assert.Equal(0, factoryCallCount);
    }

    [Fact]
    public async Task GetOrCreateWithStampedeProtectionAsync_CallsFactory_WhenCacheMiss()
    {
        var guard = new SplatDev.Cache.CacheStampedeGuard();
        var factoryCalled = false;
        var setCalled = false;

        Task<TestPayload?> GetAsync(string key, CancellationToken ct)
        {
            return Task.FromResult<TestPayload?>(null);
        }

        Task SetAsync(string key, TestPayload value, SplatDev.Cache.CacheEntryOptions? opts, CancellationToken ct)
        {
            setCalled = true;
            return Task.CompletedTask;
        }

        var result = await guard.GetOrCreateWithStampedeProtectionAsync(
            "key1",
            ct =>
            {
                factoryCalled = true;
                return Task.FromResult(new TestPayload { Id = 42, Name = "from-factory" })!;
            },
            GetAsync,
            SetAsync);

        Assert.NotNull(result);
        Assert.Equal(42, result.Id);
        Assert.True(factoryCalled);
        Assert.True(setCalled);
    }

    [Fact]
    public async Task GetOrCreateWithStampedeProtectionAsync_OnlyCallsFactoryOnce_UnderConcurrency()
    {
        var guard = new SplatDev.Cache.CacheStampedeGuard();
        var factoryCallCount = 0;
        var cache = new ConcurrentDictionary<string, TestPayload>();

        Task<TestPayload?> GetAsync(string key, CancellationToken ct)
        {
            cache.TryGetValue(key, out var value);
            return Task.FromResult<TestPayload?>(value);
        }

        Task SetAsync(string key, TestPayload value, SplatDev.Cache.CacheEntryOptions? opts, CancellationToken ct)
        {
            cache.TryAdd(key, value);
            return Task.CompletedTask;
        }

        var tasks = Enumerable.Range(0, 10).Select(_ =>
            guard.GetOrCreateWithStampedeProtectionAsync(
                "stampede-key",
                async ct =>
                {
                    Interlocked.Increment(ref factoryCallCount);
                    await Task.Delay(50, ct);
                    return new TestPayload { Id = 1 };
                },
                GetAsync,
                SetAsync));

        var results = await Task.WhenAll(tasks);

        Assert.All(results, r => Assert.NotNull(r));
        Assert.Equal(1, factoryCallCount);
    }

    private sealed class TestPayload
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
    }
}

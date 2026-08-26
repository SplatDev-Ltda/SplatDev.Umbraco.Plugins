using System.Reflection;
using Microsoft.Extensions.Logging.Abstractions;
using SplatDev.Umbraco.Tools.PackageActions;
using Xunit;

namespace SplatDev.Umbraco.Tools.Tests;

/// <summary>
/// Covers PackageActionRunner, which needs no Umbraco types — it scans an assembly for
/// IPackageAction, resolves each from DI, and runs it.
/// </summary>
/// <remarks>
/// The actions themselves (DataTypeAction, DocumentTypeAction and the rest) are abstract
/// bases over Umbraco services and are not covered here.
/// </remarks>
public class PackageActionRunnerTests
{
    // Test doubles live in this assembly, so the runner scanning it will find them.
    public sealed class RecordingAction : IPackageAction
    {
        public string Name => "recording";
        public int Calls { get; private set; }
        public CancellationToken SeenToken { get; private set; }

        public Task ExecuteAsync(CancellationToken cancellationToken = default)
        {
            Calls++;
            SeenToken = cancellationToken;
            return Task.CompletedTask;
        }
    }

    public sealed class ThrowingAction : IPackageAction
    {
        public string Name => "throwing";
        public Task ExecuteAsync(CancellationToken cancellationToken = default)
            => throw new InvalidOperationException("action failed");
    }

    /// <summary>Resolves only the types it was handed; everything else returns null.</summary>
    private sealed class Lookup(Dictionary<Type, object> map) : IServiceProvider
    {
        public object? GetService(Type serviceType) => map.GetValueOrDefault(serviceType);
    }

    private static PackageActionRunner Runner(params object[] registered)
    {
        var map = registered.ToDictionary(o => o.GetType(), o => o);
        return new PackageActionRunner(new Lookup(map), NullLogger<PackageActionRunner>.Instance);
    }

    [Fact]
    public async Task A_registered_action_runs()
    {
        var action = new RecordingAction();

        await Runner(action).RunAllAsync(Assembly.GetExecutingAssembly());

        Assert.Equal(1, action.Calls);
    }

    [Fact]
    public async Task The_cancellation_token_reaches_the_action()
    {
        var action = new RecordingAction();
        using var cts = new CancellationTokenSource();

        await Runner(action).RunAllAsync(Assembly.GetExecutingAssembly(), cts.Token);

        Assert.Equal(cts.Token, action.SeenToken);
    }

    [Fact]
    public async Task An_action_that_is_not_registered_is_skipped_silently()
    {
        // Worth pinning because it is a trap: forgetting to register an action in DI does
        // not fail, warn, or log anything. The action simply never runs, and the package
        // install looks successful.
        var runner = Runner();          // nothing registered at all

        await runner.RunAllAsync(Assembly.GetExecutingAssembly());
    }

    [Fact]
    public async Task One_failing_action_stops_the_ones_after_it()
    {
        // Also a trap rather than a feature: RunAllAsync has no try/catch, so the first
        // exception abandons the remainder. Asserting it means a change to that behaviour
        // is a deliberate decision rather than an accident.
        var runner = Runner(new ThrowingAction(), new RecordingAction());

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => runner.RunAllAsync(Assembly.GetExecutingAssembly()));
    }

    [Fact]
    public async Task An_assembly_with_no_actions_is_a_no_op()
    {
        // System.Private.CoreLib has no IPackageAction in it.
        await Runner().RunAllAsync(typeof(string).Assembly);
    }

    [Fact]
    public void The_interface_is_not_itself_treated_as_an_action()
    {
        // RunAllAsync filters out interfaces and abstract types. DataTypeAction and the
        // other bases in the package are abstract, so they must not be instantiated.
        var candidates = typeof(IPackageAction).Assembly.GetTypes()
            .Where(t => typeof(IPackageAction).IsAssignableFrom(t) && !t.IsAbstract && !t.IsInterface);

        Assert.DoesNotContain(candidates, t => t == typeof(IPackageAction));
        Assert.DoesNotContain(candidates, t => t.IsAbstract);
    }
}

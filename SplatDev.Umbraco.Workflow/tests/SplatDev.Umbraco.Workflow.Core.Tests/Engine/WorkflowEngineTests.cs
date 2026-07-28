using FluentAssertions;
using SplatDev.Umbraco.Workflow.Core.Engine;
using SplatDev.Umbraco.Workflow.Core.Enums;
using SplatDev.Umbraco.Workflow.Core.Tests.TestSupport;
using Xunit;

namespace SplatDev.Umbraco.Workflow.Core.Tests.Engine;

public sealed class WorkflowEngineTests
{
    [Fact]
    public async Task Transition_FromStartToNext_AdvancesCurrentStepKey()
    {
        var workflow = TestWorkflows.TwoStep();
        var eventStore = new InMemoryEventStore();
        var instance = new TestInstance(Id: 1, WorkflowKey: "demo", WorkflowVersion: 1, CurrentStepKey: "start");
        var instanceStore = new InMemoryInstanceStore(instance);
        var engine = new WorkflowEngine(
            new SingleWorkflowResolver(workflow),
            instanceStore,
            eventStore,
            new StubRouter(),
            new NoopDispatcher());

        var result = await engine.TransitionAsync(1, "approve", "user@x.com", CancellationToken.None);

        result.Success.Should().BeTrue();
        result.NewStepKey.Should().Be("next");
        instanceStore.Get(1).CurrentStepKey.Should().Be("next");
        eventStore.GetHistory(1).Should().ContainSingle(e => e.EventType == WorkflowEventType.Transition);
    }

    [Fact]
    public async Task Transition_WithUnknownAction_ReturnsFailureAndDoesNotMutate()
    {
        var workflow = TestWorkflows.TwoStep();
        var instance = new TestInstance(1, "demo", 1, "start");
        var instanceStore = new InMemoryInstanceStore(instance);
        var eventStore = new InMemoryEventStore();
        var engine = new WorkflowEngine(
            new SingleWorkflowResolver(workflow),
            instanceStore,
            eventStore,
            new StubRouter(),
            new NoopDispatcher());

        var result = await engine.TransitionAsync(1, "nonexistent", "user@x.com", CancellationToken.None);

        result.Success.Should().BeFalse();
        result.Error.Should().Contain("nonexistent");
        instanceStore.Get(1).CurrentStepKey.Should().Be("start");
        eventStore.GetHistory(1).Should().BeEmpty();
    }

    [Fact]
    public async Task Transition_ThroughFullThreeStepWorkflow_CompletesAllSteps()
    {
        var workflow = TestWorkflows.ThreeStep();
        var instance = new TestInstance(Id: 1, WorkflowKey: "three-step", WorkflowVersion: 1, CurrentStepKey: "start");
        var instanceStore = new InMemoryInstanceStore(instance);
        var eventStore = new InMemoryEventStore();
        var engine = new WorkflowEngine(
            new SingleWorkflowResolver(workflow),
            instanceStore,
            eventStore,
            new StubRouter(),
            new NoopDispatcher());

        var r1 = await engine.TransitionAsync(1, "begin", "user@x.com", CancellationToken.None);
        r1.Success.Should().BeTrue();
        r1.NewStepKey.Should().Be("review");

        var r2 = await engine.TransitionAsync(1, "approve", "user@x.com", CancellationToken.None);
        r2.Success.Should().BeTrue();
        r2.NewStepKey.Should().Be("done");

        instanceStore.Get(1).CurrentStepKey.Should().Be("done");
        eventStore.GetHistory(1).Should().HaveCount(2);
        eventStore.GetHistory(1).Should().AllSatisfy(e => e.EventType.Should().Be(WorkflowEventType.Transition));
    }

    [Fact]
    public async Task CreateAsync_CreatesInstanceAndRecordsEvent()
    {
        var workflow = TestWorkflows.TwoStep();
        var eventStore = new InMemoryEventStore();
        var instanceStore = new InMemoryInstanceStore(new TestInstance(Id: 99, WorkflowKey: "demo", WorkflowVersion: 1, CurrentStepKey: "start"));
        var engine = new WorkflowEngine(
            new SingleWorkflowResolver(workflow),
            instanceStore,
            eventStore,
            new StubRouter(),
            new NoopDispatcher());

        var result = await engine.CreateAsync("demo", "{\"name\":\"Test\"}", "admin", CancellationToken.None);

        result.Should().NotBeNull();
        result.WorkflowKey.Should().Be("demo");
        result.CurrentStepKey.Should().Be("start");
        result.MetadataJson.Should().Be("{\"name\":\"Test\"}");

        var history = eventStore.GetHistory(result.Id);
        history.Should().ContainSingle(e => e.EventType == WorkflowEventType.Created);
        history[0].PayloadJson.Should().Be("{\"name\":\"Test\"}");
    }

    [Fact]
    public async Task CreateAsync_WithNoSteps_ThrowsInvalidOperation()
    {
        var emptyWorkflow = new TestWorkflow("empty", "Empty", 1, []);
        var engine = new WorkflowEngine(
            new SingleWorkflowResolver(emptyWorkflow),
            new InMemoryInstanceStore(new TestInstance(1, "empty", 1, "start")),
            new InMemoryEventStore(),
            new StubRouter(),
            new NoopDispatcher());

        var act = () => engine.CreateAsync("empty", null, "admin", CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*empty*steps*");
    }
}

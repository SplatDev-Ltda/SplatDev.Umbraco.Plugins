using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Enums;
using SplatDev.Umbraco.Workflow.Core.Models;

#pragma warning disable SA1649

namespace SplatDev.Umbraco.Workflow.Core.Tests.TestSupport;

internal sealed class TestWorkflows
{
    public static IWorkflow TwoStep()
    {
        var steps = new List<IWorkflowStep>
        {
            new TestWorkflowStep(
                Key: "start",
                Label: "Start",
                Actions: new List<IWorkflowAction>
                {
                    new TestWorkflowAction("approve", "Approve", "next", AssignmentStrategy.AssignToSubmitter),
                },
                Department: null,
                Group: "payroll",
                PreActionMessages: [],
                PostActionMessages: []),
            new TestWorkflowStep(
                Key: "next",
                Label: "Next Step",
                Actions: [],
                Department: null,
                Group: "manager",
                PreActionMessages: [],
                PostActionMessages: []),
        };

        return new TestWorkflow("demo", "Demo Workflow", 1, steps.AsReadOnly());
    }

    public static IWorkflow ThreeStep()
    {
        var steps = new List<IWorkflowStep>
        {
            new TestWorkflowStep("start", "Start", new List<IWorkflowAction> { new TestWorkflowAction("begin", "Begin", "review", AssignmentStrategy.AssignToGroup) }, null, "payroll", [], []),
            new TestWorkflowStep("review", "Review", new List<IWorkflowAction> { new TestWorkflowAction("approve", "Approve", "done", AssignmentStrategy.Manual) }, null, "manager", [], []),
            new TestWorkflowStep("done", "Done", [], null, null, [], []),
        };
        return new TestWorkflow("three-step", "Three Step", 1, steps.AsReadOnly());
    }
}

internal sealed record TestWorkflow(string Key, string Label, int Version, IReadOnlyList<IWorkflowStep> Steps) : IWorkflow;

internal sealed record TestWorkflowStep(
    string Key,
    string Label,
    IReadOnlyList<IWorkflowAction> Actions,
    string? Department,
    string? Group,
    IReadOnlyList<IActionMessage> PreActionMessages,
    IReadOnlyList<IActionMessage> PostActionMessages) : IWorkflowStep;

internal sealed record TestWorkflowAction(string Key, string Label, string NextStepKey, AssignmentStrategy Assignment) : IWorkflowAction;

internal sealed class TestInstance : IWorkflowInstance
{
    public TestInstance(long Id, string WorkflowKey, int WorkflowVersion, string CurrentStepKey)
    {
        this.Id = Id;
        this.WorkflowKey = WorkflowKey;
        this.WorkflowVersion = WorkflowVersion;
        this.CurrentStepKey = CurrentStepKey;
    }

    public long Id { get; set; }

    public string WorkflowKey { get; set; }

    public int WorkflowVersion { get; set; }

    public string CurrentStepKey { get; set; }

    public WorkflowStatus Status { get; set; } = WorkflowStatus.Open;

    public string? MetadataJson { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string CreatedBy { get; set; } = "test-user";

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string UpdatedBy { get; set; } = "test-user";
}

internal sealed class InMemoryEventStore : IWorkflowEventStore
{
    private readonly List<WorkflowEvent> _events = new();

    public Task AppendAsync(WorkflowEvent evt, CancellationToken ct)
    {
        _events.Add(evt);
        return Task.CompletedTask;
    }

    public IReadOnlyList<WorkflowEvent> GetHistory(long instanceId) =>
        _events.Where(e => e.InstanceId == instanceId).ToList().AsReadOnly();
}

internal sealed class InMemoryInstanceStore(TestInstance initial) : IWorkflowInstanceStore
{
    private readonly List<TestInstance> _instances = new() { initial };

    public IWorkflowInstance Get(long id) =>
        _instances.FirstOrDefault(i => i.Id == id)
        ?? throw new InvalidOperationException($"Instance {id} not found.");

    public long Create(string workflowKey, int workflowVersion, string startingStepKey, string? metadataJson, string actorUsername)
    {
        var id = _instances.Count + 1L;
        var instance = new TestInstance(id, workflowKey, workflowVersion, startingStepKey)
        {
            MetadataJson = metadataJson,
            CreatedBy = actorUsername,
            UpdatedBy = actorUsername,
        };
        _instances.Add(instance);
        return id;
    }

    public void UpdateCurrentStep(long id, string newStepKey, string actorUsername)
    {
        var instance = (TestInstance)Get(id);
        instance.CurrentStepKey = newStepKey;
        instance.UpdatedBy = actorUsername;
        instance.UpdatedAt = DateTime.UtcNow;
    }
}

internal sealed class SingleWorkflowResolver(IWorkflow workflow) : IWorkflowResolver
{
    public IWorkflow Resolve(string workflowKey, int version) => workflow;
}

internal sealed class StubRouter : IAssignmentRouter
{
    public Assignment Route(IWorkflowInstance instance, IWorkflowAction action, string actorUsername) =>
        new(instance.Id, actorUsername, null, null, DateTime.UtcNow);
}

internal sealed class NoopDispatcher : IActionMessageDispatcher
{
    public Task DispatchAsync(WorkflowEvent evt, CancellationToken ct) => Task.CompletedTask;
}

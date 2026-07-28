using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Enums;
using SplatDev.Umbraco.Workflow.Core.Models;

namespace SplatDev.Umbraco.Workflow.Core.Engine;

/// <summary>Default IWorkflowEngine implementation.</summary>
public sealed class WorkflowEngine(
    IWorkflowResolver workflowResolver,
    IWorkflowInstanceStore instanceStore,
    IWorkflowEventStore eventStore,
    IAssignmentRouter assignmentRouter,
    IActionMessageDispatcher actionMessageDispatcher) : IWorkflowEngine
{
    /// <inheritdoc/>
    public async Task<IWorkflowInstance> CreateAsync(string workflowKey, string? metadataJson, string actorUsername, CancellationToken ct)
    {
        var workflow = workflowResolver.Resolve(workflowKey, version: 0);
        if (workflow.Steps.Count == 0)
        {
            throw new InvalidOperationException($"Workflow '{workflowKey}' has no steps; cannot create instance.");
        }

        var startingStep = workflow.Steps[0];

        var id = instanceStore.Create(workflow.Key, workflow.Version, startingStep.Key, metadataJson, actorUsername);

        var evt = new WorkflowEvent(
            InstanceId: id,
            EventType: WorkflowEventType.Created,
            FromStepKey: null,
            ToStepKey: startingStep.Key,
            ActionKey: null,
            PayloadJson: metadataJson,
            ActorUsername: actorUsername,
            OccurredAt: DateTime.UtcNow);
        await eventStore.AppendAsync(evt, ct).ConfigureAwait(false);

        return instanceStore.Get(id);
    }

    /// <inheritdoc/>
    public async Task<TransitionResult> TransitionAsync(long instanceId, string actionKey, string actorUsername, CancellationToken ct)
    {
        var instance = instanceStore.Get(instanceId);
        var workflow = workflowResolver.Resolve(instance.WorkflowKey, instance.WorkflowVersion);
        var currentStep = workflow.Steps.FirstOrDefault(s => s.Key == instance.CurrentStepKey)
            ?? throw new InvalidOperationException($"Current step '{instance.CurrentStepKey}' not found in workflow '{workflow.Key}' v{workflow.Version}.");

        var action = currentStep.Actions.FirstOrDefault(a => a.Key == actionKey);
        if (action is null)
        {
            return new TransitionResult(
                Success: false,
                NewStepKey: instance.CurrentStepKey,
                Error: $"Action '{actionKey}' is not valid from step '{currentStep.Key}'.");
        }

        var nextStep = workflow.Steps.FirstOrDefault(s => s.Key == action.NextStepKey)
            ?? throw new InvalidOperationException($"Target step '{action.NextStepKey}' missing from workflow.");

        instanceStore.UpdateCurrentStep(instance.Id, nextStep.Key, actorUsername);

        var evt = new WorkflowEvent(
            InstanceId: instance.Id,
            EventType: WorkflowEventType.Transition,
            FromStepKey: currentStep.Key,
            ToStepKey: nextStep.Key,
            ActionKey: action.Key,
            PayloadJson: null,
            ActorUsername: actorUsername,
            OccurredAt: DateTime.UtcNow);
        await eventStore.AppendAsync(evt, ct).ConfigureAwait(false);

        _ = assignmentRouter.Route(instance, action, actorUsername);

        await actionMessageDispatcher.DispatchAsync(evt, ct).ConfigureAwait(false);

        return new TransitionResult(Success: true, NewStepKey: nextStep.Key, Error: null);
    }
}

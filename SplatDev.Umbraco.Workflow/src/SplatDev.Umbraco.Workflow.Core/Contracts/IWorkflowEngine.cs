using SplatDev.Umbraco.Workflow.Core.Models;

namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>The state machine that drives workflow instances forward.</summary>
public interface IWorkflowEngine
{
    /// <summary>Creates a new workflow instance using the latest definition.</summary>
    /// <param name="workflowKey">The workflow definition key.</param>
    /// <param name="metadataJson">Optional metadata in JSON format.</param>
    /// <param name="actorUsername">The username of the creating actor.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The created workflow instance.</returns>
    Task<IWorkflowInstance> CreateAsync(string workflowKey, string? metadataJson, string actorUsername, CancellationToken ct);

    /// <summary>Transitions a workflow instance from its current step via the specified action.</summary>
    /// <param name="instanceId">The instance ID.</param>
    /// <param name="actionKey">The action key to execute.</param>
    /// <param name="actorUsername">The username of the actor performing the transition.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The transition result.</returns>
    Task<TransitionResult> TransitionAsync(long instanceId, string actionKey, string actorUsername, CancellationToken ct);
}

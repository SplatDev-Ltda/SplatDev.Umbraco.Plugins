using SplatDev.Umbraco.Workflow.Core.Models;

namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>Append-only event log for a workflow instance.</summary>
public interface IWorkflowEventStore
{
    /// <summary>Appends an event to the workflow event log.</summary>
    /// <param name="evt">The event to append.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AppendAsync(WorkflowEvent evt, CancellationToken ct);

    /// <summary>Gets the full event history for a workflow instance.</summary>
    /// <param name="instanceId">The instance ID.</param>
    /// <returns>The ordered list of events.</returns>
    IReadOnlyList<WorkflowEvent> GetHistory(long instanceId);
}

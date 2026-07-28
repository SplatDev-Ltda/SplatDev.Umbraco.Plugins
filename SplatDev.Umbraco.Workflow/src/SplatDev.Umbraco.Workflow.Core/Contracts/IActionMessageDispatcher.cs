using SplatDev.Umbraco.Workflow.Core.Models;

namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>Host-supplied transport for action-message notifications (email, Slack, etc.).</summary>
public interface IActionMessageDispatcher
{
    /// <summary>Dispatches action-message notifications for the given event.</summary>
    /// <param name="evt">The workflow event that triggered the dispatch.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DispatchAsync(WorkflowEvent evt, CancellationToken ct);
}

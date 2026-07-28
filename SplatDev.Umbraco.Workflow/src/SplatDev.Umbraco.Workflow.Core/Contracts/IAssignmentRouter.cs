using SplatDev.Umbraco.Workflow.Core.Models;

namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>Decides who/which group the next assignment goes to on a transition.</summary>
public interface IAssignmentRouter
{
    /// <summary>Routes an assignment for the given instance after an action is taken.</summary>
    /// <param name="instance">The workflow instance.</param>
    /// <param name="action">The action that was taken.</param>
    /// <param name="actorUsername">The username of the actor.</param>
    /// <returns>The new assignment.</returns>
    Assignment Route(IWorkflowInstance instance, IWorkflowAction action, string actorUsername);
}

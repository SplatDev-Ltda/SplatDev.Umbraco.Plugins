using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Enums;
using SplatDev.Umbraco.Workflow.Core.Models;

namespace SplatDev.Umbraco.Workflow.Persistence.Routing;

public sealed class DefaultAssignmentRouter : IAssignmentRouter
{
    public Assignment Route(IWorkflowInstance instance, IWorkflowAction action, string actorUsername)
    {
        return action.Assignment switch
        {
            AssignmentStrategy.AssignToSubmitter => new Assignment(instance.Id, actorUsername, null, null, DateTime.UtcNow),
            AssignmentStrategy.AssignToGroup => new Assignment(instance.Id, null, null, null, DateTime.UtcNow),
            AssignmentStrategy.Manual => new Assignment(instance.Id, null, null, null, DateTime.UtcNow),
            _ => throw new InvalidOperationException($"Unknown AssignmentStrategy: {action.Assignment}"),
        };
    }
}

using SplatDev.Umbraco.Workflow.Persistence.Entities;
using Umbraco.Cms.Infrastructure.Scoping;

namespace SplatDev.Umbraco.Workflow.Persistence.Repositories;

public sealed class WorkflowAssignmentRepository(IScopeProvider scopeProvider)
{
    public long Create(long instanceId, string? assignedTo, string? assignedToGroup, string? department)
    {
        using var scope = scopeProvider.CreateScope();
        var entity = new WorkflowAssignmentEntity
        {
            InstanceId = instanceId,
            AssignedTo = assignedTo,
            AssignedToGroup = assignedToGroup,
            Department = department,
            AssignedAt = DateTime.UtcNow,
            IsActive = true,
        };
        var inserted = scope.Database.Insert(entity);
        scope.Complete();
        return Convert.ToInt64(inserted);
    }

    public IReadOnlyList<WorkflowAssignmentEntity> GetActiveByInstance(long instanceId)
    {
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        return scope.Database.Fetch<WorkflowAssignmentEntity>(
            "WHERE instanceId = @0 AND isActive = 1 ORDER BY assignedAt DESC",
            instanceId);
    }

    public void Deactivate(long assignmentId)
    {
        using var scope = scopeProvider.CreateScope();
        scope.Database.Execute(
            "UPDATE splatWorkflowAssignment SET isActive = 0 WHERE id = @0",
            assignmentId);
        scope.Complete();
    }

    public void DeactivateAllForInstance(long instanceId)
    {
        using var scope = scopeProvider.CreateScope();
        scope.Database.Execute(
            "UPDATE splatWorkflowAssignment SET isActive = 0 WHERE instanceId = @0",
            instanceId);
        scope.Complete();
    }
}

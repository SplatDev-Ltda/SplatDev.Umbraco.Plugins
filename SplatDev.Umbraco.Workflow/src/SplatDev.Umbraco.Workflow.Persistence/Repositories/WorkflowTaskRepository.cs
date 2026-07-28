using SplatDev.Umbraco.Workflow.Persistence.Entities;
using Umbraco.Cms.Infrastructure.Scoping;

namespace SplatDev.Umbraco.Workflow.Persistence.Repositories;

public sealed class WorkflowTaskRepository(IScopeProvider scopeProvider)
{
    public void CreateBatch(long instanceId, IReadOnlyList<(string Alias, string Name, string? Description, int? DepartmentId)> tasks)
    {
        using var scope = scopeProvider.CreateScope();
        foreach (var (alias, name, description, departmentId) in tasks)
        {
            scope.Database.Insert(new WorkflowTaskEntity
            {
                InstanceId = instanceId,
                Alias = alias,
                Name = name,
                Description = description,
                DepartmentId = departmentId,
                IsCompleted = false,
            });
        }

        scope.Complete();
    }

    public IReadOnlyList<WorkflowTaskEntity> GetByInstance(long instanceId)
    {
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        return scope.Database.Fetch<WorkflowTaskEntity>(
            "WHERE instanceId = @0 ORDER BY id ASC",
            instanceId);
    }

    public void SetCompletion(IReadOnlyList<(long TaskId, bool IsCompleted)> entries, string actorUsername)
    {
        using var scope = scopeProvider.CreateScope();
        var now = DateTime.UtcNow;
        foreach (var (taskId, isCompleted) in entries)
        {
            scope.Database.Execute(
                "UPDATE splatWorkflowTask SET isCompleted = @0, completedAt = @1, completedBy = @2 WHERE id = @3",
                isCompleted,
                isCompleted ? now : null,
                isCompleted ? actorUsername : null,
                taskId);
        }

        scope.Complete();
    }
}

using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Persistence.Entities;
using Umbraco.Cms.Infrastructure.Scoping;

namespace SplatDev.Umbraco.Workflow.Persistence.Repositories;

public sealed class WorkflowInstanceRepository(IScopeProvider scopeProvider) : IWorkflowInstanceStore
{
    public IWorkflowInstance Get(long id)
    {
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        var entity = scope.Database.SingleOrDefault<WorkflowInstanceEntity>(
            "WHERE id = @0", id)
            ?? throw new InvalidOperationException($"Workflow instance {id} not found.");
        return entity;
    }

    public void UpdateCurrentStep(long id, string newStepKey, string actorUsername)
    {
        using var scope = scopeProvider.CreateScope();
        scope.Database.Execute(
            "UPDATE splatWorkflowInstance SET currentStepKey = @0, updatedAt = @1, updatedBy = @2 WHERE id = @3",
            newStepKey,
            DateTime.UtcNow,
            actorUsername,
            id);
        scope.Complete();
    }

    public long Create(string workflowKey, int workflowVersion, string startingStepKey, string? metadataJson, string actorUsername)
    {
        using var scope = scopeProvider.CreateScope();
        var now = DateTime.UtcNow;
        var entity = new WorkflowInstanceEntity
        {
            WorkflowKey = workflowKey,
            WorkflowVersion = workflowVersion,
            CurrentStepKey = startingStepKey,
            Status = Core.Enums.WorkflowStatus.Open,
            MetadataJson = metadataJson,
            CreatedAt = now,
            CreatedBy = actorUsername,
            UpdatedAt = now,
            UpdatedBy = actorUsername,
        };
        var inserted = scope.Database.Insert(entity);
        scope.Complete();
        return Convert.ToInt64(inserted);
    }
}

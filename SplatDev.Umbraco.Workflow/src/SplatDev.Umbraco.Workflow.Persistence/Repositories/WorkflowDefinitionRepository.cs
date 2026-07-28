using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Enums;
using SplatDev.Umbraco.Workflow.Core.Models;
using SplatDev.Umbraco.Workflow.Persistence.Entities;
using Umbraco.Cms.Infrastructure.Scoping;

namespace SplatDev.Umbraco.Workflow.Persistence.Repositories;

public sealed class WorkflowDefinitionRepository(IScopeProvider scopeProvider)
{
    public WorkflowDefinitionEntity? GetByKey(string key, int version)
    {
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        return scope.Database.SingleOrDefault<WorkflowDefinitionEntity>(
            "WHERE [key] = @0 AND version = @1 AND isActive = 1", key, version);
    }

    public WorkflowDefinitionEntity? GetHighestVersion(string key)
    {
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        return scope.Database.FirstOrDefault<WorkflowDefinitionEntity>(
            "WHERE [key] = @0 AND isActive = 1 ORDER BY version DESC", key);
    }

    public IReadOnlyList<WorkflowDefinitionEntity> GetAll()
    {
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        return scope.Database.Fetch<WorkflowDefinitionEntity>(
            "WHERE isActive = 1 ORDER BY [key], version DESC");
    }

    public int Insert(WorkflowDefinitionEntity entity)
    {
        using var scope = scopeProvider.CreateScope();
        var result = scope.Database.Insert(entity);
        scope.Complete();
        return Convert.ToInt32(result);
    }

    public void SetActive(string key, int version, bool isActive)
    {
        using var scope = scopeProvider.CreateScope();
        scope.Database.Execute(
            "UPDATE splatWorkflowDefinition SET isActive = @0 WHERE [key] = @1 AND version = @2",
            isActive,
            key,
            version);
        scope.Complete();
    }
}

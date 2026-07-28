using System.Text.Json;
using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Models;
using SplatDev.Umbraco.Workflow.Persistence.Entities;
using SplatDev.Umbraco.Workflow.Persistence.Repositories;

namespace SplatDev.Umbraco.Workflow.Persistence.Resolvers;

public sealed class WorkflowDefinitionResolver(WorkflowDefinitionRepository repository) : IWorkflowResolver
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public IWorkflow Resolve(string workflowKey, int version)
    {
        WorkflowDefinitionEntity? entity;
        if (version == 0)
        {
            entity = repository.GetHighestVersion(workflowKey);
        }
        else
        {
            entity = repository.GetByKey(workflowKey, version);
        }

        if (entity is null)
        {
            throw new InvalidOperationException(
                $"Workflow definition '{workflowKey}' v{version} not found or inactive.");
        }

        var workflow = JsonSerializer.Deserialize<Core.Models.Workflow>(entity.DefinitionJson, SerializerOptions)
            ?? throw new InvalidOperationException(
                $"Workflow definition '{workflowKey}' v{entity.Version} JSON is invalid.");

        return workflow;
    }
}

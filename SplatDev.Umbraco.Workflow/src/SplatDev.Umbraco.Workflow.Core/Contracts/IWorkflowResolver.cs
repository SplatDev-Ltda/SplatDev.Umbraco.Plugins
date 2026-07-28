namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>Resolves a workflow definition by key + version.</summary>
public interface IWorkflowResolver
{
    /// <summary>Resolves a workflow definition.</summary>
    /// <param name="workflowKey">The workflow key.</param>
    /// <param name="version">The version to resolve (0 = latest).</param>
    /// <returns>The resolved workflow definition.</returns>
    IWorkflow Resolve(string workflowKey, int version);
}

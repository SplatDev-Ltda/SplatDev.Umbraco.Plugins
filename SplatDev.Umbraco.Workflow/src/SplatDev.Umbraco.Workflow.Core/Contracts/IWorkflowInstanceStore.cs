namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>Persistence boundary for IWorkflowInstance — implemented by Persistence layer.</summary>
public interface IWorkflowInstanceStore
{
    /// <summary>Retrieves a workflow instance by its ID.</summary>
    /// <param name="id">The instance ID.</param>
    /// <returns>The workflow instance.</returns>
    IWorkflowInstance Get(long id);

    /// <summary>Creates a new workflow instance and returns its ID.</summary>
    /// <param name="workflowKey">The workflow definition key.</param>
    /// <param name="workflowVersion">The workflow definition version.</param>
    /// <param name="startingStepKey">The initial step key.</param>
    /// <param name="metadataJson">Optional metadata in JSON format.</param>
    /// <param name="actorUsername">The username of the creating actor.</param>
    /// <returns>The new instance ID.</returns>
    long Create(string workflowKey, int workflowVersion, string startingStepKey, string? metadataJson, string actorUsername);

    /// <summary>Updates the current step of a workflow instance.</summary>
    /// <param name="id">The instance ID.</param>
    /// <param name="newStepKey">The new step key.</param>
    /// <param name="actorUsername">The username of the actor performing the update.</param>
    void UpdateCurrentStep(long id, string newStepKey, string actorUsername);
}

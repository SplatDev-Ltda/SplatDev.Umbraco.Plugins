using SplatDev.Umbraco.Workflow.Core.Enums;

namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>A runtime instance of a workflow.</summary>
public interface IWorkflowInstance
{
    /// <summary>Gets the unique instance ID.</summary>
    long Id { get; }

    /// <summary>Gets the workflow definition key.</summary>
    string WorkflowKey { get; }

    /// <summary>Gets the workflow definition version.</summary>
    int WorkflowVersion { get; }

    /// <summary>Gets the current step key of this instance.</summary>
    string CurrentStepKey { get; }

    /// <summary>Gets the lifecycle status of this instance.</summary>
    WorkflowStatus Status { get; }

    /// <summary>Gets the optional metadata in JSON format.</summary>
    string? MetadataJson { get; }

    /// <summary>Gets the timestamp when this instance was created.</summary>
    DateTime CreatedAt { get; }

    /// <summary>Gets the username of the actor who created this instance.</summary>
    string CreatedBy { get; }

    /// <summary>Gets the timestamp when this instance was last updated.</summary>
    DateTime UpdatedAt { get; }

    /// <summary>Gets the username of the actor who last updated this instance.</summary>
    string UpdatedBy { get; }
}

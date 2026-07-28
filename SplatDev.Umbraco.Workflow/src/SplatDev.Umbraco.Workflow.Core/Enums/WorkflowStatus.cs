namespace SplatDev.Umbraco.Workflow.Core.Enums;

/// <summary>Lifecycle status of a workflow instance.</summary>
public enum WorkflowStatus
{
    /// <summary>The instance is open and awaiting action.</summary>
    Open = 0,

    /// <summary>The instance has completed successfully.</summary>
    Completed = 1,

    /// <summary>The instance has been cancelled.</summary>
    Cancelled = 2,
}

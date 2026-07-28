namespace SplatDev.Umbraco.Workflow.Core.Enums;

/// <summary>Type of event recorded in the append-only workflow event log.</summary>
public enum WorkflowEventType
{
    /// <summary>An instance was created.</summary>
    Created = 0,

    /// <summary>An instance transitioned to a new step.</summary>
    Transition = 1,

    /// <summary>A comment was added to the instance.</summary>
    Comment = 2,

    /// <summary>An assignment was made on the instance.</summary>
    Assignment = 3,

    /// <summary>An action-message notification was dispatched.</summary>
    ActionMessage = 4,
}

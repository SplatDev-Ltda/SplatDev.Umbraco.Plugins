namespace SplatDev.Umbraco.Workflow.Core.Enums;

/// <summary>Audience for an action-message notification intent.</summary>
public enum ActionMessageAudience
{
    /// <summary>Default audience (derived from context).</summary>
    Default = 0,

    /// <summary>The user who submitted the workflow instance.</summary>
    Submitter = 1,

    /// <summary>The group assigned to the current step.</summary>
    AssignedGroup = 2,

    /// <summary>A custom-specified audience.</summary>
    Custom = 3,
}

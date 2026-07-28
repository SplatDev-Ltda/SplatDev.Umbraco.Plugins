namespace SplatDev.Umbraco.Workflow.Core.Enums;

/// <summary>How the next assignment for a transitioned instance is computed.</summary>
public enum AssignmentStrategy
{
    /// <summary>Assign to the configured group for the target step.</summary>
    AssignToGroup = 0,

    /// <summary>Assign to the user who submitted the instance.</summary>
    AssignToSubmitter = 1,

    /// <summary>Assignment requires manual selection.</summary>
    Manual = 2,
}

namespace SplatDev.Umbraco.Workflow.Core.Models;

/// <summary>An active assignment on a workflow instance.</summary>
public sealed record Assignment(
    long InstanceId,
    string? AssignedTo,
    string? AssignedToGroup,
    string? Department,
    DateTime AssignedAt);

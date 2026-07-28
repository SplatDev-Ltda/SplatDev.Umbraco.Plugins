namespace SplatDev.Umbraco.Workflow.Core.Models;

/// <summary>A row returned to the queue UI; values keyed by DisplayColumn.Key.</summary>
public sealed record WorkflowDisplayRow(
    long InstanceId,
    IReadOnlyDictionary<string, object?> Values);

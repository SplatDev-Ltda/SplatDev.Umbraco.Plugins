using SplatDev.Umbraco.Workflow.Core.Enums;

namespace SplatDev.Umbraco.Workflow.Core.Models;

/// <summary>An event entry in the workflow's append-only history log.</summary>
public sealed record WorkflowEvent(
    long InstanceId,
    WorkflowEventType EventType,
    string? FromStepKey,
    string? ToStepKey,
    string? ActionKey,
    string? PayloadJson,
    string ActorUsername,
    DateTime OccurredAt);

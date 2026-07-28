namespace SplatDev.Umbraco.Workflow.Api.Contracts;

public sealed record WorkflowDefinitionDto(
    string Key, string Label, int Version, bool IsActive, string DefinitionJson, DateTime CreatedAt);

public sealed record WorkflowInstanceDto(
    long Id, string WorkflowKey, int WorkflowVersion, string CurrentStepKey,
    int Status, string? MetadataJson, DateTime CreatedAt, string CreatedBy,
    DateTime UpdatedAt, string UpdatedBy);

public sealed record CreateInstanceRequest(string WorkflowKey, string? MetadataJson);

public sealed record TransitionRequest(string ActionKey);

public sealed record SetTaskCompletionRequest(IReadOnlyList<TaskCompletionEntry> Entries);
public sealed record TaskCompletionEntry(long TaskId, bool IsCompleted);

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);

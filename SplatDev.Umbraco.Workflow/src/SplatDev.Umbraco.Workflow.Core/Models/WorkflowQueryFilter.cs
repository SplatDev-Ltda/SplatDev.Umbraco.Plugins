using SplatDev.Umbraco.Workflow.Core.Enums;

namespace SplatDev.Umbraco.Workflow.Core.Models;

/// <summary>Filter applied when querying workflow instances for a queue view.</summary>
public sealed record WorkflowQueryFilter(
    string? WorkflowKey,
    WorkflowStatus? Status,
    bool AssignedToMe,
    string? Group,
    string? Department,
    string? FreeText,
    int Page,
    int PageSize);

using System.Text.Json.Serialization;
using SplatDev.Umbraco.Workflow.Core.Contracts;

namespace SplatDev.Umbraco.Workflow.Core.Models;

internal sealed record Workflow(
    string Key,
    string Label,
    int Version,
    IReadOnlyList<IWorkflowStep> Steps) : IWorkflow;

internal sealed record WorkflowStep(
    string Key,
    string Label,
    IReadOnlyList<IWorkflowAction> Actions,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    string? Department,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    string? Group,
    IReadOnlyList<IActionMessage>? PreActionMessages,
    IReadOnlyList<IActionMessage>? PostActionMessages) : IWorkflowStep
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public IReadOnlyList<IActionMessage> PreActionMessages { get; } = PreActionMessages ?? [];

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public IReadOnlyList<IActionMessage> PostActionMessages { get; } = PostActionMessages ?? [];
}

internal sealed record WorkflowAction(
    string Key,
    string Label,
    string NextStepKey,
    Enums.AssignmentStrategy Assignment) : IWorkflowAction;

internal sealed record ActionMessage(
    string Alias,
    string Label,
    Enums.ActionMessageAudience Audience) : IActionMessage;

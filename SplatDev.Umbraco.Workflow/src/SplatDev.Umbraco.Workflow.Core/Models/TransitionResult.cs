namespace SplatDev.Umbraco.Workflow.Core.Models;

/// <summary>Result returned from IWorkflowEngine.TransitionAsync.</summary>
public sealed record TransitionResult(
    bool Success,
    string NewStepKey,
    string? Error);

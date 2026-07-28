using SplatDev.Umbraco.Workflow.Core.Enums;

namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>A user-facing action available from a step (button on the UI).</summary>
public interface IWorkflowAction
{
    /// <summary>Gets the unique action key.</summary>
    string Key { get; }

    /// <summary>Gets the human-readable action label.</summary>
    string Label { get; }

    /// <summary>Gets the key of the next step this action transitions to.</summary>
    string NextStepKey { get; }

    /// <summary>Gets the assignment strategy for the next step after this action.</summary>
    AssignmentStrategy Assignment { get; }
}

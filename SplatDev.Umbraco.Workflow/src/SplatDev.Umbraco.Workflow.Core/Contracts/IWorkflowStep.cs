using SplatDev.Umbraco.Workflow.Core.Contracts;

namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>A single step inside a workflow definition.</summary>
public interface IWorkflowStep
{
    /// <summary>Gets the unique step key.</summary>
    string Key { get; }

    /// <summary>Gets the human-readable step label.</summary>
    string Label { get; }

    /// <summary>Gets the available actions from this step.</summary>
    IReadOnlyList<IWorkflowAction> Actions { get; }

    /// <summary>Gets the department this step belongs to, if any.</summary>
    string? Department { get; }

    /// <summary>Gets the group responsible for this step, if any.</summary>
    string? Group { get; }

    /// <summary>Gets the notification messages to show before an action is taken.</summary>
    IReadOnlyList<IActionMessage> PreActionMessages { get; }

    /// <summary>Gets the notification messages to show after an action is taken.</summary>
    IReadOnlyList<IActionMessage> PostActionMessages { get; }
}

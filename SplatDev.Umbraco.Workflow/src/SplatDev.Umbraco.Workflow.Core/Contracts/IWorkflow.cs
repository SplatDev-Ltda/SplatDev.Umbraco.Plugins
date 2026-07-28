namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>An ordered sequence of steps that an instance progresses through.</summary>
public interface IWorkflow
{
    /// <summary>Gets the unique workflow key.</summary>
    string Key { get; }

    /// <summary>Gets the human-readable workflow label.</summary>
    string Label { get; }

    /// <summary>Gets the workflow definition version.</summary>
    int Version { get; }

    /// <summary>Gets the ordered list of steps in this workflow.</summary>
    IReadOnlyList<IWorkflowStep> Steps { get; }
}

using SplatDev.Umbraco.Workflow.Core.Models;

namespace SplatDev.Umbraco.Workflow.Core.Contracts;

/// <summary>Host extension point that maps workflow instances to display data.</summary>
public interface IWorkflowDataProvider
{
    /// <summary>Gets display rows for a workflow queue filtered by the given query.</summary>
    /// <param name="filter">The query filter.</param>
    /// <param name="totalCount">The total number of matching rows (for pagination).</param>
    /// <returns>The display rows for the current page.</returns>
    IReadOnlyList<WorkflowDisplayRow> GetDisplayRows(WorkflowQueryFilter filter, out int totalCount);

    /// <summary>Gets a searchable field value from an instance's metadata.</summary>
    /// <param name="instanceId">The instance ID.</param>
    /// <param name="fieldKey">The metadata field key.</param>
    /// <returns>The field value, or null if not found.</returns>
    string? GetSearchableValue(long instanceId, string fieldKey);

    /// <summary>Gets the display columns for a given workflow key.</summary>
    /// <param name="workflowKey">The workflow key.</param>
    /// <returns>The display columns.</returns>
    IReadOnlyList<DisplayColumn> GetColumns(string workflowKey);
}

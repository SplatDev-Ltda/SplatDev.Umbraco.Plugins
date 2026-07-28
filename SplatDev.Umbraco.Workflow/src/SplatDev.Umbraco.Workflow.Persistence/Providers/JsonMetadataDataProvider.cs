using System.Text.Json;
using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Models;
using SplatDev.Umbraco.Workflow.Persistence.Entities;
using Umbraco.Cms.Infrastructure.Scoping;

namespace SplatDev.Umbraco.Workflow.Persistence.Providers;

public sealed class JsonMetadataDataProvider(
    IScopeProvider scopeProvider,
    JsonMetadataProviderOptions options) : IWorkflowDataProvider
{
    public IReadOnlyList<WorkflowDisplayRow> GetDisplayRows(WorkflowQueryFilter filter, out int totalCount)
    {
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        var sql = "SELECT * FROM splatWorkflowInstance WHERE 1=1";
        var args = new List<object>();

        if (filter.WorkflowKey is not null)
        {
            sql += " AND workflowKey = @" + args.Count;
            args.Add(filter.WorkflowKey);
        }

        if (filter.Status is not null)
        {
            sql += " AND status = @" + args.Count;
            args.Add((byte)filter.Status.Value);
        }

        var countArgs = args.ToArray();
        totalCount = scope.Database.ExecuteScalar<int>($"SELECT COUNT(*) {sql.Substring(sql.IndexOf("FROM", StringComparison.Ordinal))}", countArgs);

        var offset = (filter.Page - 1) * filter.PageSize;
        var pageRows = scope.Database.SkipTake<WorkflowInstanceEntity>(
            offset,
            filter.PageSize,
            sql + " ORDER BY updatedAt DESC");

        if (!options.ColumnsByWorkflow.TryGetValue(filter.WorkflowKey ?? string.Empty, out var columns))
        {
            columns = new[] { new DisplayColumn("id", "ID", "number", true) };
        }

        return pageRows.Select(r => BuildRow(r, columns)).ToList();
    }

    public string? GetSearchableValue(long instanceId, string fieldKey)
    {
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        var json = scope.Database.ExecuteScalar<string?>("SELECT metadataJson FROM splatWorkflowInstance WHERE id = @0", instanceId);
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.TryGetProperty(fieldKey, out var v) ? v.ToString() : null;
    }

    public IReadOnlyList<DisplayColumn> GetColumns(string workflowKey) =>
        options.ColumnsByWorkflow.TryGetValue(workflowKey, out var cols)
            ? cols
            : (IReadOnlyList<DisplayColumn>)[];

    private static WorkflowDisplayRow BuildRow(WorkflowInstanceEntity e, IReadOnlyList<DisplayColumn> cols)
    {
        var values = new Dictionary<string, object?>(cols.Count);
        if (e.MetadataJson is not null)
        {
            using var doc = JsonDocument.Parse(e.MetadataJson);
            foreach (var col in cols)
            {
                values[col.Key] = doc.RootElement.TryGetProperty(col.Key, out var v) ? v.ToString() : null;
            }
        }

        return new WorkflowDisplayRow(e.Id, values);
    }
}

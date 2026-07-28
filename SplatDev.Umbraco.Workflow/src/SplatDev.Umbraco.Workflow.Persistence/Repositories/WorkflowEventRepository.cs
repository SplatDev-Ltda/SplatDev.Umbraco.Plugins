using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Models;
using SplatDev.Umbraco.Workflow.Persistence.Entities;
using Umbraco.Cms.Infrastructure.Scoping;

namespace SplatDev.Umbraco.Workflow.Persistence.Repositories;

public sealed class WorkflowEventRepository(IScopeProvider scopeProvider) : IWorkflowEventStore
{
    public async Task AppendAsync(WorkflowEvent evt, CancellationToken ct)
    {
        using var scope = scopeProvider.CreateScope();
        scope.Database.Insert(new WorkflowEventEntity
        {
            InstanceId = evt.InstanceId,
            EventType = (byte)evt.EventType,
            FromStepKey = evt.FromStepKey,
            ToStepKey = evt.ToStepKey,
            ActionKey = evt.ActionKey,
            PayloadJson = evt.PayloadJson,
            ActorUsername = evt.ActorUsername,
            OccurredAt = evt.OccurredAt,
        });
        scope.Complete();
        await Task.CompletedTask.ConfigureAwait(false);
    }

    public IReadOnlyList<WorkflowEvent> GetHistory(long instanceId)
    {
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        var rows = scope.Database.Fetch<WorkflowEventEntity>(
            "WHERE instanceId = @0 ORDER BY occurredAt ASC", instanceId);
        return rows.Select(r => new WorkflowEvent(
            r.InstanceId,
            (Core.Enums.WorkflowEventType)r.EventType,
            r.FromStepKey,
            r.ToStepKey,
            r.ActionKey,
            r.PayloadJson,
            r.ActorUsername,
            r.OccurredAt)).ToList();
    }
}

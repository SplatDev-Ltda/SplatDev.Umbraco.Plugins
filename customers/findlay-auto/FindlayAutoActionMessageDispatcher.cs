using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Models;

namespace SplatDev.Umbraco.Workflow.Customers.FindlayAuto;

public sealed class FindlayAutoActionMessageDispatcher : IActionMessageDispatcher
{
    private readonly IFindlayNotificationService _notificationService;

    public FindlayAutoActionMessageDispatcher(IFindlayNotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task DispatchAsync(WorkflowEvent evt, CancellationToken ct)
    {
        if (evt.EventType != WorkflowEventType.ActionMessage)
            return;

        var notification = new FindlayNotification
        {
            InstanceId = evt.InstanceId,
            ActionKey = evt.ActionKey,
            FromStepKey = evt.FromStepKey,
            ToStepKey = evt.ToStepKey,
            PayloadJson = evt.PayloadJson,
            OccurredAt = evt.OccurredAt,
        };

        await _notificationService.SendAsync(notification, ct);
    }
}

public sealed record FindlayNotification
{
    public long InstanceId { get; init; }
    public string? ActionKey { get; init; }
    public string? FromStepKey { get; init; }
    public string? ToStepKey { get; init; }
    public string? PayloadJson { get; init; }
    public DateTime OccurredAt { get; init; }
}

public interface IFindlayNotificationService
{
    Task SendAsync(FindlayNotification notification, CancellationToken ct);
}

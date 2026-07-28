using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Workflow.Core.Contracts;
using SplatDev.Umbraco.Workflow.Core.Engine;
using SplatDev.Umbraco.Workflow.Core.Models;
using SplatDev.Umbraco.Workflow.Persistence.Migrations;
using SplatDev.Umbraco.Workflow.Persistence.Providers;
using SplatDev.Umbraco.Workflow.Persistence.Repositories;
using SplatDev.Umbraco.Workflow.Persistence.Resolvers;
using SplatDev.Umbraco.Workflow.Persistence.Routing;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Runtime;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;

namespace SplatDev.Umbraco.Workflow.Api.Composition;

public sealed class SplatDevWorkflowComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IWorkflowInstanceStore, WorkflowInstanceRepository>();
        builder.Services.AddScoped<IWorkflowEventStore, WorkflowEventRepository>();
        builder.Services.AddScoped<IAssignmentRouter, DefaultAssignmentRouter>();
        builder.Services.AddScoped<IWorkflowEngine, WorkflowEngine>();
        builder.Services.AddScoped<WorkflowDefinitionRepository>();
        builder.Services.AddScoped<WorkflowAssignmentRepository>();
        builder.Services.AddScoped<WorkflowTaskRepository>();
        builder.Services.AddScoped<IWorkflowResolver, WorkflowDefinitionResolver>();

        builder.Services.AddScoped<IActionMessageDispatcher, NullActionMessageDispatcher>();

        builder.AddNotificationHandler<UmbracoApplicationStartingNotification, RunWorkflowMigrationHandler>();
    }
}

internal sealed class NullActionMessageDispatcher : IActionMessageDispatcher
{
    public Task DispatchAsync(WorkflowEvent evt, CancellationToken ct) => Task.CompletedTask;
}

internal sealed class RunWorkflowMigrationHandler(
    IMigrationPlanExecutor executor,
    ICoreScopeProvider scopeProvider,
    IKeyValueService keyValueService) : INotificationHandler<UmbracoApplicationStartingNotification>
{
    public void Handle(UmbracoApplicationStartingNotification notification)
    {
        if (notification.RuntimeLevel < global::Umbraco.Cms.Core.RuntimeLevel.Run) return;
        var plan = new SplatWorkflowMigrationPlan();
        var upgrader = new Upgrader(plan);
        upgrader.Execute(executor, scopeProvider, keyValueService);
    }
}

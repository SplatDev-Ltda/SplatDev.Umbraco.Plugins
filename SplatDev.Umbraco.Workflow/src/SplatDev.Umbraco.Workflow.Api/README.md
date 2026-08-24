# SplatDev.Umbraco.Workflow.Api

Umbraco-authorised API controllers, DTOs, validators, and composer for the SplatDev Workflow subsystem.

## Dependencies

- **Core** → `SplatDev.Umbraco.Workflow.Core`
- **Persistence** → `SplatDev.Umbraco.Workflow.Persistence`
- **Umbraco** → `Umbraco.Cms.Web.BackOffice` (13.x) — for `UmbracoAuthorizedApiController`
- **FluentValidation** → `FluentValidation.AspNetCore`

## Endpoints

All under `/umbraco/backoffice/SplatDevWorkflow/Workflow*`:

| Controller | Endpoints | Purpose |
|-----------|-----------|---------|
| `WorkflowDefinitionsController` | GET, GET/{key}, POST, PUT/{key}/activate | List, get, create, activate workflow definitions |
| `WorkflowInstancesController` | GET, GET/{id}, POST, POST/{id}/transition | List (paged), detail, create, transition instances |
| `WorkflowTasksController` | GET /{id}/tasks, POST /{id}/tasks | Read and bulk-set the task sub-checklist |
| `WorkflowThemesController` | GET, GET/{name} | List and get theme tokens + templates |

## Registration

`SplatDevWorkflowComposer` (IComposer) auto-registers all services on Umbraco startup, so
nothing else is required to get the endpoints.

There is no `AddSplatDevWorkflow()`. The one extension this assembly exposes configures the
JSON metadata data provider, and is only needed if you want one:

```csharp
umbracoBuilder.Services.AddSplatDevWorkflowJsonProvider(options =>
{
    options.Searchable("name", "email", "department");
});
```

See the [integration guide](../../docs/integration-guide.md) for full setup instructions.

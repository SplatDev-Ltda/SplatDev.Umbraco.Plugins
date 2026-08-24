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
| `WorkflowTasksController` | POST /{id}/tasks | Bulk-set task completion |
| `WorkflowThemesController` | GET, GET/{name} | List and get theme tokens + templates |

## Registration

`SplatDevWorkflowComposer` (IComposer) auto-registers all services on Umbraco startup. Manually wire via:

```csharp
services.AddSplatDevWorkflow();
```

See the [integration guide](../../docs/integration-guide.md) for full setup instructions.

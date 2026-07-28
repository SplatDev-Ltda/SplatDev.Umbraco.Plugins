# SplatDev.Umbraco.Workflow

A drop-in content workflow engine for Umbraco 13 that provides approval chains, versioned workflow definitions, and a pizza-chart dashboard.

## Architecture

| Layer | Project | Purpose |
|-------|---------|---------|
| Core | `SplatDev.Umbraco.Workflow.Core` | Domain interfaces, enums, models, and the `WorkflowEngine` |
| Persistence | `SplatDev.Umbraco.Workflow.Persistence` | NPoco entities, FluentMigrator schema, repositories, JSON metadata provider |
| API | `SplatDev.Umbraco.Workflow.Api` | Umbraco API controllers, DI composer, FluentValidation validators |
| Backoffice | `SplatDev.Umbraco.Workflow.Backoffice` | AngularJS dashboards, pizza-chart + queue-table directives, i18n (en + es) |
| Themes | `SplatDev.Umbraco.Workflow.Themes` | CSS theme packs (Classic, Modern, Compact) |

## Quick Start

1. Reference the plugin in your Umbraco 13 host project.
2. Build and run. The migration `M001_CreateSchema` creates all required tables on startup.
3. Navigate to the Workflow section in the Umbraco backoffice.

## REST API

All endpoints under `/umbraco/backoffice/SplatDevWorkflow/`:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/WorkflowInstances/List` | List instances (paged, filterable) |
| GET | `/WorkflowInstances/{id}` | Get instance detail |
| POST | `/WorkflowInstances/Create` | Create a new instance |
| POST | `/WorkflowInstances/{id}/Transition` | Transition to next step |
| GET/POST | `/WorkflowDefinitions/*` | CRUD for definitions |
| GET/POST | `/WorkflowTasks/{id}/tasks` | List/set task completions |
| GET | `/WorkflowThemes/List` | List available themes |

## Database Tables

| Table | Purpose |
|-------|---------|
| `splatWorkflowDefinition` | JSON workflow definitions (versioned) |
| `splatWorkflowInstance` | Active workflow instances |
| `splatWorkflowEvent` | Append-only audit trail |
| `splatWorkflowAssignment` | Per-instance assignment records |
| `splatWorkflowTask` | Checklist tasks within an instance |

## Configuration

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddSplatDevWorkflowJsonProvider()  // fluent configuration
    .Build();
```

## Internationalization

English and Spanish included. Language files: `splatWorkflow.en.xml`, `splatWorkflow.es.xml`.

## Testing

```bash
# Unit tests
dotnet test tests/SplatDev.Umbraco.Workflow.Core.Tests/

# Persistence tests (requires LocalDB)
dotnet test tests/SplatDev.Umbraco.Workflow.Persistence.Tests/

# E2E tests (requires running Umbraco host on localhost:5000)
dotnet test tests/SplatDev.Umbraco.Workflow.E2E.Tests/
```

## Extension Points

- `IWorkflowDataProvider` — plug in custom data sources for the queue dashboard
- `IActionMessageDispatcher` — wire email/Slack/Webhook notifications
- `IAssignmentRouter` — custom assignment logic
- `JsonMetadataDataProvider` — default implementation using JSON metadata columns

## License

Proprietary. Copyright SplatDev.

# SplatDev.Umbraco.Workflow.Persistence

NPoco entities, FluentMigrator schema migrations, and repository implementations of the Core persistence contracts.

## Dependencies

- **Core** → `SplatDev.Umbraco.Workflow.Core`
- **Umbraco** → `Umbraco.Cms.Infrastructure` (13.x) — for `IScopeProvider`, NPoco, FluentMigrator

## Schema

| Table | Purpose |
|-------|---------|
| `splatWorkflowDefinition` | Published workflow definitions (key, label, version, JSON) |
| `splatWorkflowInstance` | In-flight workflow instances |
| `splatWorkflowEvent` | Append-only audit trail (history) |
| `splatWorkflowAssignment` | Current + historical assignments per instance |
| `splatWorkflowTask` | Sub-checklist items per instance |

## Key repositories

| Repository | Implements |
|-----------|------------|
| `WorkflowDefinitionRepository` | Workflow definition CRUD + versioning |
| `WorkflowInstanceRepository` | `IWorkflowInstanceStore` (Get, Create, UpdateCurrentStep) |
| `WorkflowEventRepository` | `IWorkflowEventStore` (AppendAsync, GetHistory) |
| `WorkflowAssignmentRepository` | Assignment lifecycle (Create, Deactivate, GetActiveByInstance) |
| `WorkflowTaskRepository` | Task sub-checklist (CreateBatch, GetByInstance, SetCompletion) |

## Migration

Runs via `SplatWorkflowMigrationPlan` (inherits `Umbraco.Cms.Infrastructure.Migrations.MigrationPlan`). Wire into Umbraco's `IMigrationPlanExecutor` or register through the plugin composer.

All queries use NPoco parameterized SQL (`@0`, `@1`, ...) — no string concatenation, no SQL injection surface.

## Integration

See the [integration guide](../../docs/integration-guide.md) for setup instructions.

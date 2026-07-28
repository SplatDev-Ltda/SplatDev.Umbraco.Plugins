# SplatDev.Umbraco.Workflow.Core

The engine, contracts, and domain types for the SplatDev Workflow subsystem. No Umbraco, HTTP, or database dependencies — pure C# primitives.

## Integration

See the [integration guide](../../docs/integration-guide.md) for host setup.

## Contracts

| Interface | Purpose |
|-----------|---------|
| `IWorkflow` | An ordered sequence of steps that an instance progresses through |
| `IWorkflowStep` | A single step inside a workflow definition |
| `IWorkflowAction` | A user-facing action available from a step |
| `IWorkflowInstance` | A runtime instance of a workflow |
| `IWorkflowEngine` | The state machine that drives workflow instances forward |
| `IWorkflowDataProvider` | Host extension point for mapping instances to display data |
| `IAssignmentRouter` | Determines who is assigned after a transition |
| `IActionMessageDispatcher` | Host-implemented transport for action messages |
| `IWorkflowEventStore` | Append-only event log for a workflow instance |
| `IWorkflowInstanceStore` | Persistence boundary for workflow instances |
| `IWorkflowResolver` | Resolves a workflow definition by key + version |

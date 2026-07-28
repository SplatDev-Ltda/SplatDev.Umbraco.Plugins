# SplatDev Workflow — Integration Guide

## Overview

This guide covers how to integrate the SplatDev Workflow plugin into an Umbraco 13 host application.

## Prerequisites

- Umbraco 13+ (net8.0)
- SQL Server (LocalDB, Express, or Standard/Enterprise)
- Node.js 18+ (for AngularJS backoffice development)

## Installation

### 1. Add Project Reference

Add references to the host `.csproj`:

```xml
<ItemGroup>
  <ProjectReference Include="..\SplatDev.Umbraco.Workflow\src\SplatDev.Umbraco.Workflow.Api\SplatDev.Umbraco.Workflow.Api.csproj" />
  <ProjectReference Include="..\SplatDev.Umbraco.Workflow\src\SplatDev.Umbraco.Workflow.Backoffice\SplatDev.Umbraco.Workflow.Backoffice.csproj" />
  <ProjectReference Include="..\SplatDev.Umbraco.Workflow\src\SplatDev.Umbraco.Workflow.Themes\SplatDev.Umbraco.Workflow.Themes.csproj" />
</ItemGroup>
```

### 2. Configure DI

In `Startup.cs` or `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .AddSplatDevWorkflowJsonProvider(options =>
    {
        // Optional: override default searchable fields
        options.SearchableFields = ["name", "email", "department"];
    })
    .Build();
```

### 3. Database

The migration runs automatically on application startup. Tables are prefixed `splatWorkflow*`.

To seed an initial workflow definition:

```sql
INSERT INTO splatWorkflowDefinition ([key], label, version, definitionJson, isActive, createdAt, createdBy)
VALUES (
  'onboarding',
  'Employee Onboarding',
  1,
  '{"key":"onboarding","label":"Employee Onboarding","version":1,"steps":[...]}',
  1,
  GETUTCDATE(),
  'admin'
);
```

See `samples/SplatDev.Umbraco.Workflow.Sample/App_Data/SplatDevWorkflow/Seeds/onboarding.json` for a complete example.

## API Endpoints

Base URL: `https://yoursite.com/umbraco/backoffice/SplatDevWorkflow/`

### Workflow Instances

#### List instances (paged)

```
GET /WorkflowInstances/List?page=1&pageSize=20&status=open&workflowKey=onboarding
```

#### Get instance detail

```
GET /WorkflowInstances/42
```

#### Create instance

```
POST /WorkflowInstances/Create
Content-Type: application/json

{ "workflowKey": "onboarding", "metadataJson": "{\"name\":\"John\"}" }
```

#### Transition

```
POST /WorkflowInstances/42/Transition
Content-Type: application/json

{ "actionKey": "send-to-manager" }
```

### Workflow Definitions

#### List all definitions

```
GET /WorkflowDefinitions/List
```

#### Get single definition

```
GET /WorkflowDefinitions/onboarding/1
```

#### Save definition

```
POST /WorkflowDefinitions/Save
Content-Type: application/json

{
  "key": "onboarding",
  "label": "Employee Onboarding",
  "version": 2,
  "definitionJson": "{...}",
  "createdBy": "admin"
}
```

### Workflow Tasks

#### List tasks for instance

```
GET /WorkflowTasks/42/tasks
```

#### Set task completion

```
POST /WorkflowTasks/42/tasks
Content-Type: application/json

{ "entries": [{ "taskId": 1, "isCompleted": true }] }
```

### Themes

#### List available themes

```
GET /WorkflowThemes/List
```

#### Get theme detail

```
GET /WorkflowThemes/classic
```

## Customizing the Queue Dashboard

Implement `IWorkflowDataProvider` to change how instances are displayed:

```csharp
public class CustomDataProvider : IWorkflowDataProvider
{
    public IReadOnlyList<WorkflowDisplayRow> GetDisplayRows(WorkflowQueryFilter filter, out int totalCount)
    {
        // ... custom implementation
    }

    public string? GetSearchableValue(long instanceId, string fieldKey)
    {
        // ... custom implementation
    }

    public IReadOnlyList<DisplayColumn> GetColumns(string workflowKey)
    {
        // ... custom implementation
    }
}
```

Register in your composer:

```csharp
builder.Services.AddScoped<IWorkflowDataProvider, CustomDataProvider>();
```

## Customizing Notifications

Implement `IActionMessageDispatcher` to send emails, Slack messages, or webhooks on transitions:

```csharp
public class EmailDispatcher : IActionMessageDispatcher
{
    public async Task DispatchAsync(WorkflowEvent evt, CancellationToken ct)
    {
        // Send notification based on evt
    }
}
```

## Theme Development

Each theme is a folder under `App_Plugins/SplatDev.Workflow/Themes/{name}/` containing:

- `manifest.json` — theme metadata (name, layouts per component)
- `theme.css` — CSS variables and layout styles

Add a new theme by copying an existing folder and updating the manifest.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Migration fails | Check that `ICoreScopeProvider` is registered and SQL Server is accessible |
| Dashboard shows no data | Verify `IWorkflowDataProvider` is registered; ensure at least one workflow definition exists |
| Queue table directive not rendering | Confirm `queueTable.directive.js` is loaded via `package.manifest` |
| 404 on API endpoints | Confirm `[PluginController("SplatDevWorkflow")]` attribute on controllers |

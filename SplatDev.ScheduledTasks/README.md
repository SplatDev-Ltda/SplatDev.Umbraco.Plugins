# SplatDev.ScheduledTasks

Task scheduler with EF Core persistence and reflection-based invocation — schedule repeatable tasks with configurable intervals, 9 built-in task categories, and event-driven execution in any .NET application.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.ScheduledTasks.svg)](https://www.nuget.org/packages/SplatDev.ScheduledTasks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.ScheduledTasks
```

## Configuration

### Register with DI

```csharp
using SplatDev.ScheduledTasks;

// Program.cs
builder.Services.AddDbContext<ScheduledTasksDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddSingleton<TaskScheduler>();
builder.Services.AddScoped<ITaskAction, MyCustomTask>();
```

### Define a custom task

```csharp
using SplatDev.ScheduledTasks;

public class EmailReminderTask : ITaskAction
{
    private readonly IEmailService _email;

    public EmailReminderTask(IEmailService email)
    {
        _email = email;
    }

    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        await _email.SendRemindersAsync();
    }
}
```

### Schedule and run tasks

```csharp
using SplatDev.ScheduledTasks;

var scheduler = serviceProvider.GetRequiredService<TaskScheduler>();

// Register a new scheduled task
var task = new ScheduledTask
{
    Name = "Daily Email Reminder",
    TaskType = ScheduledTaskType.Email,
    Interval = TimeSpan.FromHours(24),
    AssemblyName = typeof(EmailReminderTask).Assembly.FullName!,
    TypeName = typeof(EmailReminderTask).FullName!
};

scheduler.AddTask(task);

// Hook into schedule lifecycle events
scheduler.OnScheduleElapsed += (sender, args) =>
{
    Console.WriteLine($"Task '{args.Task.Name}' completed at {args.ElapsedAt}");
};

scheduler.OnTriggerEvent += (sender, args) =>
{
    Console.WriteLine($"Task '{args.Task.Name}' triggered with criteria: {args.Criteria}");
};

// Start the scheduler
await scheduler.StartAsync();
```

## Usage

### Task types

The `ScheduledTaskType` enum defines 9 categories:

```csharp
public enum ScheduledTaskType
{
    Action,    // General-purpose action execution
    Check,     // Health/status checks
    Email,     // Email dispatch and notifications
    Notify,    // Push/webhook notifications
    Process,   // Data processing and batch operations
    Report,    // Report generation
    Send,      // Outbound message delivery
    Validate,  // Data validation routines
    Verify     // Integrity verification
}
```

### Filtering scheduled tasks

```csharp
// Retrieve tasks by type
var emailTasks = await scheduler.GetTasksAsync(ScheduledTaskType.Email);

// Filter by custom criteria
var dueTasks = await scheduler.GetTasksAsync(criteria: t => t.NextRun <= DateTime.UtcNow);

// Cancel a specific task
await scheduler.CancelTaskAsync(taskId);
```

## Features

- **EF Core persistence** — task definitions and execution history stored in SQL Server via `ScheduledTasksDbContext`
- **Reflection-based invocation** — tasks are resolved and instantiated at runtime by `AssemblyName` and `TypeName`
- **Repeatable tasks** with configurable intervals (`TimeSpan`)
- **9 built-in task categories** via `ScheduledTaskType` enum (Action, Check, Email, Notify, Process, Report, Send, Validate, Verify)
- **Criteria filtering** for fine-grained task selection and triggering
- **Event-driven execution**: `OnScheduleElapsed` fires when a task interval completes; `OnTriggerEvent` fires on manual triggers
- **ScheduledEventArgs** provides execution context (task metadata, elapsed time, trigger criteria)
- `ITaskAction` interface for implementing custom task logic with async support
- Logging integration via `SplatDev.Logger` project reference

## Key Classes

| Class | Purpose |
|-------|---------|
| `TaskScheduler` | Core scheduler managing task registration, execution, and lifecycle |
| `ITaskAction` | Interface for implementing custom task execution logic |
| `ScheduledTask` | EF Core entity representing a scheduled task definition |
| `ScheduledTaskType` | Enum of 9 task categories |
| `ScheduledEventArgs` | Event arguments for schedule lifecycle events |
| `ScheduledTasksDbContext` | EF Core database context for task persistence |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `Microsoft.EntityFrameworkCore` | 8.0.13 | ORM for task persistence |
| `Microsoft.EntityFrameworkCore.SqlServer` | 8.0.13 | SQL Server database provider |
| `SplatDev.Logger` | — | Logging integration (project reference) |

---

**SplatDev.ScheduledTasks** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

# SplatDev.ScheduledTasks

<!-- screenshot:start -->
<!-- screenshot:end -->

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

`SplatDev.ScheduledTasks.Services.TaskScheduler` collides with `System.Threading.Tasks.TaskScheduler`,
which implicit usings put in scope in any modern project — so a bare `new TaskScheduler(db)`
fails with `CS0104: 'TaskScheduler' is an ambiguous reference`. Alias it:

```csharp
using TaskScheduler = SplatDev.ScheduledTasks.Services.TaskScheduler;
```

`TaskScheduler` takes a `DbContext` and **starts scheduling in its constructor**. There is no
`StartAsync`, and there is no `ScheduledTasksDbContext` in this package — put a
`DbSet<ScheduledTask>` on your own context:

```csharp
public class MyDbContext : DbContext
{
    public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }
    public DbSet<ScheduledTask> ScheduledTasks => Set<ScheduledTask>();
}
```

```csharp
// Program.cs
builder.Services.AddDbContext<MyDbContext>(o => o.UseSqlServer(connectionString));

// Constructed once, per DbContext. It reads the task table and schedules timers as it is
// built, so build it when the application is ready to start running tasks — not during
// service registration.
var scheduler = new TaskScheduler(db);
```

The constructor returns without scheduling anything if the database cannot be reached
(`context.Database.CanConnect()`), so a missing connection is silent rather than fatal.

### Define a task

Tasks are invoked by reflection. `ScheduledTask.ClassToInvoke` holds an assembly-qualified
type name, the type is resolved with `Type.GetType`, instantiated through its **parameterless
constructor**, and its `Perform` method is called. Constructor injection does not work — a
task class with dependencies will throw when the scheduler tries to build it.

`ITaskAction` is synchronous and takes the event args:

```csharp
using SplatDev.ScheduledTasks.Events;
using SplatDev.ScheduledTasks.Interfaces;

public class EmailReminderTask : ITaskAction
{
    public EmailReminderTask() { }          // must be parameterless

    public void Perform(ScheduledEventArgs args)
    {
        // args.Payload.Task is the ScheduledTask row that triggered this
        Console.WriteLine($"Running {args.Payload.Task.Name}");
    }
}
```

### Schedule a task

Rows in the task table are the schedule. Add one and construct the scheduler:

```csharp
db.ScheduledTasks.Add(new ScheduledTask
{
    Name = "Daily Email Reminder",
    Description = "Sends the overnight reminder batch",
    TaskType = ScheduledTaskType.Email,
    Active = true,
    Repeat = true,
    RepeatEveryXHours = 24,          // hours and minutes, not a TimeSpan
    RepeatEveryXMinutes = 0,
    StartOn = DateTime.UtcNow,
    ClassToInvoke = typeof(EmailReminderTask).AssemblyQualifiedName!,
    StopOnError = false,
});
await db.SaveChangesAsync();

var scheduler = new TaskScheduler(db);
```

A task with `Repeat = false` runs once and is skipped afterwards, because `LastRunOnUtc` has
been set.

Tasks that should not be persisted can be passed to the constructor instead:

```csharp
var scheduler = new TaskScheduler(db, runtime: new[] { oneOffTask });
```

### Events

Both delegates take a **single** argument — there is no `sender`:

```csharp
scheduler.OnTriggerEvent += args =>
    Console.WriteLine($"{args.Message} ({args.MessageType})");

scheduler.OnScheduleElapsed += args =>
    Console.WriteLine($"Running {args.Payload.Task.Name}");
```

`ScheduledEventArgs` carries `Message`, `MessageType`, `Payload` and `AutoReset`. The task
itself is `args.Payload.Task`.

### Shutting down

`TaskScheduler` owns a `Timer` per repeating task and implements `IDisposable`. Dispose it or
the timers keep firing:

```csharp
scheduler.Dispose();
```

`StopOnError = true` on a task disposes the whole scheduler when that task throws — every
other task stops too.

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

### Reading the schedule

`TaskScheduler` exposes the two collections it was built from and nothing else — there is no
`GetTasksAsync` and no `CancelTaskAsync`. Query your own `DbSet` for anything more:

```csharp
IEnumerable<ScheduledTask> persisted = scheduler.ScheduledTasks;
IEnumerable<ScheduledTask> runtime   = scheduler.RuntimeTasks;

var emailTasks = await db.ScheduledTasks
    .Where(t => t.TaskType == ScheduledTaskType.Email && t.Active)
    .ToListAsync();
```

Deactivating a task means setting `Active = false` and rebuilding the scheduler; a timer that
is already running is only stopped by `Dispose()`.

## Features

- **EF Core persistence** — task rows live in a `DbSet<ScheduledTask>` on your own context
- **Reflection-based invocation** — `ClassToInvoke` holds an assembly-qualified type name;
  the type needs a parameterless constructor and a `Perform` method
- **Repeatable tasks** with an interval given as whole hours plus minutes
- **9 task categories** via `ScheduledTaskType` (Action, Check, Email, Notify, Process,
  Report, Send, Validate, Verify)
- **Event-driven execution**: `OnTriggerEvent` when a task is scheduled, `OnScheduleElapsed`
  immediately before it runs — both taking a single `ScheduledEventArgs`
- `ITaskAction` for task logic. It is synchronous: `void Perform(ScheduledEventArgs)`
- `StopOnError` disposes the scheduler when a task throws
- Logging via the `SplatDev.Logger` project reference

## Key Classes

| Class | Purpose |
|-------|---------|
| `TaskScheduler` | Reads the task table and owns a `Timer` per repeating task. `IDisposable` |
| `ITaskAction` | `void Perform(ScheduledEventArgs)` — the contract the reflected type must satisfy |
| `ScheduledTask` | EF Core entity for a task definition |
| `ScheduledTaskType` | Enum of 9 task categories |
| `ScheduledEventArgs` | `Message`, `MessageType`, `Payload`, `AutoReset` |
| `ScheduledTaskPayload` | `Task`, `RelatedType`, `Message`, `DependentTaskId`, `Dependencies`, `Actions` |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `Microsoft.EntityFrameworkCore` | 8.0.13 | ORM for task persistence |
| `Microsoft.EntityFrameworkCore.SqlServer` | 8.0.13 | SQL Server database provider |
| `SplatDev.Logger` | — | Logging integration (project reference) |

---

**SplatDev.ScheduledTasks** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

## Changelog

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.


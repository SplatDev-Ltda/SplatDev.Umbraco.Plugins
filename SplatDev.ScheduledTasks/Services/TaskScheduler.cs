namespace SplatDev.ScheduledTasks.Services
{
    using SplatDev.Logger;
    using SplatDev.ScheduledTasks.Enums;
    using SplatDev.ScheduledTasks.Events;
    using SplatDev.ScheduledTasks.Models;

    using System;
    using System.Collections.Generic;
    using Microsoft.EntityFrameworkCore;
    using System.Linq;
    using System.Reflection;
    using System.Threading;


    public class TaskScheduler : IDisposable
    {
        private readonly DbContext context;
        public IEnumerable<ScheduledTask> ScheduledTasks { get; private set; }

        public IEnumerable<ScheduledTask> RuntimeTasks { get; set; }

        private readonly List<Timer> timers = new();

        public TaskScheduler(DbContext context, IEnumerable<ScheduledTask>? runtime = null)
        {
            this.context = context ?? throw new ArgumentNullException(nameof(context));
            if (!this.context.Database.CanConnect()) return;
            ScheduledTasks = this.context.Set<ScheduledTask>().ToList();
            RuntimeTasks = runtime ?? new List<ScheduledTask>();
            Schedule();
            ScheduleRuntime();
        }

        public void Dispose()
        {
            foreach (var timer in timers)
            {
                timer?.Dispose();
            }
            timers.Clear();
        }

        public delegate void ScheduleElapsed(ScheduledEventArgs args);
        public event ScheduleElapsed OnScheduleElapsed;

        public delegate void TriggerEvent(ScheduledEventArgs args);
        public event TriggerEvent OnTriggerEvent;

        private void Schedule()
        {
            if (ScheduledTasks != null)
            {
                Scheduler(ScheduledTasks);
            }
        }

        private void ScheduleRuntime()
        {
            if (RuntimeTasks != null)
            {
                Scheduler(RuntimeTasks, false);
            }
        }

        private void Scheduler(IEnumerable<ScheduledTask> tasks, bool log = true)
        {
            foreach (var task in tasks)
            {
                if (!task.Active) { continue; }

                if (task.Repeat)
                {
                    var due = new TimeSpan(task.RepeatEveryXHours, task.RepeatEveryXMinutes, 0);
                    var next = task.LastRunOnUtc.HasValue ? task.LastRunOnUtc.Value.Add(due) : DateTime.Now.Add(due);
                    task.NextRun = next;
                    var counter = task.LastRunOnUtc.HasValue ? (task.NextRun - task.LastRunOnUtc.Value) : next - DateTime.Now;
                    var autoEvent = new AutoResetEvent(task.Repeat);
                    var args = new ScheduledEventArgs
                    {
                        Message = $"Triggering \"{task.Name}\"",
                        MessageType = ScheduledMessageType.Info,
                        AutoReset = autoEvent,
                        Payload = new ScheduledTaskPayload
                        {
                            Message = task.Description,
                            RelatedType = (ScheduledTaskType)task.TaskType,
                            Task = task,
                            DependentTaskId = task.TaskId
                        }
                    };
                    var timer = new Timer(callback: CheckSchedule, args, 0, (int)due.TotalMilliseconds);
                    timers.Add(timer);
                    OnTriggerEvent?.Invoke(args);

                    task.LastRunOnUtc = DateTime.UtcNow;
                    context.SaveChanges();

                    if (log)
                    {
                        Logger.Log($"Task '{task.Name}' has been scheduled", $"'{task.Name}' has been scheduled to run every {task.RepeatEveryXHours} hours and {task.RepeatEveryXMinutes} minutes [Starting: {task}] \r\nNext run in {Math.Round(counter.Value.TotalMinutes)} minutes", LogType.Info);
                    }
                }

                else
                {
                    if (task.LastRunOnUtc.HasValue) { continue; }

                    var args = new ScheduledEventArgs
                    {
                        Message = $"Triggering \"{task.Name}\"",
                        MessageType = ScheduledMessageType.Info,
                        Payload = new ScheduledTaskPayload
                        {
                            Message = task.Description,
                            RelatedType = task.TaskType,
                            Task = task,
                            DependentTaskId = task.TaskId
                        }
                    };
                    if (RunTask(args))
                    {
                        Logger.Log($"Task '{args.Payload.Task.Name}' has been processed", $"'{args.Payload.Task.Name}' is a run once task", LogType.Info);
                    }
                }
            }
        }

        private void CheckSchedule(object args)
        {
            RunTask(args);
            var eventArgs = args as ScheduledEventArgs;
            Logger.Log($"Task '{eventArgs.Payload.Task.Name}' has been processed", $"'{eventArgs.Payload.Task.Name}' will run again in {eventArgs.Payload.Task.RepeatEveryXHours} hours and {eventArgs.Payload.Task.RepeatEveryXMinutes} minutes", LogType.Info);
        }

        private bool RunTask(object args)
        {
            var eventArgs = args as ScheduledEventArgs;

            if (string.IsNullOrEmpty(eventArgs.Payload.Task.ClassToInvoke))
            {
                Logger.Log($"Task '{eventArgs.Payload.Task.Name}' cannot be processed", $"'{eventArgs.Payload.Task.Name}' is missing the Class To Invoke Argument", LogType.Error);
                return false;
            }

            var task = context.Set<ScheduledTask>().SingleOrDefault(x => x.Id == eventArgs.Payload.Task.Id);
            try
            {
                OnScheduleElapsed?.Invoke(new ScheduledEventArgs
                {
                    Message = $"Running \"{eventArgs?.Payload?.Task?.Name}\"",
                    MessageType = ScheduledMessageType.Info,
                    Payload = eventArgs.Payload
                });

                Type classToInvoke = Type.GetType(typeName: eventArgs.Payload.Task.ClassToInvoke);
                ConstructorInfo ctor = classToInvoke.GetConstructor(Type.EmptyTypes);
                object instance = ctor.Invoke(Array.Empty<object>());

                MethodInfo methodToInvoke = classToInvoke.GetMethod("Perform");
                methodToInvoke.Invoke(instance, new object[] { eventArgs });

                task.LastRunOnUtc = DateTime.UtcNow;
                var due = new TimeSpan(task.RepeatEveryXHours, task.RepeatEveryXMinutes, 0);
                var next = task.LastRunOnUtc.HasValue ? task.LastRunOnUtc.Value.Add(due) : DateTime.Now.Add(due);
                task.NextRun = next;
                context.SaveChanges();

                eventArgs.AutoReset?.Set();
                return true;
            }
            catch (Exception ex)
            {
                Logger.Log($"Task '{eventArgs.Payload.Task.Name}' had an error", $"'{eventArgs.Payload.Task.Name}' - {ex.Message} - {ex.StackTrace} - {ex.InnerException?.Message} { ex.InnerException?.StackTrace}", LogType.Error);
                eventArgs.AutoReset?.Set();
                if (task.StopOnError)
                {
                    Dispose();
                }
                return false;
            }
        }
    }
}

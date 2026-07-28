namespace SplatDev.Logger
{
    using Microsoft.EntityFrameworkCore;
    using System;

    public class LoggerDbContext : DbContext
    {
        public LoggerDbContext(DbContextOptions<LoggerDbContext> options) : base(options) { }
        public DbSet<Log> Logs { get; set; } = null!;
    }

    public static class Logger
    {
        public static string ConnectionString { get; set; } = string.Empty;

        private static LoggerDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<LoggerDbContext>()
                .UseSqlServer(ConnectionString)
                .Options;
            return new LoggerDbContext(options);
        }

        public static void Log(string message, string details = "", LogType type = LogType.Info, string user = "System")
        {
            try
            {
                using var context = CreateContext();
                context.Logs.Add(new Log
                {
                    DateTime = DateTime.Now,
                    Details = details,
                    Message = message,
                    User = user,
                    LogType = type
                });
                context.SaveChanges();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[Logger] Failed to write log: {ex.Message}");
            }
        }

        public static void Log(string message, Exception exception, LogType type = LogType.Error, string user = "System")
        {
            try
            {
                using var context = CreateContext();
                context.Logs.Add(new Log
                {
                    DateTime = DateTime.Now,
                    Details = $"Message: {exception.Message}{Environment.NewLine}Stack Trace: {exception?.StackTrace}{Environment.NewLine}Inner Exception: {exception?.InnerException?.Message}",
                    Message = message,
                    User = user,
                    LogType = type
                });
                context.SaveChanges();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[Logger] Failed to write exception log: {ex.Message}");
            }
        }
    }
}

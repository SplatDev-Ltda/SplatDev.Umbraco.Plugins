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

        /// <summary>
        /// The ADO.NET provider the connection string belongs to.
        /// </summary>
        /// <remarks>
        /// This used to be hardcoded to SQL Server, so a caller running on SQLite — which
        /// Umbraco offers by default — got "Keyword not supported: 'cache'" out of a logger
        /// that then swallowed it, leaving no log and no sign of why. Set this to a value
        /// containing "Sqlite" to use SQLite instead. SQL Server remains the default, so
        /// existing callers are unaffected.
        /// </remarks>
        public static string ProviderName { get; set; } = "Microsoft.Data.SqlClient";

        private static LoggerDbContext CreateContext()
        {
            var builder = new DbContextOptionsBuilder<LoggerDbContext>();

            if (ProviderName?.IndexOf("Sqlite", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                builder.UseSqlite(ConnectionString);
            }
            else
            {
                builder.UseSqlServer(ConnectionString);
            }

            return new LoggerDbContext(builder.Options);
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

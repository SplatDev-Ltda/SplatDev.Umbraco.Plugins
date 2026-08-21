using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.JsonRpc.Models;

public class JsonRpcDbContext : DbContext
{
    public JsonRpcDbContext(DbContextOptions<JsonRpcDbContext> options)
        : base(options)
    {
    }

    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();
    public DbSet<ApiLog> ApiLogs => Set<ApiLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("jsonrpc");
        base.OnModelCreating(modelBuilder);
    }
}

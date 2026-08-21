using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Plugins.CopyValue.Models;
using Umbraco.Cms.Infrastructure.Migrations;

namespace SplatDev.Umbraco.Plugins.CopyValue.Migrations;

/// <summary>
/// Creates this plugin's tables inside Umbraco's database.
/// </summary>
/// <remarks>
/// The plugin registered a DbContext and never created its schema — no EF migration, no
/// EnsureCreated, nothing. Every request that touched those entities therefore failed against
/// tables that do not exist, on any database. EnsureCreated is not usable here because it checks
/// whether the *database* exists, and this context shares Umbraco's, which always does; it would
/// return false and create nothing.
///
/// The DDL comes from EF's own model so it matches the entities and the active provider, and it
/// runs inside an Umbraco migration so Umbraco records that it ran and will not repeat it.
/// </remarks>
public class CreateCopyValueTables : MigrationBase
{
    private readonly IServiceProvider _serviceProvider;

    public CreateCopyValueTables(IMigrationContext context, IServiceProvider serviceProvider)
        : base(context) => _serviceProvider = serviceProvider;

    protected override void Migrate()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<CopyValueDbContext>();

        // An existing site may already have these tables — created by hand, or by an
        // earlier release that shipped a SQL script. Creating them again would throw on
        // every boot, and Umbraco only records a migration once it succeeds, so the
        // failure would repeat forever rather than settle.
        var tables = dbContext.Model.GetEntityTypes()
            .Select(entity => entity.GetTableName())
            .Where(table => !string.IsNullOrWhiteSpace(table))
            .Select(table => table!)
            .Distinct()
            .ToList();

        if (tables.Count > 0 && tables.All(TableExists))
            return;

        var script = dbContext.Database.GenerateCreateScript();
        if (string.IsNullOrWhiteSpace(script))
            return;

        foreach (var statement in SplitStatements(script))
            Execute.Sql(statement).Do();
    }

    /// <summary>
    /// Splits a generated script on GO batch separators, which SQL Server's provider emits and
    /// which are not valid SQL to send to the server.
    /// </summary>
    private static IEnumerable<string> SplitStatements(string script)
    {
        var batches = script.Split(["\nGO\n", "\r\nGO\r\n", "\nGO\r\n", "\r\nGO\n"],
            StringSplitOptions.RemoveEmptyEntries);

        foreach (var batch in batches)
        {
            var trimmed = batch.Trim();
            if (trimmed.Length > 0 && !string.Equals(trimmed, "GO", StringComparison.OrdinalIgnoreCase))
                yield return trimmed;
        }
    }
}

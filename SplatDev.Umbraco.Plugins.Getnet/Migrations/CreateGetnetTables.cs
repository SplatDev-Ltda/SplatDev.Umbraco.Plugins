using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Plugins.Getnet.Models;
using Umbraco.Cms.Infrastructure.Migrations;

namespace SplatDev.Umbraco.Plugins.Getnet.Migrations;

/// <summary>
/// Creates this plugin's tables inside Umbraco's database.
/// </summary>
/// <remarks>
/// The DDL comes from EF's own model so it matches the entities and the active provider,
/// rather than from a hand-written script that drifts from them. Umbraco's own
/// Create.Table&lt;T&gt;() names a table after the entity while EF names it from [Table], and
/// when those disagree the migration succeeds, records itself as done, and leaves the plugin
/// querying something that does not exist.
///
/// EnsureCreated is not usable here: it asks whether the *database* exists, and this context
/// shares Umbraco's, which always does - so it would return false and create nothing.
/// </remarks>
public class CreateGetnetTables : MigrationBase
{
    private readonly IServiceProvider _serviceProvider;

    public CreateGetnetTables(IMigrationContext context, IServiceProvider serviceProvider)
        : base(context) => _serviceProvider = serviceProvider;

    protected override void Migrate()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<GetnetDbContext>();

        // An existing site may already have these tables. Creating them again would throw on
        // every boot, and Umbraco only records a migration once it succeeds, so the failure
        // would repeat forever rather than settle.
        var tables = dbContext.Model.GetEntityTypes()
            .Select(entity => entity.GetTableName())
            .Where(table => !string.IsNullOrWhiteSpace(table))
            .Select(table => table!)
            .Distinct()
            .ToList();

        if (tables.Count > 0 && tables.All(TableExists))
        {
            return;
        }

        var script = dbContext.Database.GenerateCreateScript();
        if (string.IsNullOrWhiteSpace(script))
        {
            return;
        }

        foreach (var statement in SplitStatements(script))
        {
            Execute.Sql(statement).Do();
        }
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
            {
                yield return trimmed;
            }
        }
    }
}

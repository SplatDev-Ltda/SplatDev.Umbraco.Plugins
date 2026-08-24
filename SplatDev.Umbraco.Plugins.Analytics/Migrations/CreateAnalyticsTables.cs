using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Plugins.Analytics.Data;
using Umbraco.Cms.Infrastructure.Migrations;

namespace SplatDev.Umbraco.Plugins.Analytics.Migrations;

/// <summary>
/// Creates this plugin's tables inside Umbraco's database.
/// </summary>
/// <remarks>
/// The DDL comes from EF's own model, so the table and column names match the entities and
/// the active provider. Naming a table by hand is how the drift happens: Umbraco's
/// <c>Create.Table&lt;T&gt;()</c> names it after the entity while EF names it from
/// <c>[Table]</c>, and when the two disagree the migration succeeds, records itself as
/// done, and leaves every query hitting something that was never created.
///
/// EnsureCreated is not usable here — it asks whether the *database* exists, and this
/// context shares Umbraco's, which always does, so it would create nothing.
/// </remarks>
public class CreateAnalyticsTables : MigrationBase
{
    private readonly IServiceProvider _serviceProvider;

    public CreateAnalyticsTables(IMigrationContext context, IServiceProvider serviceProvider)
        : base(context) => _serviceProvider = serviceProvider;

    protected override void Migrate()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AnalyticsDbContext>();

        // An existing site may already carry these tables. Creating them again throws on
        // every boot, and Umbraco only records a migration once it succeeds, so the failure
        // would repeat forever rather than settle.
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
    /// Splits a generated script on GO batch separators, which SQL Server's provider emits
    /// and which are not valid SQL to send to the server.
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

/// <summary>The plan Umbraco runs, and records as having run.</summary>
public class AnalyticsMigrationPlan : MigrationPlan
{
    public AnalyticsMigrationPlan() : base("SplatDev.Analytics")
    {
        From(string.Empty).To<CreateAnalyticsTables>("analytics-v1");
    }
}

using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SplatDev.Umbraco.Plugins.Lgpd.Models;
using Umbraco.Cms.Infrastructure.Migrations;

namespace SplatDev.Umbraco.Plugins.Lgpd.Migrations;

/// <summary>
/// Creates this plugin's tables from the EF model, under the names the DbContext actually uses.
/// </summary>
/// <remarks>
/// The original migration built its DDL with Umbraco's Create.Table&lt;T&gt;(), which names a
/// table after the entity, while EF names it from the [Table] attribute on that entity. The two
/// disagreed: the migration created Consentimento, Requisicao and OperacaoTratamento, and the context queried
/// Consentimentos, Requisicoes and Operacoes. The migration therefore reported success, recorded itself as done, and left
/// the plugin querying tables that were never created — every dashboard request returned 500 on
/// a fresh install.
///
/// Generating the DDL from EF's own model removes the possibility of that drift: the names come
/// from the same place the queries do, for whichever provider is in use.
/// </remarks>
public class CreateLgpdTablesFromModel : MigrationBase
{
    private readonly IServiceProvider _serviceProvider;

    public CreateLgpdTablesFromModel(IMigrationContext context, IServiceProvider serviceProvider)
        : base(context) => _serviceProvider = serviceProvider;

    protected override void Migrate()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<LgpdDbContext>();

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

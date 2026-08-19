using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.Lgpd.Models;
using Umbraco.Cms.Infrastructure.Migrations;

namespace SplatDev.Umbraco.Plugins.Lgpd.Migrations;

/// <remarks>
/// Forked by target framework: Umbraco 17 runs migrations asynchronously through
/// AsyncMigrationBase, while Umbraco 13 has only the synchronous MigrationBase. The
/// body is the same either way — the split is purely the shape the CMS calls it with.
/// </remarks>
public class CreateLgpdTables(IMigrationContext context, ILogger<CreateLgpdTables> logger)
#if NET10_0_OR_GREATER
    : AsyncMigrationBase(context)
{
    protected override Task MigrateAsync()
    {
        Run();
        return Task.CompletedTask;
    }
#else
    : MigrationBase(context)
{
    protected override void Migrate() => Run();
#endif

    private void Run()
    {
        logger.LogDebug("Running migration {MigrationStep}", "CreateLgpdTables");

        if (!TableExists("Consentimentos"))
        {
            Create.Table<Consentimento>().Do();
            logger.LogInformation("Created table {Table}", "lgpd.Consentimentos");
        }

        if (!TableExists("Requisicoes"))
        {
            Create.Table<Requisicao>().Do();
            logger.LogInformation("Created table {Table}", "lgpd.Requisicoes");
        }

        if (!TableExists("Operacoes"))
        {
            Create.Table<OperacaoTratamento>().Do();
            logger.LogInformation("Created table {Table}", "lgpd.Operacoes");
        }
    }
}

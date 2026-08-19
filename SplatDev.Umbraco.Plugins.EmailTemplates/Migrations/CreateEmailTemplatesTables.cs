using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Infrastructure.Migrations;
using SplatDev.Umbraco.Plugins.EmailTemplates.Models;

namespace SplatDev.Umbraco.Plugins.EmailTemplates.Migrations;

/// <remarks>
/// Forked by target framework: Umbraco 17 runs migrations asynchronously through
/// AsyncMigrationBase, while Umbraco 13 has only the synchronous MigrationBase. The
/// body is the same either way — the split is purely the shape the CMS calls it with.
/// </remarks>
public class CreateEmailTemplatesTables(IMigrationContext context, ILogger<CreateEmailTemplatesTables> logger)
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
        logger.LogDebug("Running migration {MigrationStep}", "CreateEmailTemplatesTables");

        if (!TableExists(EmailTemplate.TableName))
        {
            Create.Table<EmailTemplate>().Do();
            logger.LogInformation("Created table {Table}", EmailTemplate.TableName);
        }

        if (!TableExists(EmailStyle.TableName))
        {
            Create.Table<EmailStyle>().Do();
            logger.LogInformation("Created table {Table}", EmailStyle.TableName);
        }
    }
}

using System.Threading.Tasks;
﻿using Microsoft.Extensions.Logging;

using Umbraco.Cms.Infrastructure.Migrations;
using SplatDev.Umbraco.Plugins.RedirectManager.Models;

namespace SplatDev.Umbraco.Plugins.RedirectManager.Migrations
{
#if NET10_0_OR_GREATER
    public class RedirectUrlsMigration(IMigrationContext context, ILogger<RedirectUrlsMigration> logger) : AsyncMigrationBase(context)
    {
        private readonly ILogger<RedirectUrlsMigration> _logger = logger;

        protected override async Task MigrateAsync()
#else
    public class RedirectUrlsMigration(IMigrationContext context, ILogger<RedirectUrlsMigration> logger) : MigrationBase(context)
    {
        private readonly ILogger<RedirectUrlsMigration> _logger = logger;

        protected override void Migrate()
#endif
        {
            _logger.LogDebug("Running migration {MigrationStep}", "RedirectionUrls");

            if (TableExists(RedirectUrl.TABLE_NAME) == false)
            {
                Create.Table<RedirectUrl>().Do();
            }
            else
            {
                _logger.LogDebug("The database table {DbTable} already exists, skipping", RedirectUrl.TABLE_NAME);
            }
#if !NET10_0_OR_GREATER
        }
#else
            await Task.CompletedTask;
        }
#endif
    }
}

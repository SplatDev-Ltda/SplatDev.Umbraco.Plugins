using System.Threading.Tasks;
﻿using Microsoft.Extensions.Logging;

using Umbraco.Cms.Infrastructure.Migrations;
using SplatDev.Umbraco.Plugins.CacheManager.Models;

namespace SplatDev.Umbraco.Plugins.CacheManager.Migrations
{
#if NET10_0_OR_GREATER
    public class UrlNotFoundMigration(IMigrationContext context, ILogger<UrlNotFoundMigration> logger) : AsyncMigrationBase(context)
    {
        private readonly ILogger<UrlNotFoundMigration> _logger = logger;

        protected override async Task MigrateAsync()
#else
    public class UrlNotFoundMigration(IMigrationContext context, ILogger<UrlNotFoundMigration> logger) : MigrationBase(context)
    {
        private readonly ILogger<UrlNotFoundMigration> _logger = logger;

        protected override void Migrate()
#endif
        {
            _logger.LogDebug("Running migration {MigrationStep}", "UrlNotFound");

            if (TableExists(UrlNotFound.TABLE_NAME) == false)
            {
                Create.Table<UrlNotFound>().Do();
            }
            else
            {
                _logger.LogDebug("The database table {DbTable} already exists, skipping", UrlNotFound.TABLE_NAME);
            }
#if !NET10_0_OR_GREATER
        }
#else
            await Task.CompletedTask;
        }
#endif
    }
}

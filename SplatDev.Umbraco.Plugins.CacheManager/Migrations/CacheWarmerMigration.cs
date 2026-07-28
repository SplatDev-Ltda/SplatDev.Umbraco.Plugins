using System.Threading.Tasks;
﻿using Microsoft.Extensions.Logging;

using Umbraco.Cms.Infrastructure.Migrations;
using SplatDev.Umbraco.Plugins.CacheManager.Models;

namespace SplatDev.Umbraco.Plugins.CacheManager.Migrations
{
#if NET10_0_OR_GREATER
    public class CacheWarmerMigration(IMigrationContext context, ILogger<CacheWarmerMigration> logger) : AsyncMigrationBase(context)
    {
        private readonly ILogger<CacheWarmerMigration> _logger = logger;

        protected override async Task MigrateAsync()
#else
    public class CacheWarmerMigration(IMigrationContext context, ILogger<CacheWarmerMigration> logger) : MigrationBase(context)
    {
        private readonly ILogger<CacheWarmerMigration> _logger = logger;

        protected override void Migrate()
#endif
        {
            _logger.LogDebug("Running migration {MigrationStep}", "AddCacheManager");

            if (TableExists(CacheWarmerEntry.TABLE_NAME) == false)
            {
                Create.Table<CacheWarmerEntry>().Do();
            }
            else
            {
                _logger.LogDebug("The database table {DbTable} already exists, skipping", CacheWarmerEntry.TABLE_NAME);
            }
#if !NET10_0_OR_GREATER
        }
#else
            await Task.CompletedTask;
        }
#endif
    }
}

using Umbraco.Core.Logging;
using Umbraco.Core.Migrations;
using Umbraco.Plugins.SimpleAnalytics.Models;

namespace Umbraco.Plugins.SimpleAnalytics.Migrations
{

    public class SimpleAnalyticsMigration : MigrationBase
    {
        private readonly ILogger logger;
        private const string RUNNING_MIGRATION = "Running migration {MigrationStep}";
        private const string ALREADY_EXISTS = "The database table {DbTable} already exists, skipping";

        public SimpleAnalyticsMigration(IMigrationContext context, ILogger logger) : base(context)
        {
            this.logger = logger;
        }

        public override void Migrate()
        {
            logger.Info<SimpleAnalyticsMigration>(RUNNING_MIGRATION);

            if (TableExists(AnalyticsVisit.TABLENAME) == false)
            {
                Create.Table<AnalyticsVisit>().Do();
                Database.Execute($"CREATE NONCLUSTERED INDEX [IX_Nonclustered_IP_Node_DateTime] ON [{AnalyticsVisit.TABLENAME}]([IPAddress], [ContentNodeId], [VisitedStarted] ASC);");
                Database.Execute($"CREATE UNIQUE NONCLUSTERED INDEX [IX_Unique_IX_Nonclustered_IP_Node_DateTime] ON [{AnalyticsVisit.TABLENAME}]([IPAddress], [ContentNodeId], [VisitedStarted] ASC);");
            }
            else
                logger.Debug<SimpleAnalyticsMigration>(ALREADY_EXISTS);

        }
    }
}

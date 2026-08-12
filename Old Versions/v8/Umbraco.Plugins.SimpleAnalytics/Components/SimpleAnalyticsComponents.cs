
using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Core.Logging;
using Umbraco.Core.Migrations;
using Umbraco.Core.Migrations.Upgrade;
using Umbraco.Core.Scoping;
using Umbraco.Core.Services;
using Umbraco.Plugins.SimpleAnalytics.Migrations;
using Umbraco.Plugins.SimpleAnalytics.Repositories;

namespace Umbraco.Plugins.SimpleAnalytics.Components
{
    [RuntimeLevel(MinLevel = RuntimeLevel.Run)]
    public class SimpleAnalyticsRepositoriesComposer : IUserComposer
    {
        public void Compose(Composition composition)
        {
            composition.Register<IAnalyticsRepository, AnalyticsRepository>(Lifetime.Scope);
        }
    }

    public class SimpleAnalyticsMigrationComposer : ComponentComposer<SimpleAnalyticsMigrationComponent> { }
    public class SimpleAnalyticsMigrationComponent : IComponent
    {
        private readonly IScopeProvider _scopeProvider;
        private readonly IMigrationBuilder _migrationBuilder;
        private readonly IKeyValueService _keyValueService;
        private readonly ILogger _logger;

        public SimpleAnalyticsMigrationComponent(IScopeProvider scopeProvider, IMigrationBuilder migrationBuilder, IKeyValueService keyValueService, ILogger logger)
        {
            _scopeProvider = scopeProvider;
            _migrationBuilder = migrationBuilder;
            _keyValueService = keyValueService;
            _logger = logger;
        }

        public void Initialize()
        {
            var migrationPlan = new MigrationPlan("SimpleAnalyticsVisits");

            migrationPlan.From(string.Empty)
                .To<SimpleAnalyticsMigration>("simpleanalytics-db");

            var upgrader = new Upgrader(migrationPlan);
            upgrader.Execute(_scopeProvider, _migrationBuilder, _keyValueService, _logger);
        }
        public void Terminate()
        {
        }
    }
}

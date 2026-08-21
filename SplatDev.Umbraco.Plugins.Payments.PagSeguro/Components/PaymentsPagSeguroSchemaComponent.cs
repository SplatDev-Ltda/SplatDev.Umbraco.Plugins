using SplatDev.Umbraco.Plugins.Payments.PagSeguro.Migrations;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;

namespace SplatDev.Umbraco.Plugins.Payments.PagSeguro.Components;

/// <summary>
/// Creates this plugin's schema on startup if it is not already there.
/// </summary>
public class PaymentsPagSeguroSchemaComponent(
    ICoreScopeProvider coreScopeProvider,
    IMigrationPlanExecutor migrationPlanExecutor,
    IKeyValueService keyValueService,
    IRuntimeState runtimeState) : IComponent
{
    public void Initialize()
    {
        if (runtimeState.Level < RuntimeLevel.Run)
            return;

        var plan = new MigrationPlan("SplatDev.PaymentsPagSeguro.Schema");
        plan.From(string.Empty)
            .To<CreatePaymentsPagSeguroTables>("paymentspagseguro-schema-v1");

        new Upgrader(plan).Execute(migrationPlanExecutor, coreScopeProvider, keyValueService);
    }

    public void Terminate() { }
}

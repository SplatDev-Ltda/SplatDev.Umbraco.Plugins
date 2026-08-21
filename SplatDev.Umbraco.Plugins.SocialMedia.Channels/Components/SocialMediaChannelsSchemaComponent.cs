using SplatDev.Umbraco.Plugins.SocialMedia.Channels.Migrations;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;

namespace SplatDev.Umbraco.Plugins.SocialMedia.Channels.Components;

/// <summary>
/// Creates this plugin's schema on startup if it is not already there.
/// </summary>
public class SocialMediaChannelsSchemaComponent(
    ICoreScopeProvider coreScopeProvider,
    IMigrationPlanExecutor migrationPlanExecutor,
    IKeyValueService keyValueService,
    IRuntimeState runtimeState) : IComponent
{
    public void Initialize()
    {
        if (runtimeState.Level < RuntimeLevel.Run)
            return;

        var plan = new MigrationPlan("SplatDev.SocialMediaChannels.Schema");
        plan.From(string.Empty)
            .To<CreateSocialMediaChannelsTables>("socialmediachannels-schema-v1");

        new Upgrader(plan).Execute(migrationPlanExecutor, coreScopeProvider, keyValueService);
    }

    public void Terminate() { }
}

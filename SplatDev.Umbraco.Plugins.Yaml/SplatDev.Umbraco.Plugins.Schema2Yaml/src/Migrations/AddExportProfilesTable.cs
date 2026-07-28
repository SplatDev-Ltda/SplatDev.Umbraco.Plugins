using System.Threading.Tasks;
using NPoco;
using Umbraco.Cms.Core.Packaging;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace SplatDev.Umbraco.Plugins.Schema2Yaml.Migrations;

[TableName("schema2yamlExportProfiles")]
[PrimaryKey("id", AutoIncrement = true)]
[ExplicitColumns]
public class ExportProfileDto
{
    [Column("id")]
    [PrimaryKeyColumn(AutoIncrement = true)]
    public int Id { get; set; }

    [Column("name")]
    [Length(255)]
    [NullSetting(NullSetting = NullSettings.NotNull)]
    public string Name { get; set; } = string.Empty;

    [Column("isActive")]
    [NullSetting(NullSetting = NullSettings.NotNull)]
    public bool IsActive { get; set; }

    [Column("selectionJson")]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    [NullSetting(NullSetting = NullSettings.NotNull)]
    public string SelectionJson { get; set; } = string.Empty;

    [Column("createdDate")]
    [NullSetting(NullSetting = NullSettings.NotNull)]
    public DateTime CreatedDate { get; set; }

    [Column("modifiedDate")]
    [NullSetting(NullSetting = NullSettings.NotNull)]
    public DateTime ModifiedDate { get; set; }
}

#if NET10_0_OR_GREATER
public class AddExportProfilesTableMigration : AsyncMigrationBase
{
    public AddExportProfilesTableMigration(IMigrationContext context) : base(context) { }

    protected override Task MigrateAsync()
    {
        if (!TableExists("schema2yamlExportProfiles"))
            Create.Table<ExportProfileDto>().Do();
        return Task.CompletedTask;
    }
}
#else
public class AddExportProfilesTableMigration : MigrationBase
{
    public AddExportProfilesTableMigration(IMigrationContext context) : base(context) { }

    protected override void Migrate()
    {
        if (!TableExists("schema2yamlExportProfiles"))
            Create.Table<ExportProfileDto>().Do();
    }
}
#endif

public class Schema2YamlMigrationPlan : PackageMigrationPlan
{
    public Schema2YamlMigrationPlan() : base("Schema2Yaml") { }

    protected override void DefinePlan()
    {
        From(string.Empty)
            .To<AddExportProfilesTableMigration>("2026-05-15-001-add-export-profiles");
    }
}

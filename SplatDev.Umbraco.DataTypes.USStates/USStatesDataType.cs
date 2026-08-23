#if !NET10_0_OR_GREATER
using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;

using UmbracoConstants = Umbraco.Cms.Core.Constants;

namespace SplatDev.Umbraco.DataTypes.USStates;

public class USStatesDataType(IServiceScopeFactory scopeFactory)
{
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private const string DataTypeName = "US States";

    public void Install()
    {
        using var scope = _scopeFactory.CreateScope();
        var dataTypeService = scope.ServiceProvider.GetRequiredService<IDataTypeService>();

        if (dataTypeService.GetDataType(DataTypeName) is not null) return;

        var propertyEditorCollection = scope.ServiceProvider.GetRequiredService<PropertyEditorCollection>();
        var serializer = scope.ServiceProvider.GetRequiredService<IConfigurationEditorJsonSerializer>();

        propertyEditorCollection.TryGet(UmbracoConstants.PropertyEditors.Aliases.DropDownListFlexible, out IDataEditor? editor);
        int counter = 0;
        dataTypeService.Save(new DataType(editor, serializer)
        {
            DatabaseType = ValueStorageType.Ntext,
            CreateDate = DateTime.Now,
            CreatorId = -1,
            Name = DataTypeName,
            Configuration = new DropDownFlexibleConfiguration()
            {
                Multiple = false,
                Items = UsStateNames.All
                                .Select(name => new ValueListConfiguration.ValueListItem { Id = ++counter, Value = name })
                                .ToList()
            }
        });
    }
}
#else
using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;

namespace SplatDev.Umbraco.DataTypes.USStates;

/// <summary>
/// Creates the US States data type on Umbraco 17.
/// </summary>
/// <remarks>
/// This branch used to be an empty stub:
///
///     // TODO: Implement via Umbraco 17 Management API
///     public void Install() { }
///
/// So the package compiled, shipped and did nothing on Umbraco 17 — installing it
/// created no data type, while the Umbraco 13 branch worked. The comment was also
/// mistaken about needing the Management API: IDataTypeService is still the server-side
/// way to do this, it just returns an attempt and takes the acting user's key now.
/// </remarks>
public class USStatesDataType(IServiceScopeFactory scopeFactory)
{
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private const string DataTypeName = "US States";

    public void Install()
    {
        using var scope = _scopeFactory.CreateScope();
        var dataTypeService = scope.ServiceProvider.GetRequiredService<IDataTypeService>();

        // Creating it twice would fail on every boot, and Umbraco would report the error
        // each time rather than settle.
        var existing = dataTypeService.GetAsync(DataTypeName).GetAwaiter().GetResult();
        if (existing is not null) return;

        var editors = scope.ServiceProvider.GetRequiredService<PropertyEditorCollection>();
        if (!editors.TryGet(Constants.PropertyEditors.Aliases.DropDownListFlexible, out var editor) || editor is null)
        {
            return;
        }

        var serializer = scope.ServiceProvider.GetRequiredService<IConfigurationEditorJsonSerializer>();

        var dataType = new DataType(editor, serializer)
        {
            Name = DataTypeName,
            DatabaseType = ValueStorageType.Ntext,
            ConfigurationData = new Dictionary<string, object>
            {
                ["items"] = UsStateNames.All,
                ["multiple"] = false,
            },
        };

        dataTypeService.CreateAsync(dataType, Constants.Security.SuperUserKey).GetAwaiter().GetResult();
    }
}
#endif

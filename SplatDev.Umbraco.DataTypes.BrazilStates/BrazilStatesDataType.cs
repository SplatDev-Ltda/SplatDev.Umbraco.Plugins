#if !NET10_0_OR_GREATER
using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;

using UmbracoConstants = Umbraco.Cms.Core.Constants;

namespace SplatDev.Umbraco.DataTypes.BrazilStates;

/// <summary>
/// Installs a "Brazil States" dropdown listing Brazil's 27 federative units.
/// </summary>
/// <remarks>
/// Names are stored in proper case with their accents ("São Paulo", "Espírito Santo")
/// rather than upper case. The sibling US States data type shouts its values, but these
/// are shown to Brazilian editors and readers, and stripping accents or upper-casing them
/// is simply wrong in Portuguese. Sorted alphabetically, which for these names is also
/// the order the IBGE lists them in.
/// </remarks>
public class BrazilStatesDataType(IServiceScopeFactory scopeFactory)
{
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private const string DataTypeName = "Brazil States";

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
                Items = [
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Acre" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Alagoas" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Amapá" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Amazonas" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Bahia" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Ceará" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Distrito Federal" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Espírito Santo" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Goiás" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Maranhão" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Mato Grosso" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Mato Grosso do Sul" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Minas Gerais" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Pará" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Paraíba" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Paraná" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Pernambuco" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Piauí" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Rio de Janeiro" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Rio Grande do Norte" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Rio Grande do Sul" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Rondônia" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Roraima" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Santa Catarina" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "São Paulo" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Sergipe" },
                    new ValueListConfiguration.ValueListItem { Id = ++counter, Value = "Tocantins" }
                ]
            }
        });
    }
}
#else
using Microsoft.Extensions.DependencyInjection;

namespace SplatDev.Umbraco.DataTypes.BrazilStates;

// Umbraco 17 uses Management API for data type creation — needs Umbraco 17 implementation
public class BrazilStatesDataType(IServiceScopeFactory scopeFactory)
{
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;

    public void Install()
    {
        // TODO: Implement via Umbraco 17 Management API
    }
}
#endif

namespace SplatDev.Umbraco.Plugins.CodeFirst.Helpers
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Reflection;

    using Umbraco.Cms.Core.Models;
    using Umbraco.Cms.Core.PropertyEditors;
    using Umbraco.Cms.Core.Services;

    using SplatDev.Umbraco.Plugins.CodeFirst.Attributes;
    using UmbracoCms.Plugins;

    public static class PropertiesHelpers
    {
        public static void AddProperties<T>(IEnumerable<PropertyInfo>? properties, ContentType content, IDataTypeService service) where T : System.Attribute
        {
            if (properties != null)
            {
                foreach (var property in properties)
                {
                    if (property.GetCustomAttributes().Any())
                    {
                        var attr = property.GetCustomAttribute<T>();
                        var propAlias = attr.Value<string>("Alias");

                        if (!content.PropertyTypeExists(propAlias))
                        {
                            var propName = attr.Value<string>("Name");
                            var propDescription = attr.Value<string>("Description");
                            var propTab = attr.Value<string>("Tab");
                            var propDataType = attr.Value<string>("Type");
                            var order = attr.Value<int?>("SortOrder");
                            IDataType? dataTypeDefinition;
                            switch (propDataType)
                            {
                                case Default.DataTypes.Alias.Custom:
                                    var dataType = property.PropertyType.GetProperty("Name")!.Value<string>();
                                    dataTypeDefinition = service.GetDataType(dataType);
                                    break;
                                case Default.DataTypes.Alias.NestedContent:
                                    var d = property.PropertyType.GetProperty("Name")!.Value<string>();
                                    dataTypeDefinition = service.GetDataType(d);
                                    break;
                                default:
                                    dataTypeDefinition = service.GetDataType(Default.DataTypes.DataTypesDictionaries.IdByAlias[propDataType]);
                                    break;
                            }

                            content.AddPropertyGroup(propTab);

                            PropertyType propertyType = new PropertyType(dataTypeDefinition!, propName)
                            {
                                Name = propName,
                                Alias = propAlias,
                                Description = propDescription
                            };
                            if (order.HasValue) propertyType.SortOrder = order.Value;

                            content.AddPropertyType(propertyType, propTab);

                            var prevalues = attr.Value<IEnumerable<ValueListConfiguration.ValueListItem>>("PreValues");
                            if (prevalues != null)
                            {
                                ((ValueListConfiguration)dataTypeDefinition!.Configuration!).Items.AddRange(prevalues);
                            }
                            service.Save(dataTypeDefinition!);
                        }
                    }
                }
            }
        }

        public static void AddMemberProperties<T>(IEnumerable<PropertyInfo>? properties, IMemberType member, IDataTypeService service) where T : MemberPropertyAttributesAttribute
        {
            if (properties != null)
            {
                foreach (var property in properties)
                {
                    if (property.GetCustomAttributes().Any())
                    {
                        var attr = property.GetCustomAttribute<T>();
                        var propAlias = attr.Value<string>("Alias");

                        if (!member.PropertyTypeExists(propAlias))
                        {
                            var propName = attr.Name;
                            var propDescription = attr.Description;
                            var propTab = attr.Tab;
                            var propDataType = attr.Type;
                            var sortOrder = attr.SortOrder;
                            var memberCanEdit = attr.MemberCanEdit;
                            var showOnProfile = attr.ShowOnMemberProfile;
                            var isSensitive = attr.IsSensitive;
                            var mandatory = attr.Mandatory;
                            var validationRegExp = attr.ValidationRegExp;
                            IDataType? dataTypeDefinition;
                            switch (propDataType)
                            {
                                case Default.DataTypes.Alias.Custom:
                                    var dataType = property.PropertyType.GetProperty("Name")!.Value<string>();
                                    dataTypeDefinition = service.GetDataType(dataType);
                                    break;
                                case Default.DataTypes.Alias.NestedContent:
                                    var d = property.PropertyType.GetProperty("Name")!.Value<string>();
                                    dataTypeDefinition = service.GetDataType(d);
                                    break;
                                default:
                                    dataTypeDefinition = service.GetDataType(Default.DataTypes.DataTypesDictionaries.IdByAlias[propDataType]);
                                    break;
                            }
                            member.AddPropertyGroup(propTab);

                            PropertyType propertyType = new PropertyType(dataTypeDefinition!, propName)
                            {
                                Name = propName,
                                Alias = propAlias,
                                Description = propDescription,
                                ValidationRegExp = validationRegExp,
                                Mandatory = mandatory,
                                SortOrder = sortOrder!.Value
                            };

                            member.AddPropertyType(propertyType, propTab);
                            member.SetMemberCanEditProperty(propAlias, memberCanEdit);
                            member.SetMemberCanViewProperty(propAlias, showOnProfile);
                            member.SetIsSensitiveProperty(propAlias, isSensitive);

                            var prevalues = attr.Value<IEnumerable<ValueListConfiguration.ValueListItem>>("PreValues");
                            if (prevalues != null)
                            {
                                ((ValueListConfiguration)dataTypeDefinition!.Configuration!).Items.AddRange(prevalues);
                            }
                            service.Save(dataTypeDefinition!);
                        }
                    }
                }
            }
        }
    }
}

// Copy Value property editor — only compiled for Umbraco 13 (net8.0). Umbraco 17
// (net10.0) registers the editor from umbraco-package.json instead, as a
// propertyEditorUi over the built-in Umbraco.TextBox schema, so it needs no server-side
// editor of its own.
#if !NET10_0_OR_GREATER
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;

namespace SplatDev.Umbraco.Plugins.CopyValue;

/// <summary>
/// A button on a property that fills it from one or more other properties on the same
/// item.
/// </summary>
/// <remarks>
/// The plugin is named for this and never registered it. package.manifest carried
/// "propertyEditors": [] — an empty array — so there was no editor to choose when
/// creating a data type, on either Umbraco version. What the plugin did ship was a
/// dashboard for copying values between two content nodes, which is a different job:
/// this copies between properties of the item being edited.
/// </remarks>
[DataEditor(
    alias: "SplatDev.CopyValue",
    name: "Copy Value",
    view: "~/App_Plugins/CopyValue/angular/copyvalue.propertyeditor.html",
    ValueType = ValueTypes.String,
    Group = "Common",
    Icon = "icon-documents")]
public class CopyValuePropertyEditor(
    IDataValueEditorFactory dataValueEditorFactory,
    IIOHelper ioHelper)
    : DataEditor(dataValueEditorFactory)
{
    protected override IConfigurationEditor CreateConfigurationEditor() =>
        new CopyValueConfigurationEditor(ioHelper);
}

public class CopyValueConfigurationEditor(IIOHelper ioHelper)
    : ConfigurationEditor<CopyValueConfiguration>(ioHelper)
{
}

public class CopyValueConfiguration
{
    [ConfigurationField("sourceAliases", "Copy from", "textstring",
        Description = "Property aliases on the same item to copy from, comma separated. "
                    + "Several are joined with the separator below.")]
    public string SourceAliases { get; set; } = string.Empty;

    [ConfigurationField("separator", "Separator", "textstring",
        Description = "Placed between values when copying from more than one property.")]
    public string Separator { get; set; } = " ";

    [ConfigurationField("buttonLabel", "Button label", "textstring",
        Description = "Wording on the button.")]
    public string ButtonLabel { get; set; } = "Copy from";

    [ConfigurationField("overwrite", "Overwrite without asking", "boolean",
        Description = "Off by default: copying over an existing value asks first.")]
    public bool Overwrite { get; set; }
}
#endif

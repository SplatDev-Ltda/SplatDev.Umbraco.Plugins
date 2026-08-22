// OnOffButton property editor — only compiled for Umbraco 13 (net8.0).
// Umbraco 17 (net10.0) registers the editor from umbraco-package.json instead, as a
// propertyEditorUi over the built-in Umbraco.TrueFalse schema, so it needs no
// server-side editor of its own.
#if !NET10_0_OR_GREATER
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;

namespace SplatDev.Umbraco.Plugins.OnOff;

[DataEditor(
    alias: "OnOffButtonEditor",
    name: "On-Off Button",
    view: "~/App_Plugins/OnOff/views/edit.html",
    Group = "Common",
    Icon = "icon-power")]
public class OnOffButtonEditor(
    IDataValueEditorFactory dataValueEditorFactory,
    IIOHelper ioHelper)
    : DataEditor(dataValueEditorFactory)
{
    /// <remarks>
    /// The view has always read model.config.onText and model.config.offText, but no
    /// configuration editor existed, so config was empty and both labels silently fell
    /// back to "On" and "Off" with no way to change them. Umbraco 17 exposes the same two
    /// settings from its manifest.
    /// </remarks>
    protected override IConfigurationEditor CreateConfigurationEditor() =>
        new OnOffButtonConfigurationEditor(ioHelper);
}

public class OnOffButtonConfigurationEditor(IIOHelper ioHelper)
    : ConfigurationEditor<OnOffButtonConfiguration>(ioHelper)
{
}

public class OnOffButtonConfiguration
{
    [ConfigurationField("onText", "On label", "textstring",
        Description = "Shown when the switch is on. Defaults to \"On\".")]
    public string OnText { get; set; } = "On";

    [ConfigurationField("offText", "Off label", "textstring",
        Description = "Shown when the switch is off. Defaults to \"Off\".")]
    public string OffText { get; set; } = "Off";
}
#endif

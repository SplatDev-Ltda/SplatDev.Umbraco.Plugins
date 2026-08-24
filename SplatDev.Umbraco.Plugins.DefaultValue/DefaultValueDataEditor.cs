using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;

namespace SplatDev.Umbraco.Plugins.DefaultValue;

/// <summary>
/// The property editor the Umbraco 7/8 plugin was.
/// </summary>
/// <remarks>
/// Version 2.x replaced this plugin with a rules engine — tables, a dashboard and rules
/// applied across content — and shipped no property editor at all. That is a different
/// product under the same package id: a site upgrading from Umbraco 7 or 8 has document
/// types whose properties are bound to <c>splatDev.DefaultValue</c>, and on 13 or 17 that
/// editor was simply absent, leaving those properties without one and their <c>dValue</c>
/// configuration orphaned.
///
/// It is restored alongside the rules engine rather than instead of it. The alias is the
/// original, so existing document types resolve; the rules engine is untouched and remains
/// the way to apply defaults across many properties at once.
///
/// On Umbraco 17 the attribute carries no view or icon — the backoffice takes those from
/// the propertyEditorUi in umbraco-package.json. On 13 the view path is what renders.
/// </remarks>
#if NET10_0_OR_GREATER
[DataEditor(
    alias: "splatDev.DefaultValue",
    ValueType = ValueTypes.String,
    ValueEditorIsReusable = true)]
#else
[DataEditor(
    alias: "splatDev.DefaultValue",
    name: "Default Value",
    view: "/App_Plugins/DefaultValue/angular/defaultvalue.html",
    ValueType = ValueTypes.String,
    Group = "Common",
    Icon = "icon-info")]
#endif
public class DefaultValueDataEditor : DataEditor
{
    private readonly IIOHelper _ioHelper;

    public DefaultValueDataEditor(IDataValueEditorFactory dataValueEditorFactory, IIOHelper ioHelper)
        : base(dataValueEditorFactory) => _ioHelper = ioHelper;

    protected override IConfigurationEditor CreateConfigurationEditor() =>
        new DefaultValueConfigurationEditor(_ioHelper);
}

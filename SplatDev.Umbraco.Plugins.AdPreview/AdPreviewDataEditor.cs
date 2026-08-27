using Umbraco.Cms.Core.PropertyEditors;

namespace SplatDev.Umbraco.Plugins.AdPreview;

#if NET10_0_OR_GREATER
/// <summary>
/// Registers the "AdPreview" property editor with the server.
/// </summary>
/// <remarks>
/// umbraco-package.json declares a propertyEditorSchema with this alias, but that is the
/// backoffice half only. Umbraco resolves a data type's editor from the server-side
/// IDataEditor collection, so without this class the alias exists nowhere the API can see
/// it and creating a data type answers 404 PropertyEditorNotFound - which means the editor
/// could never be attached to a document type, and the package shipped a UI nothing could
/// reach. Every other property editor here (CharLimit, CopyValue, DefaultValue, OnOff) has
/// always had its counterpart; this one did not.
///
/// The value is a JSON object - image, title, description, url, tooltip, referrer, css -
/// which the element parses out of a string, so it is stored as JSON rather than as a
/// plain string.
///
/// net10.0 only: the package ships no AngularJS view, so there is nothing for Umbraco 13
/// to render and registering the alias there would only point at a view that does not
/// exist.
/// </remarks>
[DataEditor(
    alias: "AdPreview",
    ValueType = ValueTypes.Json,
    ValueEditorIsReusable = true)]
public class AdPreviewDataEditor : DataEditor
{
    public AdPreviewDataEditor(IDataValueEditorFactory dataValueEditorFactory)
        : base(dataValueEditorFactory)
    {
    }
}
#endif

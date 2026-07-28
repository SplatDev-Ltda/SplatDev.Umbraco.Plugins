# Form Builder — Umbraco Forms Plugin

A complete form-building plugin for Umbraco CMS, modeled after the commercial Umbraco Forms package. Provides drag-and-drop form creation, entry management, workflows, data sources, email templates, theme support, reCAPTCHA integration, and multi-language localization — all inside the Umbraco backoffice.

> **Headless plugin** — Core operates as a service layer. The AngularJS backoffice UI (legacy, needs Bellissima migration) is provided separately. Form entries, workflows, data sources, and API endpoints all function headless.

## Features

- **Form Builder UI** — Create and edit forms in the Umbraco backoffice with a property-editor-based form designer
- **Entry Management** — View, filter, export (Excel via EPPlus), and delete form submissions
- **Workflows** — Configure post-submission actions: send email, save to database, call webhook, change record state, and more
- **Data Sources** — Connect form fields to prevalue sources (SQL, CSV, custom providers)
- **Themes** — Render forms on the frontend with configurable themes (default, Bootstrap 3 horizontal)
- **Email Templates** — Customizable Razor-based email templates per form
- **reCAPTCHA v2/v3** — Spam protection with configurable site keys and thresholds
- **Conditions & Logic** — Show/hide fields based on previous answers using JSON Logic
- **Multi-language** — Localized backoffice UI (cs-CZ, da-DK, en-US included; extendable)
- **Cache Management** — Distributed cache refreshers for forms, folders, prevalues, workflows, and data sources
- **Swagger API** — Auto-generated OpenAPI docs at `/umbraco/swagger/formBuilder/swagger.json`

## Installation

### NuGet (recommended)

```bash
dotnet add package FormBuilder
```

The package is a Razor Class Library targeting `net9.0` (Umbraco 14/15+). It self-registers via `IComposer`.

### Manual

1. Copy `Plugin/` contents into your Umbraco project
2. Add project reference to `FormBuilder.csproj`
3. The plugin auto-discovers via `FormBuilderApiComposer`

## Configuration

All settings are managed through `appsettings.json` under the `FormBuilder` section:

```json
{
  "FormBuilder": {
    "DefaultForm": {
      "DisableDefaultStylesheet": false,
      "FieldIndicator": "MarkMandatoryFields",
      "Indicator": "*",
      "ShowDataConsent": true,
      "DataConsentText": "I agree to the terms and conditions",
      "StoreRecordsLocally": true
    },
    "FormDesign": {
      "DisableAutomaticScriptAndStyling": false
    },
    "Security": {
      "DisallowedFileUploadExtensions": "exe,bin,dll,config",
      "EnableAntiForgeryToken": true,
      "SavePlainTextPasswords": false
    },
    "Recaptcha": {
      "PublicKey": "",
      "PrivateKey": "",
      "Version": "v2"
    },
    "ScheduledRecordDeletion": {
      "Enabled": false,
      "RetentionPeriodDays": 365
    }
  }
}
```

## Umbraco Version Compatibility

| Umbraco Version | Status |
|----------------|--------|
| v13 | Not tested — may work with adjustments |
| v14 | Supported |
| v15 | Supported (primary target) |
| v17 | Not tested — legacy AngularJS backoffice; Bellissima portal migration needed |

## Usage

1. After installation, the **Form Builder** section appears in the Umbraco backoffice
2. Create a new form, add fields (text, textarea, dropdown, checkbox, file upload, date picker, recaptcha, etc.)
3. Add workflows (email, webhook, etc.) triggered on form submission
4. Configure data sources for prevalues if needed
5. Insert the form on a page using the Form Picker property editor or the `@Html.RenderForm(Guid formId)` helper

### Frontend Rendering

```html
<!-- Include scripts and styles in your template -->
<link rel="stylesheet" href="/App_Plugins/FormBuilder/assets/defaultform.min.css" />
<script src="/App_Plugins/FormBuilder/assets/form-builder-conditions.min.js"></script>
<script src="/App_Plugins/FormBuilder/assets/defaultform.min.js"></script>
```

Forms render automatically when placed via the property editor. Theme CSS files are located under `themes/`.

## Project Structure

```
Plugin/
├── FormBuilder/              # Main Razor Class Library
│   ├── Client/               # Backoffice UI (AngularJS/JS scripts, umbraco-package.json)
│   ├── Composers/            # IComposer registrations
│   ├── Controllers/          # Management API controllers (v1)
│   ├── Core/                 # Business logic, cache, configuration, services
│   ├── Views/                # Razor views for form rendering
│   └── FormBuilder.csproj    # .NET 9 Razor SDK project
├── Umbraco.Forms/            # Core Forms library
├── Umbraco.Forms.Core/       # Contracts & interfaces
├── Umbraco.Forms.Core.Providers/ # Provider implementations
├── Umbraco.Forms.Examine/    # Examine index integration
├── Umbraco.Forms.StaticAssets/ # Static web assets
└── Umbraco.Forms.Web/        # Web layer (controllers, views)
Web/                          # Demo/test website
Forms/                        # Sample form JSON definitions
```

## Known Limitations

- **Legacy Backoffice UI**: Uses AngularJS (not Bellissima Lit elements). The Umbraco 17+ backoffice requires a full Lit migration of the dashboard and form designer.
- **No `client/` folder at project root**: The client build pipeline uses `Plugin/FormBuilder/Client/` with embedded static assets — not the standard Bellissima `client/` + Vite convention.
- **EPPlus 4.x**: Uses EPPlus 4.5.3.3 which requires a commercial license for production Excel export. Consider upgrading to EPPlus 5+ (LGPL) or another library.
- **NET 9 only**: The `.csproj` targets `net9.0` with no multi-targeting. Umbraco 13 (.NET 8) compatibility requires a separate build.
- **Missing Bellissima Dashboard**: The `umbraco-package.json` declares a section + menu but uses legacy scripts. A [Lit dashboard migration](https://github.com/splatdevtech/SplatDev.Umbraco.Plugins/issues) is tracked separately.

## Development

```bash
# Restore dependencies
dotnet restore Plugin/FormBuilder/FormBuilder.csproj

# Build
dotnet build Plugin/FormBuilder/FormBuilder.csproj

# Package
dotnet pack Plugin/FormBuilder/FormBuilder.csproj -c Release
```

## License

Proprietary. Contact SplatDev for licensing details.

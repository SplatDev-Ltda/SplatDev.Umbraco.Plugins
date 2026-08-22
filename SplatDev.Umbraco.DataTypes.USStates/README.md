# SplatDev.Umbraco.DataTypes.USStates

A pre-configured Umbraco data type that provides a dropdown list of all 50 US states, including DC and US territories.

## Package

**NuGet:** `SplatDev.Umbraco.DataTypes.USStates` (v2.0.0)

## Compatibility

| Umbraco Version | .NET | Status |
|----------------|------|--------|
| v13 | net8.0 | Supported |
| v17 | net10.0 | Supported |

## Installation

```bash
dotnet add package SplatDev.Umbraco.DataTypes.USStates
```

After installing the package, the data type is auto-created via `USStatesDataType.Install()`. No manual configuration is required.

## Usage

The "US States" data type appears in the Umbraco Settings > Data Types section after installation. Use it as a property editor on any document type that needs a state/region picker:

1. Open any Document Type
2. Add a new property
3. Select "US States" as the editor
4. Content editors will see a dropdown with all 50 US states, DC, and territories

## Configuration

The data type uses the `Umbraco.DropDownListFlexible` property editor with pre-populated values. Customization is available through the standard Umbraco data type editor UI.

## Dependencies

- Umbraco.Cms.Core
- Umbraco.Cms.Infrastructure
- Umbraco.Cms.Web.BackOffice (v13) / Umbraco.Cms.Api.Management (v17)

## Known Limitations

- This is a data type library — no backoffice UI beyond the standard Umbraco data type editor.
- No `client/` folder or Bellissima dashboard (intentional — headless data type).
- The data type is auto-created once. Deleting and re-creating requires re-running the installer.

## Changelog

### 2.0.2 — 2026-08-22
- This package's README now reaches NuGet. The publish workflow discovered packages by a list of name patterns, and this one matched none of them, so it was never built or pushed by CI — the version on NuGet was placed there by hand before the README was wired up, and no release could refresh it. Discovery is now by prefix, so the package ships whenever the repo is tagged.


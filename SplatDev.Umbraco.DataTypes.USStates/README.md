# SplatDev.Umbraco.DataTypes.USStates

<!-- screenshot:start -->

![USStates data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.DataTypes.USStates/docs/screenshots/03-data-type.png)

<!-- screenshot:end -->

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

### 2.2.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.2.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.2.0 — 2026-08-23

Adds screenshots of the data type this package installs, on the README and on the Umbraco Marketplace listing. The listing keeps its own screenshot list rather than reading the README, and this one was empty.

### 2.1.0 — 2026-08-23
- The US States data type is created on Umbraco 17. The Umbraco 17 half of this package was an empty stub carrying a TODO, so installing it there created nothing at all while Umbraco 13 worked — the package shipped, compiled, and did nothing.
- The comment claiming this needed the Management API was mistaken: IDataTypeService is still the way to do it server-side, it just returns an attempt and takes the acting user's key now.
- The list of names now lives in one place used by both Umbraco versions, so they cannot drift apart.

### 2.0.2 — 2026-08-22
- This package's README now reaches NuGet. The publish workflow discovered packages by a list of name patterns, and this one matched none of them, so it was never built or pushed by CI — the version on NuGet was placed there by hand before the README was wired up, and no release could refresh it. Discovery is now by prefix, so the package ships whenever the repo is tagged.


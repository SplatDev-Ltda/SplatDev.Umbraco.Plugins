# SplatDev.Umbraco.DataTypes.BrazilStates

<!-- screenshot:start -->

![BrazilStates data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.DataTypes.BrazilStates/docs/screenshots/03-data-type.png)

<!-- screenshot:end -->

A pre-configured Umbraco data type providing a dropdown of Brazil's 27 federative units — the 26 states plus the Distrito Federal.

## Package

**NuGet:** `SplatDev.Umbraco.DataTypes.BrazilStates` (v1.0.0)

## Compatibility

| Umbraco Version | .NET | Status |
|----------------|------|--------|
| v13 | net8.0 | Supported — the data type installs itself |
| v17 | net10.0 | Installs and runs, but **does not create the data type yet** |

On Umbraco 17 data types are created through the Management API rather than
`IDataTypeService.Save`, and that path is not implemented yet. The package targets
net10.0 and is safe to install there, but nothing appears under Settings → Data Types.
This mirrors the sibling `SplatDev.Umbraco.DataTypes.USStates`, which has the same gap.

## Installation

```bash
dotnet add package SplatDev.Umbraco.DataTypes.BrazilStates
```

On Umbraco 13 the data type is created at startup by `BrazilStatesDataType.Install()`.
No manual configuration is required. Installation is idempotent — it checks for an
existing "Brazil States" data type first, so restarts never duplicate or overwrite it.

## Usage

"Brazil States" appears under Settings → Data Types after the first start. Use it as the
editor for any property that needs a state picker:

1. Open a Document Type
2. Add a property
3. Choose **Brazil States** as the editor

The selected value is stored as the state name.

## Values

Stored in proper case, with accents, as written in Portuguese:

| | | |
|---|---|---|
| Acre | Alagoas | Amapá |
| Amazonas | Bahia | Ceará |
| Distrito Federal | Espírito Santo | Goiás |
| Maranhão | Mato Grosso | Mato Grosso do Sul |
| Minas Gerais | Pará | Paraíba |
| Paraná | Pernambuco | Piauí |
| Rio de Janeiro | Rio Grande do Norte | Rio Grande do Sul |
| Rondônia | Roraima | Santa Catarina |
| São Paulo | Sergipe | Tocantins |

The US States sibling upper-cases its values; these are not upper-cased and keep their
accents, because that is how the names are written and how editors and readers expect to
see them. If you need the two-letter UF codes (SP, RJ, MG …) instead, open an issue —
storing the code while displaying the name needs a different property editor.

## Changelog

### 1.1.0 — 2026-08-23
- The Brazil States data type is created on Umbraco 17. The Umbraco 17 half of this package was an empty stub carrying a TODO, so installing it there created nothing at all while Umbraco 13 worked — the package shipped, compiled, and did nothing.
- The comment claiming this needed the Management API was mistaken: IDataTypeService is still the way to do it server-side, it just returns an attempt and takes the acting user's key now.
- The list of names now lives in one place used by both Umbraco versions, so they cannot drift apart.

### 1.0.1 — 2026-08-22
- This package's README now reaches NuGet. The publish workflow discovered packages by a list of name patterns, and this one matched none of them, so it was never built or pushed by CI — the version on NuGet was placed there by hand before the README was wired up, and no release could refresh it. Discovery is now by prefix, so the package ships whenever the repo is tagged.

## License

MIT © SplatDev

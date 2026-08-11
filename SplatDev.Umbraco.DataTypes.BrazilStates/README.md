# SplatDev.Umbraco.DataTypes.BrazilStates

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

## License

MIT © SplatDev

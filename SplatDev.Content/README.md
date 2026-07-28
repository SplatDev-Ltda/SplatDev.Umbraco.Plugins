# SplatDev.Content

Content helper utilities for .NET applications — Excel import/export, CSV parsing, QR code generation, encryption/decryption, ISO 3166 country data with 240+ countries, timezone data, string helpers, and validation models.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Content.svg)](https://www.nuget.org/packages/SplatDev.Content)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| .NET | Umbraco | Package Version |
|------|---------|-----------------|
| 8.0  | 13      | 1.0.0           |
| 10.0 | 17      | 1.0.0           |

## Installation

```sh
dotnet add package SplatDev.Content
```

## Configuration

### Excel Import/Export (EPPlus)

```csharp
using SplatDev.Content;

// Export a collection to Excel
var data = GetProducts();
var excelBytes = ExcelImporterHelpers.ExportToExcel(data, "Products");

// Import Excel data into a list
using var stream = File.OpenRead("products.xlsx");
var products = ExcelImporterHelpers.ImportFromExcel<Product>(stream);
```

### CSV Parsing

```csharp
using SplatDev.Content;

// Parse CSV data from a string or stream
var records = CsvHelpers.Parse<Customer>(csvData);
var csvOutput = CsvHelpers.Serialize(records);
```

### QR Code Generation

```csharp
using SplatDev.Content;

// Generate a QR code as a byte array (PNG)
var qrBytes = QRHelpers.GenerateQrCode("https://example.com", width: 300, height: 300);
File.WriteAllBytes("qrcode.png", qrBytes);
```

### Encryption & Decryption

```csharp
using SplatDev.Content;

var encrypted = EncrypDecryptHelpers.Encrypt("sensitive data", "my-secret-key");
var decrypted = EncrypDecryptHelpers.Decrypt(encrypted, "my-secret-key");
```

### Country & Timezone Data

```csharp
using SplatDev.Content;

// Look up a country by ISO 3166 code
var country = CountryHelpers.GetByCode("BR");          // Brazil
var name = Countries.Brazil.ToString();                // "Brazil"
var isoCountry = Iso3166Countries.GetByAlpha2("US");   // ISO3166Country object

// Access timezone information
var timezones = TimeZones.GetAll();
var brasiliaTz = TimeZones.GetByIanaId("America/Sao_Paulo");
```

## Features

- Excel import/export via **EPPlus** — supports `DataTable`, `List<T>`, and streams
- CSV parsing and serialization with header mapping
- QR code generation with configurable dimensions
- Symmetric encryption and decryption for sensitive data
- Complete **ISO 3166** country data: 240+ countries with alpha-2, alpha-3, numeric codes, capitals, and continents
- `Countries` enum (240+ entries) for compile-time country references
- `ISO3166Country` model with full metadata (name, codes, continent, currency)
- `Iso3166Countries` static lookup by code, name, or region
- `TimeZones` class providing IANA timezone IDs with UTC offsets
- String extension helpers: truncation, slug generation, HTML sanitization
- Validation models for common input types (email, phone, URL, etc.)

## Key Classes

| Class | Purpose |
|-------|---------|
| `ExcelImporterHelpers` | Import/export Excel files using EPPlus |
| `CsvHelpers` | Parse and serialize CSV data |
| `QRHelpers` | Generate QR codes as byte arrays |
| `EncrypDecryptHelpers` | Symmetric string encryption and decryption |
| `CountryHelpers` | Country lookup by code or name |
| `ISO3166Country` | Model representing an ISO 3166 country |
| `Countries` | Enum with 240+ country entries |
| `Iso3166Countries` | Static lookup for ISO 3166 country data |
| `TimeZones` | IANA timezone data with UTC offsets |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `EPPlus` | 7.6.1 | Excel file reading and writing |
| `Microsoft.AspNetCore.Http` | 2.2.0 | HTTP context abstractions for file handling |

---

**SplatDev.Content** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. &copy; SplatDev Ltda.

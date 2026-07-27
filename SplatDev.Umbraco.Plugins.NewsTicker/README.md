# SplatDev.Umbraco.Plugins.NewsTicker

A scrolling news ticker plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.NewsTicker.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.NewsTicker)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.1           |
| 17.x    | 10.0 | 2.0.1           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.NewsTicker
```

## Features

- Store ticker items in the database with scheduling (StartsAt / EndsAt)
- Configurable speed, direction (left/right), background colour, and text colour
- REST API for managing items from the backoffice
- View component for embedding the ticker in Razor views
- Umbraco 17 backoffice dashboard (Lit 3 element)
- Umbraco 13 backoffice dashboard (AngularJS controller)

## Configuration

Add to `appsettings.json`:

```json
{
  "UmbracoCms": {
    "NewsTicker": {
      "Speed": 50,
      "Direction": "left",
      "BackgroundColor": "#1a1a1a",
      "TextColor": "#ffffff"
    }
  }
}
```

## Embedding the Ticker

In any Razor view or layout:

```cshtml
@await Component.InvokeAsync("NewsTicker")
```

## Database

The plugin creates a `NewsTickerItems` table via EF Core. Run migrations or call
`context.Database.EnsureCreated()` during startup.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/umbraco/api/newsticker/items` | Get active items |
| GET    | `/umbraco/api/newsticker/settings` | Get current settings |
| POST   | `/umbraco/api/newsticker/items` | Add a new item |
| PUT    | `/umbraco/api/newsticker/items/{id}` | Update an item |
| DELETE | `/umbraco/api/newsticker/items/{id}` | Delete an item |

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)

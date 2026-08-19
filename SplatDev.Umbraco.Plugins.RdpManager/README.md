# RdpManager

Umbraco Remote Desktop connection manager — store RDP configurations and generate `.rdp` file downloads from the backoffice.


<!-- screenshot:start -->

![RdpManager dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.RdpManager/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.RdpManager.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.RdpManager)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.RdpManager
```

## Quick Start

The plugin auto-registers via `RdpManagerComposer`, which sets up the EF Core DbContext and registers `IRdpManagerService`.

## Configuration

Add to `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "umbracoDbDSN": "Server=localhost;Database=umbraco;Trusted_Connection=True;"
  }
}
```

The plugin uses the Umbraco database connection string for storing RDP configurations.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/RdpManagerApi/GetAll` | List all RDP connections |
| GET | `/umbraco/api/RdpManagerApi/GetById?id=` | Get a specific connection |
| POST | `/umbraco/api/RdpManagerApi/Create` | Create a new connection |
| PUT | `/umbraco/api/RdpManagerApi/Update` | Update an existing connection |
| DELETE | `/umbraco/api/RdpManagerApi/Delete?id=` | Delete a connection |
| GET | `/umbraco/api/RdpManagerApi/DownloadRdpFile?id=` | Download `.rdp` file |

## Usage

Manage RDP connections through the backoffice dashboard. Each connection stores hostname, port, username, and domain. Click "Download RDP" to generate and download a ready-to-use `.rdp` file.

## Known Limitations

- RDP credentials (username, domain) are stored in the database without encryption
- Generated `.rdp` files use hardcoded settings (wallpaper enabled, no gateway support)
- No authentication or authorization on API endpoints — any authenticated backoffice user can access all connections
- Uses the same `ConnectionStrings:umbracoDbDSN` as Umbraco (no separate connection string support)

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
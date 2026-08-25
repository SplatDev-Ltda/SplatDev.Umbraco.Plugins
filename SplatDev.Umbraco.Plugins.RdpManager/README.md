# RdpManager

Umbraco Remote Desktop connection manager — store RDP configurations and generate `.rdp` file downloads from the backoffice.


<!-- screenshot:start -->

![RdpManager dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.RdpManager/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.RdpManager.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.RdpManager)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.5.1           |
| 17.x    | 10.0 | 2.5.1           |

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

## Changelog

### 2.5.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.5.0 — 2026-08-23

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

### 2.4.0 — 2026-08-22
- Connections can be filled in from your directory. Search Active Directory, an LDAP server or Entra ID for a person and take their login and domain straight into the connection, instead of typing them and hoping they match what the host expects.
- Accounts can be created from the dashboard, when a site allows it. The dialog takes the details a directory needs — login, names, e-mail, department, job title, telephone — and reports plainly when an account already exists, showing which one it found so you can use it.
- Creating accounts is off unless it is switched on. It needs `Directory:AllowUserCreation` and a single container named in `Directory:CreateUsersInOrganizationalUnit`; a request naming anywhere else is refused rather than redirected. When creation is unavailable the dashboard says why rather than offering a button that fails.
- No password is handled anywhere. Accounts are created needing one set by an administrator — on Active Directory the account is created disabled, since AD will not enable an account without a password. A password typed into a CMS form would travel through the browser and the request log to get there.
- Directory support is provided by the new SplatDev.Directory packages, so the same lookups are available to any plugin rather than being locked inside this one.

### 2.3.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
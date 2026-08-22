# MemberTypes

Member type management plugin for Umbraco CMS — create, edit, and manage custom member types with profile fields, custom properties, and type templates via API and a backoffice dashboard.


<!-- screenshot:start -->

![MemberTypes dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.MemberTypes/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.MemberTypes.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.MemberTypes)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.MemberTypes
```

## Quick Start

The plugin auto-registers via Umbraco's composition system. No explicit `Program.cs` registration required.

## Features

- List all member types with property counts
- View member type details and properties
- Create new member types via API
- Update existing member types
- Delete member types
- Backoffice dashboard (AngularJS for U13, Lit 3 Web Component for U17)

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/membertypes/GetAll` | List all member types |
| GET | `/umbraco/api/membertypes/GetByAlias?alias=...` | Get member type by alias |
| POST | `/umbraco/api/membertypes/Create` | Create a member type |
| PUT | `/umbraco/api/membertypes/Update?alias=...` | Update a member type |
| DELETE | `/umbraco/api/membertypes/Delete?alias=...` | Delete a member type |

## Client Build

The backoffice dashboard uses a client-side build:

```bash
cd client
npm install
npm run build
```

## Known Limitations

- Delete operations are irrevocable — no recycle bin or soft-delete for member types
- No validation to prevent deletion of member types that have existing members
- Client dashboard requires manual build step after package installation; assets are not pre-built in the NuGet package

## Changelog

### 2.2.4 — 2026-08-22
- Creating a member type works. The service constructed the type with a null `IShortStringHelper`, and the alias setter runs the value through it — so the alias was stripped to empty and Umbraco refused the save with "cannot have an empty Alias". The endpoint returned 500 every time it was called, which is to say creating a member type had never worked.
- The dashboard can now manage member types, which is what it always said it did. It previously rendered one table and offered no controls at all, while the API behind it had supported create, rename and delete the whole time.
- Each member type's properties can be expanded in place, showing the alias, whether the property is required, and its description.
- Deleting asks first, and says what goes with it — the members of that type and the values held in its properties.

### 2.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
# MemberTypes

Member type management plugin for Umbraco CMS — create, edit, and manage custom member types with profile fields, custom properties, and type templates via API and a backoffice dashboard.

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

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)

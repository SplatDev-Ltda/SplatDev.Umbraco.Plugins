# ShopCart

Simple shopping cart for Umbraco — add/remove items, quantity management, and session-based cart with a backoffice dashboard.


<!-- screenshot:start -->

![ShopCart dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.ShopCart/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.ShopCart.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.ShopCart)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.3.4           |
| 17.x    | 10.0 | 2.3.4           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.ShopCart
```

## Quick Start

The plugin auto-registers via `ShopCartComposer`, which sets up the EF Core DbContext and `IShopCartService`.

## Configuration

Add to `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "umbracoDbDSN": "Server=localhost;Database=umbraco;Trusted_Connection=True;"
  }
}
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/shopcart/GetCart?sessionId=` | Retrieve cart contents |
| POST | `/umbraco/api/shopcart/AddItem` | Add item to cart |
| POST | `/umbraco/api/shopcart/UpdateQuantity` | Update item quantity |
| DELETE | `/umbraco/api/shopcart/RemoveItem?id=` | Remove item from cart |
| DELETE | `/umbraco/api/shopcart/ClearCart?sessionId=` | Empty the cart |
| GET | `/umbraco/api/shopcart/GetTotal?sessionId=` | Get cart total |


## Usage

Call the API from your front-end with a session identifier:

```javascript
// Add item to cart
fetch('/umbraco/api/shopcart/AddItem', {
    method: 'POST',
    body: JSON.stringify({ sessionId: 'abc123', productId: 1, quantity: 1 }),
    headers: { 'Content-Type': 'application/json' }
});
```

The plugin includes a `ProductDocumentType` scaffolding class for creating Umbraco product content types.

## Known Limitations

- Session-based cart management — no authentication integration or persistent user carts
- No built-in checkout or payment flow; must be integrated with a separate payment plugin
- Uses the same `ConnectionStrings:umbracoDbDSN` as Umbraco (no separate database)
- No auto-install mechanism for the Product document type scaffolding

## Changelog

### 2.3.4 — 2026-08-26

The NuGet listing now shows the dashboard. It had no screenshot before, so the listing gave no picture of what the plugin looks like in the backoffice.

### 2.3.3 — 2026-08-26

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

### 2.3.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.3.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.3.0 — 2026-08-23

The Umbraco Marketplace listing now carries this plugin's screenshots. The listing keeps its own screenshot list rather than reading the README, and this one was empty — so the entry showed no images at all.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
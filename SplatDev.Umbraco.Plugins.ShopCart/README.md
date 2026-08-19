# ShopCart

Simple shopping cart for Umbraco — add/remove items, quantity management, and session-based cart with a backoffice dashboard.


<!-- screenshot:start -->

![ShopCart dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.ShopCart/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.ShopCart.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.ShopCart)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

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

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
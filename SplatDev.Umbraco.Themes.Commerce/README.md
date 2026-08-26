# UmbracoCms.Themes.Commerce

<!-- screenshot:start -->
<!-- screenshot:end -->

E-commerce theme for Umbraco. Provides product grid, product detail, cart, checkout, and category browse pages.

## Supported Umbraco Versions

| Package version | Umbraco | .NET |
|---|---|---|
| 1.0.x | 13.x | net8.0 |
| 1.0.x | 17.x | net10.0 |

## Features

- Auto-installs Umbraco content schema via embedded YAML on first startup
- Document types: `shopRoot`, `productCategory`, `product`, `cartPage`, `checkoutPage`, `shopListing`
- Element types: `productImageElement`, `productSpecElement`, `shippingOptionElement`
- Data types: text fields, image pickers, decimal/integer, dropdowns for currency, stock status, product layout
- Razor views for all page types with semantic HTML5
- Responsive CSS (mobile-first, CSS custom properties, flexbox/grid)
- JavaScript cart stored in localStorage (replace with your cart service)

## Installation

```
dotnet add package UmbracoCms.Themes.Commerce
```

The composer runs automatically on `UmbracoApplicationStartedNotification`. A `.done` marker file is written to `config/themes/commerce/` after successful install to prevent re-runs.

## Document Type Hierarchy

```
shopRoot (allowAsRoot)
  ├── productCategory
  │     ├── product
  │     └── productCategory (nested)
  ├── shopListing
  ├── cartPage
  └── checkoutPage
```

## Views

| View | Template alias | Purpose |
|---|---|---|
| `ShopRoot.cshtml` | ShopRoot | Site entry with category grid |
| `ShopListing.cshtml` | ShopListing | Product catalog with filters, sort, layout toggle |
| `ProductCategory.cshtml` | ProductCategory | Category landing with sub-categories |
| `Product.cshtml` | Product | Product detail with gallery, specs, related |
| `CartPage.cshtml` | CartPage | Cart table with order summary |
| `CheckoutPage.cshtml` | CheckoutPage | Multi-step checkout (shipping, payment, review) |

## CSS

`wwwroot/css/commerce-theme.css` — include in your layout or link directly:

```html
<link rel="stylesheet" href="/css/commerce-theme.css" />
```

## Dependencies

- `SplatDev.Umbraco.Plugins.Yaml2Schema` >= 1.0.35
- `UmbracoCms.Themes.Base` >= 1.0.0
- `Umbraco.Cms.Core` / `Umbraco.Cms.Web.Common`

## Changelog

### 1.0.6 — 2026-08-26

The Marketplace listing declared the category "Website Themes", which is not in the Marketplace's taxonomy, so the whole listing failed validation and the theme showed only its bare NuGet metadata. It is now "Themes & Starter Kits", and the listing carries its screenshots.

### 1.0.5 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.4 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.2 — 2026-08-22
- This package's README now reaches NuGet. The publish workflow discovered packages by a list of name patterns, and this one matched none of them, so it was never built or pushed by CI — the version on NuGet was placed there by hand before the README was wired up, and no release could refresh it. Discovery is now by prefix, so the package ships whenever the repo is tagged.


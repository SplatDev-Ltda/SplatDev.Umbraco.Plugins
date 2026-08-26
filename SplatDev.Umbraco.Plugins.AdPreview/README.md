# AdPreview

AdPreview is an Umbraco property editor for building a small image advertisement and seeing its final presentation while editing content. It preserves the original `AdPreview` property-editor alias and JSON fields (`img`, `title`, `description`, `url`, `tooltip`, `referrer`, `css`, `overlay`) used by the v7/v8 package.

## Install

Install `SplatDev.Umbraco.Plugins.AdPreview` into an Umbraco 17 site. The package also carries the Umbraco 13 target for existing installations.

Create a property using the **Ad Preview** property editor schema. Edit the ad inline, save it, and publish the content as usual. The editor currently accepts an image URL; a future iteration can add the native media picker without changing the stored contract.

## Value

The persisted value is JSON with the stable original field names. `overlay` controls whether title and description are rendered over the image. Preview links open in a new tab when `url` is provided.

## Changelog

### 1.0.1 — 2026-08-26

The package icon was a 795x447 banner, so the Umbraco Marketplace - which renders icons at 64x64 - letterboxed it against every other card. It is now a 128x128 icon in the same house style as the rest of the SplatDev packages.

Fixes a duplicate registration on sites that still have a physical App_Plugins folder for this plugin, left behind by an older release that copied content into the site. Umbraco registered those extensions twice - once from its own scan of the folder, once from this package's embedded manifest - and logged "Extension with alias ... is already registered". The embedded manifest now yields to the physical copy.

## License

MIT

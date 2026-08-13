# AdPreview

AdPreview is an Umbraco property editor for building a small image advertisement and seeing its final presentation while editing content. It preserves the original `AdPreview` property-editor alias and JSON fields (`img`, `title`, `description`, `url`, `tooltip`, `referrer`, `css`, `overlay`) used by the v7/v8 package.

## Install

Install `SplatDev.Umbraco.Plugins.AdPreview` into an Umbraco 17 site. The package also carries the Umbraco 13 target for existing installations.

Create a property using the **Ad Preview** property editor schema. Edit the ad inline, save it, and publish the content as usual. The editor currently accepts an image URL; a future iteration can add the native media picker without changing the stored contract.

## Value

The persisted value is JSON with the stable original field names. `overlay` controls whether title and description are rendered over the image. Preview links open in a new tab when `url` is provided.

## License

MIT

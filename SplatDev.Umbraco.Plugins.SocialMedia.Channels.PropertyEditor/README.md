# SocialMedia.Channels Property Editor

<!-- screenshot:start -->

![SocialMedia.Channels.PropertyEditor property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.SocialMedia.Channels.PropertyEditor/docs/screenshots/02-property-editor.png)

![SocialMedia.Channels.PropertyEditor data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.SocialMedia.Channels.PropertyEditor/docs/screenshots/03-data-type.png)

<!-- screenshot:end -->

A distinct Umbraco 17 property editor for configuring social profile links and presentation. Editors choose a theme, set the background treatment, toggle labels, and enter channel URLs on a document property. It is the Umbraco 17 port of the original v7/v8 `SocialMediaChannels` editor; it is **not** the separate publishing dashboard package.

The persisted value remains JSON-compatible with the legacy editor (`Name`, `Theme`, `Thumbnail`, `Folder`, `Bg`), so values can be saved and reopened without losing configured channels.

## Umbraco configuration

After installation, create a property using the **Social Media Channels** editor schema. It is grouped under **Rich Content** and hides the property label. Use alias `SocialMediaChannels` when importing an existing document type definition.

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.SocialMedia.Channels.PropertyEditor
```

The package embeds and serves its `App_Plugins/SocialMediaChannels` manifest and Lit web component. No connection string, API key, OAuth account, or server-side configuration is required.

## Supported versions

| Umbraco | .NET |
|---------|------|
| 17.x | 10.x |

## Scope and limitations

This package configures presentation data only. It does not connect accounts, publish posts, schedule content, or replace `SplatDev.Umbraco.Plugins.SocialMedia.Channels` (the separate dashboard product).

## Changelog

### 1.1.2 — 2026-08-23

Corrects the note below. The 1.1.1 entry said NuGet never published 1.1.0. It did — it
took a little over an hour to clear validation, and a 404 while a package is still being
validated looks exactly like a 404 for one that was rejected. Halving the package was
worth doing on its own; the reason given for it was wrong.

### 1.1.1 — 2026-08-23

Halves the package. The icon themes were both embedded in the assembly and packed as
loose content, so every image shipped twice and the package reached 13 MB — big enough
that NuGet took over an hour to validate it, against seconds for the others. The themes
are still embedded and still served at runtime; only the loose-file copy loses them.

Also drops 67 files that came along with the downloaded icon sets — `info.txt`, author
`.xml` files, and a `Web.config` per theme folder. A `Web.config` under `App_Plugins` is
not inert on IIS: it applies to that folder.

### 1.1.0 — 2026-08-23

The property editor can now be used. It declared a property editor schema that had no
server-side editor behind it, and its UI pointed at a third alias that matched neither —
so Umbraco refused to create a data type for it with "The targeted property editor was
not found", and the editor had never been usable on any install. It now stores its value
with Umbraco's own text schema, and the dead schema declaration is gone.

## License

MIT © [SplatDev](https://github.com/splatdevtech)

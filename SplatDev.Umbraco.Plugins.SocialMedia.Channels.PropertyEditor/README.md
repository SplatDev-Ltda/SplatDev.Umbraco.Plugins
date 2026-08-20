# SocialMedia.Channels Property Editor

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

## License

MIT © [SplatDev](https://github.com/splatdevtech)

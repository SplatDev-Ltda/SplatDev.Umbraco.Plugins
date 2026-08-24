# NuGet housekeeping that cannot be automated

Two jobs on nuget.org have no API and no CLI. They are recorded here so they are not lost
between releases.

## 1. Deprecate the superseded ids

Unlisting and deprecation are different mechanisms and only one of them reaches people who
have already installed a package.

| | Unlisting | Deprecation |
| --- | --- | --- |
| Hidden from search | yes | no |
| Existing consumers warned | **no — nothing at all** | yes, banner and a restore warning |
| Names the replacement | no | yes |

Seven of these are already unlisted, so nobody new can find them. Anyone who already has
one in a `.csproj` sees no change whatsoever and will keep restoring it indefinitely.
Deprecation is what tells them, and what points them at the right package.

**Where:** `https://www.nuget.org/packages/<id>` → *Manage package* → *Deprecation*.
Select all versions, reason **Other**, and set the alternate package.

| Deprecate this id | Alternate package | Message |
| --- | --- | --- |
| `SplatDev.Umbraco.Plugins.SocialMediaChannels` | `SplatDev.Umbraco.Plugins.SocialMedia.Channels` | Replaced by a package under the current naming convention. |
| `SplatDev.Umbraco.Plugins.SimpleAnalytics` | `SplatDev.Umbraco.Plugins.Analytics` | Replaced. Analytics 3.0.0 restores this plugin's self-hosted visitor tracking. |
| `SplatDev.Umbraco.Plugin.Backups13` | `SplatDev.Umbraco.Plugins.Backups` | Replaced by a package under the current naming convention. |
| `SplatDevUmbracoPluginBackup` | `SplatDev.Umbraco.Plugins.Backups` | See section 2 — this one needs ownership first. |
| `SplatDev.Umbraco.Plugins.CharLimitRestrict` | `SplatDev.Umbraco.Plugins.CharLimit` | Replaced. CharLimit 1.5.0 restores this plugin's counter, prevalue and translations. |
| `SplatDev.Umbraco.Plugins.OnOffButton` | `SplatDev.Umbraco.Plugins.OnOff` | Replaced by a package under the current naming convention. |
| `SplatDev.Umbraco.Plugins.RestrictPage` | `SplatDev.Umbraco.Plugins.Restricted` | Replaced by a package under the current naming convention. |
| `SplatDev.Umbraco.Plugins.YouTubePreview` | `SplatDev.Umbraco.Plugins.VideoPreview` | Replaced by a package under the current naming convention. |

Two ids are deliberately **not** deprecated: `…Plugins.AdPreview`, which now has a project
again and will publish under its own id, and `…Plugins.HideContent`, whose replacement
`…Plugins.HiddenContent` is listed but which has no equivalent worth pointing someone at
mid-upgrade.

## 2. `SplatDevUmbracoPluginBackup` — ownership

This is the only genuinely harmful id left. It is **still listed at 9.5.4**, which sorts
above the `3.3.3` that replaced it, so it wins the search outright. That is the same shape
that once made a published security fix unreachable: `Backups` served 8.18.7.2 over the
3.3.0 that added authorization to its anonymous `Restore` and `Delete` endpoints.

It cannot be unlisted from CI. A NuGet api key is scoped to a single **package owner**, and
this package belongs to a different account:

```
SplatDevUmbracoPluginBackup       owners=['Shuchita']
SplatDev.Umbraco.Plugins.Backups  owners=['SplatDev']
```

No key issued under `SplatDev` can touch it, whatever its glob or scopes. Widening the key
achieves nothing — that was the recorded explanation for a long time and it was wrong.

With no contact for that account, the route is NuGet support. Draft below.

### Draft — to support@nuget.org

> **Subject:** Ownership request for an abandoned package: SplatDevUmbracoPluginBackup
>
> Hello,
>
> I maintain `SplatDev.Umbraco.Plugins.Backups`, currently 3.3.3, published under the
> `SplatDev` account.
>
> An older package, `SplatDevUmbracoPluginBackup`, is owned by the account `Shuchita` and
> was last published at version 9.5.4. It is an earlier release of the same plugin, from
> before it was renamed to follow our current naming convention. We have no means of
> contacting that account.
>
> The version number is the problem. 9.5.4 sorts above the 3.3.3 that superseded it, so
> NuGet resolves the abandoned package as the newer one and a search shows it first. Anyone
> installing it gets a build for a long-unsupported Umbraco version, and misses fixes we
> have published since — including one that added authorization to endpoints that were
> previously anonymous.
>
> Could you either transfer ownership of `SplatDevUmbracoPluginBackup` to the `SplatDev`
> account, or unlist and deprecate version 9.5.4 with
> `SplatDev.Umbraco.Plugins.Backups` as the alternate package? Ownership would let us mark
> it up properly ourselves.
>
> Happy to provide anything that helps establish the connection between the two packages.
>
> Thank you,
> Carlos Casalicchio — SplatDev Ltda

Verify ownership before assuming a key is at fault:

```bash
curl -s "https://azuresearch-usnc.nuget.org/query?q=packageid:<id>" | jq '.data[0].owners'
```

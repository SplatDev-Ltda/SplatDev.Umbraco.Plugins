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
| `SplatDev.Umbraco.Plugins.CharLimitRestrict` | `SplatDev.Umbraco.Plugins.CharLimit` | Replaced. CharLimit 1.5.1 restores this plugin's counter, prevalue and translations. |
| `SplatDev.Umbraco.Plugins.OnOffButton` | `SplatDev.Umbraco.Plugins.OnOff` | Replaced by a package under the current naming convention. |
| `SplatDev.Umbraco.Plugins.RestrictPage` | `SplatDev.Umbraco.Plugins.Restricted` | Replaced by a package under the current naming convention. |
| `SplatDev.Umbraco.Plugins.YouTubePreview` | `SplatDev.Umbraco.Plugins.VideoPreview` | Replaced by a package under the current naming convention. |

**Every alternate above was verified live on nuget.org on 2026-08-25**, so each one can be
entered without re-checking:

| alternate | listed version |
| --- | --- |
| `…Plugins.SocialMedia.Channels` | 2.3.1 |
| `…Plugins.Analytics` | 3.0.0 |
| `…Plugins.Backups` | 3.3.4 |
| `…Plugins.CharLimit` | 1.5.1 |
| `…Plugins.OnOff` | 2.3.2 |
| `…Plugins.Restricted` | 2.5.3 |
| `…Plugins.VideoPreview` | 2.3.2 |

Two ids are **not** on the list, for different reasons.

`…Plugins.AdPreview` is alive, not superseded — it has a project again and is listed at
1.0.0 under its own id. Nothing to deprecate.

`…Plugins.HideContent` is **not listed on nuget.org at all**, so there is nothing there to
deprecate either. This file used to imply it was still out there and only lacked a good
replacement to point at; it is simply gone. Its nearest equivalent,
`…Plugins.HiddenContent`, is listed at 2.5.3 if the question ever comes up.

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
> It is still listed and installable, with roughly 321 downloads. Anyone who finds it
> installs a build targeting a long-unsupported Umbraco version, and misses everything
> published since under the current id — including a release that added authorization to
> backup restore and delete endpoints that had previously been reachable without it.
>
> To be precise about what I am and am not claiming: the abandoned package does not
> outrank ours in search, and its higher version number has no bearing on how our package
> resolves, since the two are separate ids. The problem is narrower — it is live, it is
> installable, and anyone already depending on it has no signal that a maintained
> replacement exists.
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

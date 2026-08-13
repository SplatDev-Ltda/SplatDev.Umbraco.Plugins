# v17 Port Campaign Audit

**Audit date:** 2026-08-13  
**Scope:** 13 plugin products present in the public v7/v8 source repositories, compared with the v17 repository and the SPL-1654–SPL-1741 issue population.  
**Sources:** [Umbraco-Packages-v7](https://github.com/ccasalicchio/Umbraco-Packages-v7), [Umbraco-Packages-v8](https://github.com/ccasalicchio/Umbraco-Packages-v8).  
**Coverage:** 13/13 source products checked (100%).

## Verdict table

| Original product | v7/v8 concept and data model | v17 counterpart | Verdict | Evidence / issue |
|---|---|---|---|---|
| AdPreview | Image-ad property editor/data type with overlay text, tooltip and click target; front-office Razor view | None | **unscoped** | No SPL-1654–1741 issue or v17 project exists. Tracked by [SPL-3534](/umbraco-plugins/issues/SPL-3534). |
| Backups | Backoffice backup/restore tool for files and database, with archive and storage operations | `SplatDev.Umbraco.Plugins.Backups` | **port** | v17 has Backups dashboard, API, backup/restore models and service. The product concept and persistence/operation model match. |
| CharLimit | Character-counting textbox/textarea property editor with a hard maximum | `SplatDev.Umbraco.Plugins.CharLimit` | **port** | v17 contains the CharLimit property editor and limit configuration; same editor concept. |
| CopyValue | Property editor/action copying one or more property values into another property | `SplatDev.Umbraco.Plugins.CopyValue` | **port** | v17 project and campaign issue exist; implementation remains a copy-values property editor rather than a similarly named unrelated feature. |
| CustomLogin | Custom member login page/package, including front-end login assets | `SplatDev.Umbraco.Plugins.CustomLogin` | **port** | v17 CustomLogin project and SPL-1659 cover the same login-page product. |
| DefaultValue | Read-only/default property editor supplying a schema/content default value | `SplatDev.Umbraco.Plugins.DefaultValue` | **port** | v17 project and SPL-1703 cover the same default-value editor behavior. |
| HideContent | Backoffice/content-tree visibility control for hiding content | `SplatDev.Umbraco.Plugins.HiddenContent` | **port** | v17 HiddenContent project provides the corresponding hidden-content backoffice/editor and service behavior; this was independently spot-checked as genuine. |
| OnOffButton | Boolean on/off property editor | `SplatDev.Umbraco.Plugins.OnOff` | **port** | v17 OnOff project and SPL-1707 cover the same boolean editor concept. |
| RestrictPage | Visual restricted-page/property representation used for member navigation | `SplatDev.Umbraco.Plugins.Restricted` | **port** | v17 Restricted project and SPL-1663 cover restricted content; naming changed but the product concept matches. |
| SimpleAnalytics | Self-hosted visitor tracker with visit model, repository, filters/stats, API and analytics dashboard | `SplatDev.Umbraco.Plugins.Analytics` | **collision** | v17 Analytics is a GA4 measurement-id injector/settings UI, not the self-hosted tracker model. Remediation is split into [SPL-3532](/umbraco-plugins/issues/SPL-3532) (rename GA4 package) and [SPL-3533](/umbraco-plugins/issues/SPL-3533) (port SimpleAnalytics). |
| SocialMediaChannels | Property editor/data type configuring social-channel icons/themes | `SplatDev.Umbraco.Plugins.SocialMedia.Channels` | **collision** | v17 project is a social publishing/scheduling dashboard with `SocialChannel`, `ScheduledPost`, database context and API; it is not the original property editor. Existing campaign issue SPL-1718 is therefore a false-done. |
| YouTubePreview | YouTube-ID property editor with an embedded video preview | `SplatDev.Umbraco.Plugins.VideoPreview` | **port** | v17 VideoPreview has the corresponding preview dashboard/API and `VideoInfo` model. The name is broader, but the shipped product is the same preview workflow. |
| ConfigurationActions (v7 tools) | v7-only developer/configuration helper under `Umbraco.Tools.ConfigurationActions`; not a plugin package in the v8 plugin set | None | **missing / out of plugin scope** | No v17 plugin counterpart. This is a v7 tool rather than one of the 12 plugin products in the v8 source set, so it is recorded for completeness but not treated as an additional campaign plugin issue. |

## Summary

- **13/13** source entries examined.
- **8 port** verdicts.
- **2 collision** verdicts: Analytics/SimpleAnalytics and SocialMediaChannels.
- **1 unscoped** verdict: AdPreview.
- **1 v7-only tool entry** recorded as missing/out of plugin scope: ConfigurationActions.
- The non-port findings already have distinct issue coverage: [SPL-3532](/umbraco-plugins/issues/SPL-3532), [SPL-3533](/umbraco-plugins/issues/SPL-3533), and [SPL-3534](/umbraco-plugins/issues/SPL-3534). No duplicate issues were created.

The audit compares shipped product shape (editor versus dashboard versus service) and data models, not package names or README claims. Campaign issue presence was checked against the full company issue search for SPL-1654–SPL-1741.

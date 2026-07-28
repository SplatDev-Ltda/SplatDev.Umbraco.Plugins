# UmbracoCms.Themes.Forum

Forum/community theme for Umbraco — thread list, post view, user profiles, categories.

## Package Info

| Property | Value |
|---|---|
| Package ID | `UmbracoCms.Themes.Forum` |
| Version | `1.0.0` |
| Targets | `net8.0` (Umbraco 13.12.0), `net10.0` (Umbraco 17.3.4) |
| Depends on | `UmbracoCms.Themes.Base 1.0.0`, `SplatDev.Umbraco.Plugins.Yaml2Schema 1.0.35` |

## Features

- **Forum Root** — top-level home with category grid, announcements panel, recent activity sidebar, search bar
- **Forum Category / Subcategory** — thread list with pinned threads first, per-thread metadata, New Thread CTA
- **Forum Thread** — original post with author avatar sidebar, reply list, reply form, thread tools (subscribe, bookmark, report), attachment gallery
- **Forum User Profile** — avatar, member badge, bio, social links, stats (posts, reputation)
- **Announcements** — pinned, priority-sorted announcements
- **Member Badges** — New Member / Member / Regular / Trusted / Moderator / Admin with distinct accent colors
- **Post Statuses** — Open / Closed / Pinned / Archived
- **Responsive** — thread list collapses gracefully on mobile; post author sidebar stacks on small screens

## Document Types

| Alias | Description |
|---|---|
| `forumRoot` | Site root with forum settings, rules, contact |
| `forumCategory` | Discussion category with icon, color, moderators |
| `forumSubcategory` | Sub-group inside a category |
| `forumThread` | Individual discussion thread |
| `forumPage` | Static page (FAQ, About, etc.) |
| `forumAnnouncements` | Container for announcements |
| `forumAnnouncement` | Single announcement with priority and expiry |
| `forumUserProfile` | Public member profile |
| `forumRuleElement` | Element type for forum rules list |
| `moderatorElement` | Element type for moderator assignments |

## Schema Import

The composer `ForumThemeComposer` automatically:

1. Extracts the embedded `Config/umbraco.yml` to `{ContentRoot}/config/themes/forum/umbraco.yml` on first boot.
2. Runs the Yaml2Schema import (data types, document types, templates).
3. Creates a `.import.done` marker file to skip on subsequent boots.

## Templates

| Alias | View File |
|---|---|
| `ForumRoot` | `Views/ForumRoot.cshtml` |
| `ForumCategory` | `Views/ForumCategory.cshtml` |
| `ForumThread` | `Views/ForumThread.cshtml` |
| `ForumPage` | `Views/ForumPage.cshtml` |
| `ForumUserProfile` | `Views/ForumUserProfile.cshtml` |
| `ForumAnnouncements` | `Views/ForumAnnouncements.cshtml` |

## Stylesheet

`wwwroot/css/forum-theme.css` — serves from `/css/forum-theme.css`.  
Customise via CSS custom properties in `:root`:

```css
:root {
  --color-primary:   #4a90d9;
  --color-secondary: #6c757d;
  --font-heading:    "Segoe UI", system-ui, sans-serif;
  --font-body:       "Segoe UI", system-ui, sans-serif;
  --spacing-unit:    8px;
}
```

# UmbracoCms.Themes.Corporate

Professional corporate theme for Umbraco. Provides home, about, services, team, and contact pages designed for business/company websites.

## Supported Umbraco Versions

| Package version | Umbraco | .NET |
|---|---|---|
| 1.0.x | 13.x | net8.0 |
| 1.0.x | 17.x | net10.0 |

## Features

- Auto-installs Umbraco content schema via embedded YAML on first startup
- Document types: `basePage`, `corporateRoot`, `homePage`, `aboutPage`, `servicesPage`, `teamPage`, `contactPage`, `standardPage`
- Element types: `serviceFeature`, `testimonialItem`, `teamMemberElement`, `statsItem`, `timelineItem`, `serviceItemElement`
- Full-width hero section with overlay, dual CTA buttons, background image
- Stats counter row with animation on scroll
- Testimonials carousel (accessible, keyboard-navigable)
- Team member cards with hover bio overlay
- Timeline component for company history
- Contact page with form validation + social links
- Services grid with category filter
- Shared `_CorporateFooter.cshtml` partial
- Mobile-first responsive CSS (CSS custom properties, flexbox/grid)

## Installation

```
dotnet add package UmbracoCms.Themes.Corporate
```

The composer runs automatically on `UmbracoApplicationStartedNotification`. A `.done` marker file is written to `config/themes/corporate/` after successful install to prevent re-runs.

## Document Type Hierarchy

```
corporateRoot (allowAsRoot)
  ├── homePage
  ├── aboutPage
  ├── servicesPage
  ├── teamPage
  ├── contactPage
  └── standardPage (nestable)

All pages extend from `basePage` which provides shared properties.
```

## Views

| View | Template alias | Purpose |
|---|---|---|
| `Home.cshtml` | Home | Full home page with all sections |
| `About.cshtml` | About | Mission/vision, timeline, leadership preview |
| `Services.cshtml` | Services | Services grid with category filter |
| `Team.cshtml` | Team | Team grid with hover bio cards |
| `Contact.cshtml` | Contact | Contact info + form + optional map embed |
| `StandardPage.cshtml` | StandardPage | Generic rich-text content page |
| `_CorporateFooter.cshtml` | (partial) | Shared footer with nav + social + contact |

## CSS

`wwwroot/css/corporate-theme.css` — include in your layout:

```html
<link rel="stylesheet" href="/css/corporate-theme.css" />
```

## Dependencies

- `SplatDev.Umbraco.Plugins.Yaml2Schema` >= 1.0.35
- `UmbracoCms.Themes.Base` >= 1.0.0
- `Umbraco.Cms.Core` / `Umbraco.Cms.Web.Common`

## Customisation

Override CSS custom properties in your own stylesheet:

```css
:root {
  --color-primary: #1a3a5c;   /* Deep navy (default) */
  --color-accent:  #e87722;   /* Orange accent (default) */
}
```

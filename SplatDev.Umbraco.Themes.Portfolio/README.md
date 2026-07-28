# UmbracoCms.Themes.Portfolio

Portfolio theme for Umbraco — project grid, project detail, filtering, lightbox, about page.

## Package Info

| Property | Value |
|---|---|
| Package ID | `UmbracoCms.Themes.Portfolio` |
| Version | `1.0.0` |
| Targets | `net8.0` (Umbraco 13.12.0), `net10.0` (Umbraco 17.3.4) |
| Depends on | `UmbracoCms.Themes.Base 1.0.0`, `SplatDev.Umbraco.Plugins.Yaml2Schema 1.0.35` |

## Features

- **Portfolio Home** — minimal hero (Minimal / Bold / Creative styles), about preview, featured projects grid, services overview, testimonials, contact teaser
- **Projects Listing** — filterable project grid by category (isotope-ready CSS classes + built-in JS fallback), hover overlay
- **Project Detail** — full-width hero image, project metadata card, challenge/solution narrative, gallery with lightbox, technology tags, prev/next navigation
- **About Page** — bio with photo, skill progress bars, vertical experience timeline, education cards, awards list
- **Services Page** — service cards with icon, description, price
- **Contact Page** — contact form placeholder
- **Dark / Light mode** — toggle via CSS custom properties, persisted to localStorage

## Document Types

| Alias | Description |
|---|---|
| `basePage` | Shared base page with common properties |
| `portfolioRoot` | Root node: owner profile, branding, social links |
| `portfolioHome` | Homepage with hero, previews, testimonials |
| `projectsListing` | Filterable projects listing (parent of `project`) |
| `project` | Individual project with gallery, tech, client info |
| `aboutPage` | About page with skills, experience timeline, education, awards |
| `servicesPage` | Services listing |
| `contactPage` | Contact form page |

## Element Types

`skillElement`, `technologyElement`, `testimonialElement`, `serviceItem`, `processStep`, `awardElement`, `experienceElement`, `educationElement`, `projectMediaElement`

## Schema Import

The composer `PortfolioThemeComposer` automatically:

1. Extracts the embedded `Config/umbraco.yml` to `{ContentRoot}/config/themes/portfolio/umbraco.yml` on first boot.
2. Runs the Yaml2Schema import (data types, document types, templates).
3. Creates a `.import.done` marker file to skip on subsequent boots.

## Templates

| Alias | View File |
|---|---|---|
| `PortfolioHome` | `Views/PortfolioHome.cshtml` |
| `ProjectsListing` | `Views/ProjectsListing.cshtml` |
| `Project` | `Views/Project.cshtml` |
| `About` | `Views/About.cshtml` |

## Stylesheet

`wwwroot/css/portfolio-theme.css` — serves from `/css/portfolio-theme.css`.  
Customise the accent color and other tokens in `:root`:

```css
:root {
  --color-accent:   #6c63ff;   /* override via portfolioRoot.accentColor */
  --font-heading:   "Inter", system-ui, sans-serif;
  --font-body:      "Inter", system-ui, sans-serif;
  --spacing-unit:   8px;
  --radius-lg:      16px;
}
```

The `portfolioRoot` document type has an `accentColor` property that gets injected as an inline `<style>` on every page to override `--color-accent` per-installation.

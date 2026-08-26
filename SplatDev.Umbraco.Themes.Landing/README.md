# UmbracoCms.Themes.Landing

<!-- screenshot:start -->
<!-- screenshot:end -->

Landing page theme for Umbraco CMS. Provides a complete single-page landing experience: hero section with video background support, features grid, social proof (trust logos, testimonials, animated counters), pricing cards, CSS-only FAQ accordion, and a CTA banner.

## Requirements

- Umbraco CMS 13.x (net8.0) or 17.x (net10.0)
- UmbracoCms.Themes.Base 1.0.0
- SplatDev.Umbraco.Plugins.Yaml2Schema 1.0.35

## Installation

Install via NuGet:

```
dotnet add package UmbracoCms.Themes.Landing
```

The `LandingThemeComposer` runs automatically on first application start. It:

1. Extracts the embedded `Config/umbraco.yml` to `{ContentRoot}/config/themes/landing/umbraco.yml`
2. Creates all required data types, document types, and templates
3. Writes a `.done` file so the install step is skipped on subsequent starts

## Document Types

| Alias             | Description                                                    |
|-------------------|----------------------------------------------------------------|
| `landingPage`     | Full landing page (allowAsRoot). All sections in one document. |
| `pricingPlan`     | Element type for individual pricing plans (blockList item).    |
| `featureItem`     | Element type for feature highlight cards.                      |
| `testimonialItem` | Element type for testimonial/customer quotes.                  |
| `pricingFeature`  | Element type for per-plan feature checklists.                  |
| `faqItem`         | Element type for FAQ accordion items.                          |
| `counterItem`     | Element type for animated stat counters.                       |

### landingPage Tabs

| Tab          | Key Properties                                             |
|--------------|------------------------------------------------------------|
| Hero         | headline, subheadline, background image/video, dual CTAs   |
| Features     | headline, subtext, blockList of featureItem elements       |
| Social Proof | trust logos, testimonials, animated counters               |
| Pricing      | toggle, blockList of pricingPlan elements                  |
| FAQ          | blockList of faqItem elements                              |
| CTA Banner   | headline, text, button, background image                   |
| Meta         | metaTitle, metaDescription, canonical                      |

## Templates

| Template    | View File                  |
|-------------|----------------------------|
| LandingPage | Views/LandingPage.cshtml   |

The template renders a complete, self-contained HTML document (Layout = null) including `<head>`, structured data, and inline JavaScript for counter animations and FAQ keyboard support.

## CSS

Include `wwwroot/css/landing-theme.css`. Override CSS custom properties:

```css
:root {
  --lp-color-primary: #2563eb;
  --lp-color-accent: #f59e0b;
  --lp-section-py: 5rem;
  --lp-container: 1200px;
}
```

## FAQ Accordion

The FAQ uses a CSS-only toggle pattern (hidden `<input type="checkbox">`) with no JavaScript dependency. The `faq-item__toggle` checkbox drives the `max-height` transition on `faq-item__answer`.

## Counter Animation

Elements with class `js-counter` and `data-target` attribute are animated with IntersectionObserver when they scroll into view. The animation degrades gracefully when JS is unavailable.

## Changelog

### 1.0.6 — 2026-08-26

The Marketplace listing declared the category "Website Themes", which is not in the Marketplace's taxonomy, so the whole listing failed validation and the theme showed only its bare NuGet metadata. It is now "Themes & Starter Kits", and the listing carries its screenshots.

### 1.0.5 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.4 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.2 — 2026-08-22
- This package's README now reaches NuGet. The publish workflow discovered packages by a list of name patterns, and this one matched none of them, so it was never built or pushed by CI — the version on NuGet was placed there by hand before the README was wired up, and no release could refresh it. Discovery is now by prefix, so the package ships whenever the repo is tagged.


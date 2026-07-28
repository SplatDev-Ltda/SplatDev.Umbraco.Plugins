# UmbracoCms.Themes.Landing

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

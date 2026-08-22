# UmbracoCms.Themes.Base

**Version:** 1.0.0
**Author:** SplatDev
**License:** MIT

Foundation theme package for Umbraco 13 / Umbraco 17. Provides reusable document types, data types, templates, Razor views, and a CSS design system. All other UmbracoCms themes build on top of this package.

---

## Features

- Base document types: `basePage`, `siteRoot`, `homePage`, `standardPage`
- Element types for navigation and footer columns
- Common data types: text, rich text, image picker, toggle, URL picker, color picker, block lists
- Three Razor templates: `Home`, `StandardPage`, `NotFoundPage`
- Responsive navigation with accessible hamburger menu
- Mobile-first CSS design system with CSS custom properties
- WCAG 2.1 AA accessible focus styles
- 12-column CSS Grid layout system
- Automatic YAML schema installation via `SplatDev.Umbraco.Plugins.Yaml2Schema`

---

## Requirements

| Umbraco Version | .NET Target | Package Version |
|-----------------|-------------|-----------------|
| 13.x            | net8.0      | 13.12.0+        |
| 17.x            | net10.0     | 17.3.4+         |

**NuGet dependency:** `SplatDev.Umbraco.Plugins.Yaml2Schema` 1.0.35+

---

## Installation

### 1. Install via NuGet

```bash
dotnet add package UmbracoCms.Themes.Base
```

Or via Package Manager Console:

```powershell
Install-Package UmbracoCms.Themes.Base
```

### 2. Register in your Umbraco application

The package self-registers via `IComposer` — no manual registration is required. When Umbraco starts at `RuntimeLevel.Run` for the first time, `BaseThemeComposer` will:

1. Extract the embedded `Config/umbraco.yml` to `{ContentRoot}/config/themes/base/umbraco.yml`
2. Install data types, document types, and templates into Umbraco
3. Rename the file to `umbraco.yml.done` to prevent re-installation on subsequent starts

### 3. Static assets

Add the CSS link to your `_Layout.cshtml`, or let the included `Views/Shared/_Layout.cshtml` handle it automatically:

```html
<link rel="stylesheet" href="/css/themes/base/base-theme.min.css" />
```

> **Note:** Build the minified CSS from `wwwroot/css/base-theme.css` using your preferred bundler (e.g. Vite, webpack, or a gulp/rollup task). The package ships the un-minified source; reference it directly in development or produce the `.min.css` in CI.

---

## YAML Schema Overview

The schema is defined in `Config/umbraco.yml` and installed automatically on first boot.

### Data Types

| Alias               | Editor                     | Notes                        |
|---------------------|----------------------------|------------------------------|
| `textString`        | `Umbraco.TextBox`          | max 512 chars                |
| `textStringShort`   | `Umbraco.TextBox`          | max 160 chars (SEO fields)   |
| `textArea`          | `Umbraco.TextArea`         | max 2000 chars               |
| `richTextEditor`    | `Umbraco.RichText`         | Full toolbar                 |
| `imagePicker`       | `Umbraco.MediaPicker3`     | Single image                 |
| `multiImagePicker`  | `Umbraco.MediaPicker3`     | Multiple images              |
| `toggle`            | `Umbraco.TrueFalse`        | Boolean                      |
| `urlPicker`         | `Umbraco.MultiUrlPicker`   | Single URL                   |
| `multiUrlPicker`    | `Umbraco.MultiUrlPicker`   | Up to 10 URLs                |
| `colorPicker`       | `Umbraco.ColorPicker`      | Preset palette               |
| `navItemBlockList`  | `Umbraco.BlockList`        | Uses `navItemElement`        |
| `footerColumnBlockList` | `Umbraco.BlockList`    | Uses `footerColumnElement`   |

### Document Types

| Alias                  | Type        | Description                                  |
|------------------------|-------------|----------------------------------------------|
| `navItemElement`       | Element     | Navigation link (label, url, openInNewTab)   |
| `footerColumnElement`  | Element     | Footer column (heading, links)               |
| `basePage`             | Base        | Shared properties for all pages              |
| `siteRoot`             | Root page   | Global site settings, social links, nav CTA  |
| `homePage`             | Page        | Home with hero, intro, CTA; extends basePage |
| `standardPage`         | Page        | Body + sidebar layout; extends basePage      |

### Templates

| Alias          | File                            |
|----------------|---------------------------------|
| `home`         | `Views/Home.cshtml`             |
| `standardPage` | `Views/StandardPage.cshtml`     |
| `notFoundPage` | `Views/NotFoundPage.cshtml`     |

---

## Razor Views

```
Views/
  _ViewImports.cshtml          Global using directives
  Home.cshtml                  Home page template
  StandardPage.cshtml          Standard page with optional sidebar
  NotFoundPage.cshtml          404 error page
  Shared/
    _Layout.cshtml             HTML5 base layout
    _Navigation.cshtml         Header navigation partial
    _Footer.cshtml             Footer with social links and copyright
```

The layout renders these named sections:

| Section    | Required | Description                          |
|------------|----------|--------------------------------------|
| `head`     | No       | Extra `<head>` content (meta, CSS)   |
| `header`   | No       | Site header / navigation             |
| `footer`   | No       | Site footer                          |
| `scripts`  | No       | JavaScript at end of body            |

---

## CSS Design System

The stylesheet (`wwwroot/css/base-theme.css`) is organized into:

1. **CSS Custom Properties** — Colors, typography, spacing, radii, shadows, transitions, z-index
2. **CSS Reset** — `box-sizing: border-box`, margin/padding reset
3. **Accessibility** — `.sr-only`, skip link, WCAG 2.1 AA `:focus-visible` styles, reduced-motion support
4. **Typography** — Fluid headings (h1–h6), body, blockquote, code, pre
5. **Layout** — `.container`, 12-column `.grid`, flex utilities
6. **Buttons** — Primary, secondary, outline, ghost; small and large size modifiers
7. **Navigation** — Sticky header, horizontal menu, responsive hamburger toggle
8. **Hero Section** — Full-width banner with overlay and CTA
9. **Page Banner** — Section header with breadcrumb for inner pages
10. **Page Content** — Single-column and two-column with sidebar layouts
11. **Rich Text** — Styled content within `.rich-text` wrapper
12. **CTA Section** — Promotional banner block
13. **Footer** — Dark footer with social icons and legal links
14. **404 Page** — Centered not-found layout
15. **Utilities** — Text, display, spacing, color helpers
16. **Print Styles** — Clean print layout

### Breakpoints

| Name    | Min-width | Description      |
|---------|-----------|------------------|
| Mobile  | < 768px   | Base (default)   |
| Tablet  | 768px     | Two columns      |
| Desktop | 1024px    | Full layout      |
| Wide    | 1280px    | Container cap    |

### CSS Custom Property Overrides

Child themes can override any design token by redefining the custom property on `:root` after importing this stylesheet:

```css
:root {
  --color-primary:  #2563eb;
  --color-accent:   #f59e0b;
  --font-family-sans: 'Poppins', sans-serif;
}
```

---

## Extending This Theme

Other UmbracoCms themes depend on this package and override or extend:

- Document types (add compositions or new document types)
- Templates (replace or add new `.cshtml` views)
- CSS (override custom properties or add new components)
- YAML schema (add new data types, document types, or templates)

---

## Changelog

### 1.0.3 — 2026-08-22
- This package's README now reaches NuGet. The publish workflow discovered packages by a list of name patterns, and this one matched none of them, so it was never built or pushed by CI — the version on NuGet was placed there by hand before the README was wired up, and no release could refresh it. Discovery is now by prefix, so the package ships whenever the repo is tagged.

## License

MIT — Copyright © 2026 SplatDev

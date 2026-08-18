---
name: svg-icon-generator
description: SVG icon creation, optimization, and integration expert. Use this skill whenever the user wants to create custom SVG icons, asks how to draw or write an SVG shape, needs to make an icon theme-able (currentColor, CSS variables), optimize an SVG file (remove bloat, SVGO), embed icons in React/Vue/HTML, build an icon sprite system, make icons accessible (aria-label, role, title), or decide between generating a custom SVG vs using an icon library like Lucide, Heroicons, or Phosphor. Also triggers for "make this icon scalable", "icon not crisp on retina", "SVG viewBox explained", or any question about SVG paths, fills, strokes, or transforms.
---

# SVG Icon Generation and Optimization

## Decision: Custom SVG vs Icon Library

Default to a library first — it saves time and ensures consistency. Build a custom SVG when:
- The icon is brand-specific or doesn't exist in standard sets
- You need pixel-perfect control over the shape
- The icon has unique animation or interactive requirements

**Recommended libraries** (all MIT, tree-shakeable):
- [Lucide](https://lucide.dev) — clean, consistent stroke icons (React, Vue, Svelte, vanilla)
- [Heroicons](https://heroicons.com) — two weights (outline/solid), Tailwind-aligned
- [Phosphor](https://phosphoricons.com) — 6 weights, very broad coverage
- [Tabler Icons](https://tabler.io/icons) — 5000+ stroke icons

When none of those have what you need, write it custom.

---

## Anatomy of a Well-Formed SVG Icon

```svg
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="24"
  height="24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-label="Settings"
  role="img"
>
  <title>Settings</title>
  <!-- paths here -->
</svg>
```

**Key attributes explained:**

| Attribute | Rule |
|-----------|------|
| `viewBox="0 0 24 24"` | Always set. Defines the coordinate space. 24×24 is the de facto standard for UI icons. |
| `width` / `height` | Set on the element but override with CSS. Prevents the icon from rendering at full DOM size if CSS hasn't loaded. |
| `fill="none"` | For stroke-style icons. Set `fill="currentColor"` for filled icons. |
| `stroke="currentColor"` | Inherits the CSS `color` property — makes the icon theme-able for free. |
| `aria-label` + `role="img"` | Required for standalone icons. If the icon is decorative (next to text that already describes it), use `aria-hidden="true"` instead. |
| `<title>` | Screen reader fallback — always include for non-decorative icons. |

---

## Making Icons Theme-able

Use `currentColor` so icons inherit the text color of their context:

```svg
<!-- Stroke icon -->
<svg fill="none" stroke="currentColor">...</svg>

<!-- Filled icon -->
<svg fill="currentColor" stroke="none">...</svg>
```

With CSS:
```css
.icon { color: var(--icon-color, #374151); }
.icon-danger { color: #ef4444; }
```

The icon picks up any CSS `color` value without SVG-level changes.

---

## Writing Common Icon Shapes

### Circle + Cross (Close/X)

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <circle cx="12" cy="12" r="10"/>
  <line x1="15" y1="9" x2="9" y2="15"/>
  <line x1="9" y1="9" x2="15" y2="15"/>
</svg>
```

### Chevron (Arrow)

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="9 18 15 12 9 6"/>
</svg>
```

### Hamburger Menu

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <line x1="3" y1="6" x2="21" y2="6"/>
  <line x1="3" y1="12" x2="21" y2="12"/>
  <line x1="3" y1="18" x2="21" y2="18"/>
</svg>
```

### Filled Circle Indicator

```svg
<svg viewBox="0 0 24 24" fill="currentColor">
  <circle cx="12" cy="12" r="6"/>
</svg>
```

---

## SVG Path Basics

For complex shapes you'll use `<path d="...">`. Key commands:

| Command | Meaning | Example |
|---------|---------|---------|
| `M x y` | Move to (start) | `M 4 4` |
| `L x y` | Line to | `L 20 4` |
| `H x` | Horizontal line | `H 20` |
| `V y` | Vertical line | `V 20` |
| `C x1 y1 x2 y2 x y` | Cubic bezier curve | |
| `A rx ry rot large sweep x y` | Arc | |
| `Z` | Close path | `Z` |

Lowercase versions (`m`, `l`, `h`, `v`, `c`, `a`) are relative to current position.

---

## Optimization

Raw SVG from design tools (Figma, Illustrator) contains unnecessary metadata. Always clean before shipping:

### Using SVGO (CLI)

```bash
npm install -g svgo
svgo icon.svg -o icon.min.svg

# Batch optimize a directory
svgo -f ./icons -o ./icons-min
```

### Manual cleanup checklist

- Remove `id`, `data-name`, `class` attributes added by the exporter
- Remove `<defs>` if empty
- Remove `xml:space`, `version`, `xmlns:xlink` if not used
- Merge adjacent paths with the same style
- Round coordinates to 2 decimal places
- Remove comments

### Target file size: under 1KB for simple UI icons. If larger, investigate why.

---

## Accessibility

```svg
<!-- Decorative icon (next to label text) — hide from screen readers -->
<svg aria-hidden="true" focusable="false">...</svg>

<!-- Standalone meaningful icon — announce it -->
<svg role="img" aria-label="Delete item">
  <title>Delete item</title>
  ...
</svg>

<!-- Icon button — label goes on the button, not the SVG -->
<button aria-label="Delete item">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

The `focusable="false"` attribute is needed for IE/Edge compatibility — SVGs are focusable by default in those browsers.

---

## React Icon Component Pattern

```tsx
interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  'aria-label'?: string;
}

export function ChevronRightIcon({ size = 24, color = 'currentColor', className, 'aria-label': label }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label={label}
      role={label ? 'img' : undefined}
      aria-hidden={!label}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
```

---

## Sprite Sheet (for large icon sets)

Inline a sprite at the top of the page body, then reference icons anywhere:

```html
<!-- Hidden sprite (in body, before first use) -->
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="icon-check" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" fill="none"/>
  </symbol>
  <symbol id="icon-close" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
  </symbol>
</svg>

<!-- Use anywhere -->
<svg width="24" height="24" aria-hidden="true">
  <use href="#icon-check"/>
</svg>
```

Sprites beat individual files when you have 20+ icons — one HTTP request, browser caches the whole set.

---

## Retina / HiDPI Sharpness

SVGs are resolution-independent by definition — they're always crisp on any display. If an icon looks blurry:
1. Check it's actually an SVG, not a rasterized PNG
2. Ensure `viewBox` is set (without it, the browser may rasterize at 1x)
3. Check the CSS `width`/`height` — if set to odd pixel values (e.g., `23px`), sub-pixel rendering can cause fuzz; use even numbers or `em` units

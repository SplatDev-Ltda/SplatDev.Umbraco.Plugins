---
name: semantic-html-accessibility
description: Use this skill when writing or reviewing HTML markup and forms, or whenever accessibility is in play — choosing semantic elements, building accessible forms, meeting WCAG, keyboard and screen-reader support, focus states, labels, or alt text. Treat accessibility as a baseline requirement, so reach for it on any markup or form work even when a11y is not explicitly requested. Do NOT trigger for purely visual styling (web-design-system or frontend-visual-polish), for CSS architecture, or for non-markup tasks.
---

# Semantic HTML & Accessibility

HTML describes **content and meaning**, never appearance. Accessibility is a **baseline requirement, not a polish step** — bake it in from the first line of markup. Semantic, accessible HTML pays off twice: in **SEO** (search engines read structure) and in **accessibility** (assistive tech reads structure). You do not get to "add a11y later" — later never comes, and retrofitting is far more expensive than doing it right.

Apply this whenever you write or review markup, build a form, or pick an element. Do not wait to be asked.

## Choose elements by meaning, not by looks

Pick the element for what the content **is**. Never pick a heading level for its font size or a `<div>` because it's "neutral" — style with classes instead.

- **Text semantics:** `<strong>`/`<em>` over `<b>`/`<i>`; `<dfn>` for the defining instance of a term.
- **Headings:** exactly **one `<h1>` per page**, then a sensible, non-skipping outline (`h2` under `h1`, `h3` under `h2`). Do not choose a level for its size — size via classes.
- **`<article>`** = any self-contained unit (blog post, comment, **card**). **`<header>`/`<footer>`** are scope-relative — an `<article>` can have its own.
- **`<div>`/`<span>`** are non-semantic hooks only. If a semantic element fits, use it instead.

Every page needs the skeleton:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Brand — Descriptive Page Title</title>
  </head>
  <body>
    <!-- content -->
  </body>
</html>
```

## Landmarks

Wrap regions in landmark elements so screen-reader users can jump between them:

- `<header>` — page (or section) intro/branding.
- `<nav>` — **primary** navigation only (`<ul><li><a>`), not every group of links.
- `<main>` — the primary content; one per page.
- `<section>` — generic thematic grouping.
- `<article>` — self-contained unit.
- `<aside>` — related but separate (sidebars, pull quotes).
- `<menu>` — a toolbar of app **action** buttons.

Nest correctly: `<li>` only inside `<ul>`/`<ol>`. Wrap every list of items in a real list element.

## Tables for data only

Never use tables for layout. For tabular data:

```html
<table>
  <thead>
    <tr><th scope="col">Plan</th><th scope="col">Price</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Pro</th><td>$9</td></tr>
  </tbody>
</table>
```

`scope` on `<th>` tells assistive tech which cells a header governs. Use `<thead>`/`<tbody>`/`<tfoot>`; `border-collapse: collapse` merges doubled borders.

## Media

- `<img>` always has `alt` and explicit `width`/`height` (the latter prevents layout shift).
- `<figure>`/`<figcaption>` for captioned media.
- `<audio>`/`<video>`: multiple `<source type>` + a fallback link; add `controls`.
- SVG for logos/icons, raster (JPEG) for photos.
- Use HTML entities where needed: `&copy;`, `&nbsp;`, `&lt;`.

See `references/semantics.md` for the full element-by-meaning guide.

## Form accessibility essentials

Every form control must be labeled, grouped, typed, and named correctly.

**Associate a label with every control.** `<label for>` matched to the control's `id` — clicking the label then focuses the field (bigger hit target, screen-reader-announced):

```html
<label for="email">Email</label>
<input type="email" id="email" name="email" required />
```

**Group related controls** in `<fieldset>` with a `<legend>` — essential for radio/checkbox sets so screen readers announce the group's purpose:

```html
<fieldset>
  <legend>Contact preference</legend>
  <label><input type="radio" name="contact" value="email" /> Email</label>
  <label><input type="radio" name="contact" value="phone" /> Phone</label>
</fieldset>
```

**Pick the correct input `type`** (`email`, `tel`, `url`, `number`, `date`…) — free validation plus the right mobile keyboard and assistive-tech behavior.

**Name and value rules:** give every submitting control a `name`; set submit button text via `value`; each option/radio/checkbox has a `value` distinct from its label. Radios sharing a `name` = one choice; checkboxes sharing a `name` = many.

**Reset inherited font** — form controls do **not** inherit typography by default:

```css
input, select, textarea, button { font: inherit; }
```

**Custom controls:** strip native rendering with `appearance: none` (keep `-webkit-appearance: none` paired) and style `:checked`/states yourself. Exclude checkboxes from generic input rules with `:not([type="checkbox"])`.

**Validation:** prefer native `:valid`/`:invalid` (auto-applied to `type="email"`, empty `required`, etc.), but per-input only. Add a JS/server class when you control *when* feedback appears. **Always validate on the server too** — client validation is UX, not security. Style `[disabled]` with `cursor: not-allowed` and muted colors.

**Hide a redundant label accessibly** — never `display:none` (removes it from the accessibility tree):

```css
.visually-hidden { position: absolute; width: 0; height: 0; overflow: hidden; }
```

See `references/forms.md` for the complete forms guide.

## Accessibility checklist

Run this on every interface. None of it is optional.

**Visible focus on everything.** Never write `outline: none` and stop — that strands keyboard users. If you remove the default outline, **replace it** with a visible cue. `outline` sits outside the box model and reserves no space, which makes it a safe focus indicator:

```css
:focus {
  outline: none; /* only when followed by a real replacement */
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1);
  border-bottom: 3px solid currentColor;
}
```

**Root font-size in `%`, media queries in `em`.** `html { font-size: 62.5%; }` and `em`-based breakpoints both respect the user's chosen font-size and zoom. A fixed `10px` root ignores the user's preference — never do it.

**Contrast** ≥ **4.5:1** for normal text, ≥ **3:1** for large text. Never light-gray-on-white. Don't rely on color alone — pair it with size, weight, or position. Check every state (hover/active/disabled/visited) and check text layered over images on the **final rendered** result.

**Semantic HTML before ARIA.** Reach for a native element first; only add ARIA when no native element does the job. Every control must be keyboard reachable.

**Icons:** prefer SVG (sprite + `<use>`) over icon fonts (screen readers try to read font glyphs as text). Always **label** icons with text or an accessible name.

**Images:** meaningful `alt` on every content image (also helps SEO and shows on broken-image/404). Decorative images get `alt=""`.

**Hide closed UI with all three properties** — each blocks a different access path (visual / mouse+keyboard focus / screen reader). Do **not** use `display:none` if you want to animate it open/closed:

```css
.menu--closed {
  opacity: 0;          /* visual */
  pointer-events: none; /* mouse + tab interaction */
  visibility: hidden;   /* screen readers + focus */
}
```

**`lang` and `title`:** keep `<html lang>` accurate and give every page a real, descriptive `<title>`.

**Reduced motion:** honor `prefers-reduced-motion` — author full motion as the default, then mute non-essential motion (a gentle fade is a fine reduced alternative; don't always kill all motion):

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none; }
  html { scroll-behavior: auto; }
}
```

Don't gate content behind hover-only effects — they don't fire on touch. Keep animations fast and purposeful.

See `references/accessibility.md` for the full accessibility guide.

## References

- `references/semantics.md` — document skeleton, choose-by-meaning elements, the one-`h1` outline, landmarks, tables, media + `<figure>`, HTML entities.
- `references/forms.md` — label/`for` association, `fieldset`/`legend`, input types, name/value, custom controls, native + server validation, `[disabled]`, `font: inherit`, accessibly hidden labels.
- `references/accessibility.md` — visible focus, `%` root + `em` queries, contrast, semantic-before-ARIA, SVG icons, alt text, the hide-closed-UI pattern, `lang`/`title`, reduced motion.

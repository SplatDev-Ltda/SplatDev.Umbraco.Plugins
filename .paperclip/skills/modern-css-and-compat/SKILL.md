---
name: modern-css-and-compat
description: Use this skill when using or evaluating modern 2024-2025 CSS features and their browser support — :has(), container or cascade layers, native nesting, clamp(), oklch(), color-mix(), @scope — or when deciding cross-browser support via Web Platform Baseline, @supports feature detection, and Autoprefixer/Browserslist. Reach for it whenever asking whether something works in Safari or older browsers, handling vendor prefixes, or chasing a cross-browser bug. Do NOT trigger for layout mechanics (responsive-layout), animation (web-animation-motion), or runtime browser/DOM APIs (frontend-performance-and-apis).
---

# Modern CSS & Cross-Browser Compatibility

Adopt modern CSS deliberately. The question is never "is this cool" — it is "what is its **Baseline** status, and what happens in the browsers that lack it." Decide support with data (Baseline, Can I Use), detect features at runtime (`@supports`), and let tooling (Autoprefixer + Browserslist) handle prefixes. Never hand-write prefixes and never sniff the user agent.

**Scope & related skills.** This skill owns *modern CSS features and cross-browser support* — selectors (`:has()`, `:is()`/`:where()`), nesting, cascade layers, `@scope`, `clamp()`, modern color, `@property`, plus Baseline / `@supports` / Autoprefixer. **Container queries live in responsive-layout** (use it for layout & responsiveness); animation features (scroll-driven, view transitions) live in **web-animation-motion**; browser/DOM APIs and performance live in **frontend-performance-and-apis**.

## The Baseline decision rule (do this first)

**Web Platform Baseline is the go/no-go signal** because it is interop-based: it tells you when a feature actually works the same across Chrome, Edge, Firefox, and Safari — not just whether one engine shipped it. Use the three tiers:

- **Widely available** — interoperable for 30+ months across all four engines. **Use freely, unconditionally.** No guard needed. (e.g. `:is()`/`:where()`, `aspect-ratio`, `clamp()`/`min()`/`max()`, logical properties, flexbox `gap`, container queries.)
- **Newly available** — interoperable across all four engines *now*, but recently. **Safe for evergreen audiences, but guard with `@supports` for older installs.** (e.g. `:has()`, native nesting, `@layer`, `oklch()`/`color-mix()`/relative color, `@property`, subgrid.)
- **Limited** — not yet in all engines. **Progressive enhancement only** — the page must work fully without it. (e.g. `@scope`, style queries, scroll-driven animations, cross-document view transitions.)

MDN shows a Baseline badge on each feature page. **Rule: feature-detect anything below "Widely available."** Above it, use directly. The Baseline notes in this skill and its references are current as of the 2024–2025 runbook — re-check MDN/caniuse for anything borderline before shipping.

**Why Baseline and not "I think Safari has it":** Baseline is interop-based — it tells you the feature works *the same* across Chrome, Edge, Firefox, and Safari, which is the only thing that matters for shipping. One engine shipping a feature tells you nothing about the other three. Gut feel and stale memory are exactly how cross-browser bugs ship; Baseline is a data-backed go/no-go.

### Worked decision flow

For any modern feature you want to use, run this:

1. **Look up its Baseline tier** (MDN badge / caniuse).
2. **Widely available?** → write it directly, no guard.
3. **Newly available?** → write it, and if you must support older installs, wrap the enhanced version in `@supports` with a working fallback as the default.
4. **Limited?** → progressive enhancement only. The page must be fully correct *without* it; the feature is a bonus layered on top.
5. **Either way, never UA-sniff** to decide — use `@supports` (CSS) or capability checks (JS).

Concrete examples: `:where()` → Widely → just use it. `:has()` → Newly → use it, optionally `@supports selector(:has(*))`. `oklch()` → Newly → use it with a fallback color first. `@scope` → Limited → enhancement only.

## Highest-value modern features (with Baseline status)

Use these where they fit. Full catalog with gotchas in `references/modern-css.md`.

**`:has()` — the relational/"parent" selector. Newly available (Baseline 2023).** Guard with `@supports selector(:has(*))` if you support old installs.
```css
.card:has(img) { /* card that contains an image */ }
form:has(input:invalid) .submit { opacity: .5; }
:root:has(.modal[open]) { overflow: hidden; }   /* lock scroll, no JS */
```

**`:is()` / `:where()`. Widely available — use freely.** `:where()` is **always zero specificity** — the right tool for easily-overridable reset/design-system defaults. `:is()` takes its most-specific argument's specificity. Both forgive invalid selectors in the list.
```css
:where(ul, ol) { margin: 0; padding: 0; }   /* trivially overridable later */
```

**`clamp()` / `min()` / `max()` — fluid type & spacing, no media queries. Widely available.**
```css
html { font-size: clamp(1rem, 0.95rem + 0.5vw, 1.25rem); }
.wrap { width: min(100%, 60ch); }
```
**WCAG caveat:** a `max`/`clamp` ceiling that prevents text scaling to 200% violates WCAG 1.4.4. Keep MAX ≥ ~2× MIN, keep bounds in `rem`/`em`, and keep the viewport term small to protect zoom.

**Modern color — `oklch()`, `color-mix()`, relative color, `light-dark()`. Newly available.** Mix in `oklch`/`oklab` to avoid muddy midpoints; `oklch` is perceptually uniform so equal lightness steps look equal.
```css
:root { --brand: oklch(0.55 0.15 250); color-scheme: light dark; }
.btn:hover { background: color-mix(in oklch, var(--brand) 80%, white); }
.surface { background: light-dark(#fff, #121212); }
```
Feature-detect relative color: `@supports (color: rgb(from white r g b))`.

**Cascade layers `@layer` — order whole buckets of CSS regardless of specificity. Newly available.** Keeps reset/vendor beneath components without `!important`.
```css
@layer reset, base, components, utilities;   /* low → high priority */
```
Two surprises to document for the team: **unlayered styles outrank all layered styles**, and `!important` *reverses* layer order.

**Native CSS nesting (`&`, no Sass). Newly available.** It is **not** Sass — see the gotchas in `references/modern-css.md` (no string concatenation: `&__title` does *not* build `.block__title`; type selectors can't lead; `&` specificity behaves like `:is()`).

**`aspect-ratio` — reserve intrinsic ratio, prevent layout shift (CLS). Widely available.** Pair with `object-fit: cover`.

**Logical properties — `margin-inline`, `padding-block`, `inset`, `inline-size`, `border-inline-start`, `text-align: start/end`. Widely available.** Default to these for any localizable/RTL layout; they mirror automatically.

**`content-visibility: auto` + `contain-intrinsic-size` — skip rendering offscreen sections. Newly available.** Apply to large clearly-offscreen blocks (never above-the-fold); always reserve space to avoid scrollbar jump.

**`text-wrap: balance` / `pretty` — degrade silently.** `balance` evens short multi-line headings; `pretty` improves long-copy last lines (narrower support). No guard needed since they no-op gracefully.

**`-webkit-line-clamp` — still the portable way to truncate to N lines** (`display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:3; overflow:hidden`). This is a surviving `-webkit-` idiom, not a bug — keep it.

**`@property` — typed custom properties (`syntax`/`inherits`/`initial-value`). Newly available (July 2024).** Lets values animate that plain `var()`s can't (gradient angles, numeric progress). Old browsers just snap.

**Container queries are covered in the responsive-layout skill — use that for `@container`, `container-type`, `cqi` units, and subgrid.** They are Baseline Widely available; this skill covers the other modern features.

## The "don't hand-write prefixes" workflow

**The prefix era is over.** Engine convergence (Interop 2021–2025) removed almost all the inconsistencies prefixes used to patch. Flexbox and Grid ship unprefixed everywhere. Hand-writing prefixes is now a source of bugs and dead bytes, not safety.

**1. Never type these — they are dead:** `-moz-`/`-ms-` flexbox, `-ms-grid`, `-o-` anything, and the old prefix soup on `border-radius`/`box-shadow`/`transition`/`transform`/`animation`/gradients. If you are typing `-moz-`/`-ms-`/`-o-` in 2024+, you are almost certainly wrong. **Don't vendor-prefix Grid.**

**2. A small set of `-webkit-` prefixes survive** (all Safari/WebKit-driven) — `-webkit-backdrop-filter`, `-webkit-mask-*`, `-webkit-appearance: none`, the `-webkit-line-clamp` idiom, `-webkit-text-fill-color`, `-webkit-tap-highlight-color`, `-webkit-text-stroke`. Keep each paired with the standard property. Full list and rationale in `references/compatibility.md`. (For scrollbars, prefer standard `scrollbar-width`/`scrollbar-color`, Baseline Dec 2024, over `::-webkit-scrollbar`.)

**3. Automate the rest with Autoprefixer + Browserslist.** It reads Can I Use data plus your target and both *adds* needed prefixes and *strips* obsolete ones — data-driven, so it stays correct as browsers move. One `browserslist` config drives Autoprefixer, Babel, and linters together.
```json
{ "browserslist": ["defaults", "not dead"] }
```
`defaults` = `> 0.5%, last 2 versions, Firefox ESR, not dead`. Browserslist 4.26+ also accepts `baseline widely available` / `baseline newly available` as targets. Check coverage with `npx browserslist --coverage`. (Bundlers using Lightning CSS follow the same model.)

## Feature detection, not UA sniffing

**Detect the feature, never the browser.** UA strings lie and break; capability tests don't.
```css
@supports (aspect-ratio: 1) { /* … */ }
@supports selector(:has(a)) { /* … */ }
@supports (color: oklch(0 0 0)) { /* modern color path */ }
@supports not (clip-path: polygon(0 0)) { /* fallback */ }
```
Combine with `and` / `or` / `not`. In JS: `CSS.supports('backdrop-filter', 'blur(4px)')` or `if ('IntersectionObserver' in window)`.

## Progressive enhancement pattern

The **default styles are the fallback**; layer the modern feature inside `@supports` and reset any baseline-only property inside the query so it doesn't fight the enhanced version.
```css
.header { height: 85vh; }                                  /* fallback */
@supports (clip-path: polygon(0 0)) {
  .header { clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); height: 95vh; }
}
```

## Polyfills: when and when not

- Polyfill only **critical JS** features (`fetch`, `IntersectionObserver`) for a *measurable* unsupported slice.
- **CSS Grid and container queries cannot be meaningfully polyfilled** — use feature queries and a working fallback layout, not JS.
- `@supports` has replaced the old Modernizr-class approach. Reach for a polyfill last.

## Safari/WebKit reality

**Safari is the lagging engine and the must-test browser.** iOS forces *every* browser onto Safari's WebKit, so a Safari bug is an every-iPhone bug. Test current + previous Safari explicitly — not just Chrome.

## Reset

Classic Normalize.css is largely unnecessary post-Interop. Use a **lean modern reset** (or `modern-normalize`). Details and reasoning in `references/compatibility.md`.

## Quick checklist

- Feature safety judged by **Baseline** — Widely available = unconditional; Newly/Limited = `@supports`-gated or progressive enhancement.
- **No hand-written prefixes.** Autoprefixer + a single Browserslist config in the build; surviving `-webkit-` cases (backdrop-filter, mask, appearance, line-clamp, text-fill-color, tap-highlight, text-stroke) kept paired with the standard.
- **Feature-detect, never UA-sniff** — `@supports` / `CSS.supports` / `'X' in window`.
- **Progressive enhancement**: default styles are the fallback; modern feature layered inside `@supports`.
- **Polyfill only critical JS** for a measurable slice; Grid and container queries are not polyfillable.
- **Test current + previous Safari** — a WebKit bug is an every-iPhone bug.
- Prefer modern CSS where it fits: `:where()` for low-specificity defaults, cascade layers for ordering, `clamp()` for fluid type (mind the WCAG max), logical properties for i18n, modern color for token-derived palettes.
- Lean modern reset (or `modern-normalize`), not classic Normalize.

## References

- **`references/modern-css.md`** — full catalog of modern features with code and Baseline status: `:has`, `:is`/`:where` specificity, native nesting + Sass gotchas, `@layer`, `@scope`, fluid type with the WCAG caveat, modern color (`color-mix`/`oklch`/relative/`light-dark`), `aspect-ratio`, `content-visibility`, `text-wrap`, line-clamp, `@property`, logical properties.
- **`references/compatibility.md`** — Baseline tiers in depth, the dead-vs-surviving `-webkit-` prefix list, Autoprefixer + Browserslist config (including baseline queries), `@supports` detection, progressive enhancement, polyfill decision (and why Grid can't be polyfilled), Safari/WebKit reality, modern reset vs Normalize.

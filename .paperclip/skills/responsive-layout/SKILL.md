---
name: responsive-layout
description: Use this skill when building layout and responsive behavior — arranging items with Flexbox or CSS Grid, centering, columns, navigation, breakpoints and EM-based media queries, container queries, a mobile menu, or responsive images. Reach for it whenever you build any page or section layout or make something adapt across screen sizes, even if the user never says responsive or layout. Do NOT trigger for modern-CSS feature or browser-support questions (modern-css-and-compat), for animation and motion (web-animation-motion), or for non-layout tasks.
---

# Responsive Layout

Build layouts on a fluid base, then add breakpoints last. Use Flexbox for one-dimensional alignment, Grid for two-dimensional structure, container queries to make components adapt to where they are placed, and EM-based media queries so everything respects user zoom. This file covers the decision rules and the most-used idioms. For deep dives, follow the pointers to `references/`.

**Scope & related skills.** This skill owns *layout structure and responsiveness* — Flexbox, Grid, container queries, media queries, mobile nav, responsive images. For modern CSS *features* and browser-support decisions (`:has()`, cascade layers, `oklch()`, `@supports`, vendor prefixes) use **modern-css-and-compat**; for transitions/animation use **web-animation-motion**; for the visual quality pass use **frontend-visual-polish**.

## Pick the right tool: Flexbox vs Grid

- **1-D → Flexbox.** A single row OR a single column, where you care about distributing and aligning items along one axis. Use it for navbars, button rows, card internals, centering.
- **2-D → Grid.** Rows AND columns at once — a page skeleton, a gallery, any layout where things must line up both horizontally and vertically.
- **Combine them.** Grid for the page skeleton, Flexbox for component-level alignment inside the cells. This is the default modern combination.
- Float is legacy — only for wrapping text around an image. It pulls elements out of flow and is otherwise replaced by Flex/Grid.

Why it matters: forcing a 2-D layout out of Flexbox (wrapping rows that never align column-to-column) or a 1-D job into Grid both fight the engine. Match the dimensionality of the problem.

### Centering

- **One item inside a box:** `display: flex; justify-content: center; align-items: center` — or, with Grid, `display: grid; place-items: center`. Both center on both axes in one declaration.
- **Horizontal block centering:** `margin: 0 auto` with a `max-width` (the classic centered content container).

The full container/item property tables and the centering edge cases live in `references/flexbox.md` and `references/grid.md`.

## Flexbox: the idioms you reach for constantly

The container is `display: flex`; only its **direct** children are flex items. The main axis is set by `flex-direction`; the cross axis is perpendicular.

```css
.nav {
  display: flex;
  justify-content: space-between; /* main axis: push groups apart */
  align-items: center;           /* cross axis: vertically center */
}
```

Always drive items with the **`flex` shorthand** (`grow shrink basis`, default `0 1 auto`). Prefer `flex-basis` over `width` because basis is axis-relative — it means "size along the main axis" whether the row is horizontal or vertical.

```css
.fill   { flex: 1; }        /* grow to fill remaining space */
.sidebar{ flex: 0 0 18%; }  /* fixed: won't grow or shrink (shrink:0 locks it) */
.logo   { flex: 0 0 auto; } /* keep intrinsic size, never squish */
```

More high-frequency moves:

- `margin-left: auto` (or any side) on a flex item absorbs all free space, **pushing** that item and its later siblings to the end — the cleanest way to shove one nav link to the right.
- `flex-direction: column` is the **main responsive lever** — flip a row to a column at a breakpoint and the whole component restacks. (`gap` works in flexbox too, so spacing survives the flip.)
- `flex-grow` distributes free space by ratio: `flex-grow: 2` takes twice the leftover space of a `flex-grow: 1` sibling.
- Set images to `display: block` to kill the inline whitespace gap that appears under inline images.
- Nest freely; a flex item can itself be a flex container — that is how a navbar (outer flex) holds a right-hand cluster of buttons (inner flex).

For the full container/item property reference and nesting patterns, read `references/flexbox.md`.

## Grid: structure, fr, and the no-media-query idiom

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* fr distributes free space, ignores gap */
  grid-template-rows: 150px min-content;
  gap: 3rem;                             /* prefer gap over grid-gap */
}
.item {
  grid-column: 1 / 3;       /* line start / end */
  grid-row: 2 / span 2;     /* span instead of naming an end line */
  grid-column: 2 / -1;      /* -1 = last line (explicit grid only) */
}
```

- `fr` never overflows the way `%` does, because it accounts for `gap`. `minmax(min, max)` clamps a track; `min-content` / `max-content` / `fit-content()` size by content.
- Place items by line number, `span`, or `-1` (the last line, which survives added tracks).
- **Named lines** (`[sidebar-end full-start]`, a line can carry several names) for large layouts; **`grid-template-areas`** (with `.` for an empty cell) for small, readable ones.

**The responsive idiom with no media queries** — let the column count drop automatically as the viewport shrinks:

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: 3rem;
  align-items: start;
}
```

`auto-fit` collapses empty tracks so existing items stretch to fill; `auto-fill` keeps empty tracks reserved. This single line replaces a stack of breakpoints.

Explicit vs implicit grid, `grid-auto-flow: row dense`, restructuring a whole page by redefining the grid in a media query, and the visual-order-vs-DOM-order **accessibility caveat** are in `references/grid.md`. (Short version: `order`, grid placement, and `dense` change only *visual* order — screen readers follow DOM order, so reorder sparingly and fix the HTML order when you can.)

## Responsive: fluid base first, EM breakpoints, the rem trick

Four ingredients belong in place from day one: fluid layouts (`%`, prefer `max-width`), responsive units (`rem`), flexible images (`%` / `max-width`), and media queries **added last** — they are useless without the fluid base.

The viewport meta tag is mandatory or phones zoom the desktop layout out:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Pick **one** strategy: **mobile-first** (`min-width`, build up — the modern default) or **desktop-first** (`max-width`, shrink down). Media queries add no specificity, so order them so the intended one wins (desktop-first: largest breakpoint first; mobile-first: smallest first).

**Use `em` in media-query conditions.** `1em` equals the browser default (16px) and is *not* affected by `html { font-size }`, so it respects user zoom; `px` ignores zoom and `rem` has historic bugs in queries. Convert with px / 16:

| px   | em       |
|------|----------|
| 600  | 37.5em   |
| 900  | 56.25em  |
| 1200 | 75em     |
| 1800 | 112.5em  |

**The responsive-typography rem trick.** Set the root font to `62.5%` so `1rem = 10px` (easy math), then shrink the *whole design* by changing one value per breakpoint instead of editing dozens of sizes. Everything sized in `rem` rescales together.

```css
html { font-size: 62.5%; }                              /* 1rem = 10px */
@media only screen and (max-width: 75em)   { html { font-size: 56.25%; } }
@media only screen and (max-width: 56.25em){ html { font-size: 50%; } }
```

**Sass media-query manager** so breakpoints live in one place. The `@if` branches select the right query and `@content` injects whatever you wrap:

```scss
@mixin respond($breakpoint) {
  @if $breakpoint == phone       { @media only screen and (max-width: 37.5em)  { @content } }
  @if $breakpoint == tab-port    { @media only screen and (max-width: 56.25em) { @content } }
  @if $breakpoint == tab-land    { @media only screen and (max-width: 75em)    { @content } }
  @if $breakpoint == big-desktop { @media only screen and (min-width: 112.5em) { @content } }
}

html { @include respond(tab-land) { font-size: 50%; } }
```

Choose breakpoints from device-range clusters AND where the design visibly breaks — a query should span ~200–300px and make a real structural change (switch grid columns), not patch every 50px.

For the full mobile-nav build (overlay, `opacity`/`pointer-events`/`visibility` + `translateX` slide-in, the `.nav-open` state class) and the complete responsive-images guide (`srcset`/`sizes`, `<picture>` art direction, density switching), read `references/responsive.md`.

## Container queries: components that adapt to their placement

A container query sizes a component against its **ancestor's** width rather than the viewport, so the same card behaves correctly in a wide main column and a narrow sidebar — truly reusable. Baseline **Widely available**.

```css
.card-wrapper { container-type: inline-size; container-name: card; }

@container card (min-width: 400px) {
  .card { grid-template-columns: 1fr 2fr; }
}
```

Use container query units (`cqi` / `cqw` / `cqh`, each 1% of the container) for component-scoped fluid type — `cqi` is the inline-size unit you want most often.

Reach for container queries (over media queries) whenever a component must adapt to *where it lives* rather than to the screen. Details and the Baseline note are in `references/container-queries.md`.

## Workflow: how the pieces fit

1. **Build the fluid base first.** Fluid layouts (`%`, prefer `max-width`), `rem` for sizing, flexible images (`max-width`). Media queries are added **last** — they are useless without a fluid base under them.
2. **Lay out with Grid, align with Flexbox.** Grid for the page/section skeleton, Flexbox inside the cells. Use the `auto-fit` / `minmax` idiom to avoid breakpoints entirely where you can.
3. **Set `html { font-size: 62.5% }`** so `1rem = 10px`, then rescale the whole design from that one value at each breakpoint — this is why the rem trick beats editing dozens of sizes.
4. **Write breakpoints in `em`** so they honor user zoom, and centralize them in the Sass `respond()` mixin so they live in one place.
5. **Use container queries for reusable components** so they react to their slot, not the viewport.
6. **Respect DOM order.** `order`, grid placement, and `dense` change only visual order; reading and tab order follow the HTML — reorder sparingly and fix the source order when you can.

Pointers: `references/flexbox.md`, `references/grid.md`, `references/responsive.md` (full mobile-nav build + responsive images), `references/container-queries.md`.

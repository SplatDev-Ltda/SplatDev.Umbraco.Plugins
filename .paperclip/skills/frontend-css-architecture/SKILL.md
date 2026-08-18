---
name: frontend-css-architecture
description: Use this skill when structuring or reviewing CSS/Sass at the project level — setting up a reset and design tokens (CSS custom properties), applying the 62.5% rem strategy, naming with BEM, organizing files with the 7-1 pattern, or debugging specificity and cascade conflicts. Reach for it whenever you start or restructure a stylesheet, decide how styles are organized and named, or write Sass/SCSS, since ad-hoc CSS drifts into specificity wars, magic numbers, and inconsistent spacing fast. Do NOT trigger for purely visual choices like color/typography/spacing aesthetics (that is web-design-system), for layout and responsiveness (responsive-layout), or for non-CSS tasks.
---

# Frontend CSS Architecture

Write CSS that stays predictable as it grows. The throughline: keep specificity flat, tie every size to one root value, name by purpose, and document every reusable decision so nothing gets reinvented. Each rule below has a reason — follow the reasoning, not the letter.

## Start every stylesheet with a reset

Every project ships essentially this three-line reset. Make `box-sizing` inheritable so a component can override it locally without fighting a global `*` rule:

```css
*,
*::after,
*::before {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}
body { box-sizing: border-box; }
```

`box-sizing` is not inherited by default, so it has to be set on `*` (or made inheritable as above) — setting it only on `body` does nothing for descendants. `border-box` makes a declared `width`/`height` the *outer* size; the default `content-box` adds padding+border on top (a `width:100px; padding:20px` box renders 140px in content-box, 100px in border-box). border-box is what you almost always want because the number you type is the number you see.

Set inherited text properties (`font-family`, `font-weight`, `line-height`, `color`) once on `body` — they cascade down for free. Reserve `*` for true resets like box-sizing, since `*` is the slowest selector to match. Use a **unitless** `line-height` (1.5–1.7) so it scales with each element's font-size, and always end a font stack with a generic keyword: `font-family: "Lato", sans-serif`. Load CSS via an external `<link rel="stylesheet">` so it caches across pages; avoid inline `style=""` and `<style>` blocks. Use **kebab-case** for class/ID names — CSS is case-insensitive, so camelCase variants collide silently.

## The rem strategy: `html { font-size: 62.5% }`

This is the keystone of the whole system. The browser default root font-size is 16px; `62.5%` of 16 is 10, so:

```css
html { font-size: 62.5%; } /* 1rem = 10px → easy mental math */
```

Now `1.6rem = 16px`, `2.4rem = 24px`, and so on. Use `rem` for nearly all lengths — font-size, padding, margin, width — so the entire design ties to that single root value. Change the root once per breakpoint and everything rescales together. Keep tiny fixed values you *don't* want to scale (thin borders, a `border-radius: 9px`) in `px`. Prefer `rem` over `em` for global sizing: `em` is relative to the *inherited* font-size and compounds through nesting, while `rem` is always relative to root. Why 62.5% instead of hardcoding 10px on `html`? Using a percentage respects the user's browser font-size setting, so accessibility zoom still works.

## Cascade, specificity, and why to avoid `!important`

Conflicts resolve in this order: (1) importance, (2) specificity, (3) source order. Specificity is four counts `(inline, IDs, classes/attributes/pseudo-classes, elements/pseudo-elements)`, compared left to right. One ID beats any number of classes; one class beats any number of elements; `*` counts as zero. Combinators add up (`#nav h1` beats a later bare `h1`).

Avoid `!important`. It overrides both specificity and source order, so once one appears, the next override needs another, and it snowballs into an unwinnable war. Fix a conflict by adding the missing rule *at matching specificity* — e.g. a compound `.a.b` selector — not by escalating. Legitimate exceptions: overriding un-editable third-party CSS, and utility classes that are *designed* to win (see consistency below). Always load your own stylesheet **last** so it can override vendor/reset CSS through source order alone. Debug in DevTools (Elements → Styles): rules list by descending priority, struck-through declarations lost the cascade, and inherited values sit at the very bottom because inheritance is the weakest source.

## Picking units

Every property resolves to a value; pick the unit by the property's job:

| Property | Unit |
|---|---|
| root `font-size` | `%` (`62.5%`) |
| `font-size` | `rem` (or a scoped single-step `em`) |
| `margin` / `padding` | `rem` |
| `border` | `px` |
| `width` / `height` | `%`, `vw`/`vh`; `px` only for `max-width`/`min-width` |
| `top`/`right`/`bottom`/`left` | `%` |
| media-query conditions | `em` |

`%` resolves against the **containing block**, which depends on `position` — it is *not* simply "% of parent." `height: 100%` silently fails unless every ancestor has an explicit height (set `html, body { height: 100% }`, use a viewport unit, or `position: fixed`); `width: 100%` "just works" because blocks already fill width. Use `em` only for a single parent→child step, since it compounds when nested.

## Custom properties for runtime tokens

Put design tokens on `:root` so they cascade everywhere and can be edited at runtime from JS:

```css
:root {
  --color-primary: #087f5b;
  --shadow: 0 2rem 6rem rgba(0, 0, 0, 0.1);
}
.btn {
  background: var(--color-primary);
  box-shadow: var(--shadow);
}
```

`var(--x, fallback)` — the fallback covers an *undefined* variable, not browsers that lack custom-property support. One custom property can reference another. Prefer custom properties for dynamic/runtime values; prefer **Sass variables** when you must support legacy browsers (they compile to static values). Media-query conditions can't read custom properties, so keep breakpoints as Sass variables.

Inheritance note: text properties inherit (`font-family`, `color`, `line-height`), box properties (`margin`, `padding`, `border`) do not. Force with `inherit`, reset with `initial`. Form controls don't inherit font — set `font: inherit` explicitly.

## Consistency: classes, naming, and a documented system

- Style via **classes**, not element or ID selectors, for flat predictable specificity. Bump with a compound `.a.b` selector when you genuinely need to win.
- Name by **purpose**, not appearance — `.page-title`, never `.title-blue` (the blue might become green next quarter). A base class plus a `--modifier` handles variants; reuse classes across sections.
- Keep a **design-system comment block** at the top of the CSS documenting every reusable decision (type scale, weights, line-heights, colors with tints/shades, spacing scale, radius, shadows) and consult it before inventing any new value. This is what stops magic numbers from creeping in.
- **Utility/helper classes** are single-purpose and reusable (`.center-text`, `.margin-bottom-md`) — and they are the *one* legitimate home for `!important`, because their whole job is to override. Keep structural classes (`.btn`, `.grid`) neutral and add spacing/alignment via a helper on the instance.
- Ship reusable layout primitives:

```css
.container {
  max-width: 120rem;
  margin: 0 auto;
  padding: 0 3.2rem;
}
```

Put `.container` on a child so a full-bleed section background still reaches the screen edges. Pair with a reusable `.grid` + `.grid--N-cols`. Order the whole stylesheet generic→specific and comment-section it.

## BEM naming

Use `block__element--modifier`. Every selector is a single flat class — no specificity wars, and the name documents itself:

```css
.card { }
.card__title { }            /* element */
.card__title--featured { }  /* modifier */
```

Element names don't nest: write `.card__side` then `.card__title`, never `.card__side__title`. BEM keeps everything at one-class specificity, which is exactly why the cascade stays sane.

## A Sass mixin (DRY at the source)

```scss
@mixin clearfix {
  &::after { content: ""; display: table; clear: both; }
}
@mixin abs-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

A `@mixin` copies its declarations into each call site (good for repeated blocks; takes args + `@content`); a `@function` returns a value; `%placeholder` + `@extend` merges genuinely related selectors. Keep the *source* DRY — repeated compiled output is fine. Use `&` for pseudo-classes/elements and BEM modifiers (without `&` they compile as descendants and break). Nest no deeper than ~3 levels.

## Where to go deeper

- **For the full Sass/SCSS setup** — nesting and `&`, mixins vs functions vs `%placeholder`/`@extend`, partials and `@use`/`@forward`, the complete BEM rationale, the **7-1 folder pattern**, and Sass-vars-vs-custom-properties — read `references/sass-architecture.md`.
- **For the CSS foundation in full** — the reset, the 62.5% rem strategy, cascade/specificity, the units decision table, inheritance, positioning & stacking contexts, and custom properties — read `references/foundation.md`.
- **For consistency at scale** — class-not-element selectors, name-by-purpose, base+modifier, the design-system comment block, utility/helper classes with `!important`, and reusable `.container`/`.grid` — read `references/consistency.md`.

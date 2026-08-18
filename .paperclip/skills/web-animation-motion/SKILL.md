---
name: web-animation-motion
description: Use this skill when adding motion or visual effects to a UI — transitions, hover or scroll effects, keyframe animations, page or state transitions, parallax, glassmorphism, 3D, scroll-driven animations, view transitions, or other fancy effects — and always apply its performance and reduced-motion rules. Reach for it whenever the user asks to animate something or add a motion or visual effect. Do NOT trigger for static layout or styling with no motion, or for non-front-end tasks.
---

# Web Animation & Motion

Build motion that is **smooth (60fps), accessible (respects reduced-motion), and progressively enhanced** (gate non-Baseline features). This skill applies any time you add a transition, hover effect, scroll effect, page/state transition, parallax, glassmorphism, 3D, or "make it fancy" motion. Never ship motion that ignores the two non-negotiables below.

## Verify motion by watching it — don't one-shot

Great motion is *felt*, not just coded. For any real build, load the **`frontend-visual-polish`** skill and use its render-and-critique loop: animations that look smooth in your head can jank, fire on the wrong trigger, or leave content invisible in a static render (a classic scroll-reveal bug). Render in a real browser, watch/screenshot the result, and refine. The reusable `assets/motion.css` there has a robust reveal system (visible-by-default, IntersectionObserver-driven, reduced-motion-safe) — prefer adapting it over hand-rolling one that hides content.

## The two non-negotiables

Apply BOTH to every animation you write. No exceptions.

### 1. The golden performance rule: compositor-only properties

**Animate `transform`, `opacity`, and `filter` only.** These are composited on the GPU and skip the browser's Layout and Paint stages, so they hit 60fps. Animating `top`/`left`/`width`/`height`/`margin` forces layout recalculation every frame and janks.

- Move with `transform: translate()` / `translateX/Y/Z`, not `top`/`left`/margins.
- Resize with `transform: scale()`, not `width`/`height`.
- Fade with `opacity`, not `visibility` mid-animation.
- Keep each frame under ~16ms. Use DevTools Performance + Paint Flashing to verify nothing repaints.
- Use `will-change: transform` only just before an animation and remove it after — too many promoted layers regress performance and can blur text. Never leave it on permanently across many elements.

### 2. Reduced motion is an a11y requirement, not a nicety

Author full motion as the default, then **mute non-essential motion** under `prefers-reduced-motion: reduce`. Don't reflexively kill all motion — a gentle fade is a fine reduced alternative; what you cut is large movement, parallax, spin, and auto-playing loops. Vestibular disorders make big motion physically painful, so this is a MUST.

```css
@media (prefers-reduced-motion: reduce) {
  .hero { animation: none; }
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Mirror it in JS for anything driven by script (WAAPI, scroll handlers, `scrollIntoView`):

```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
function play() {
  if (reduce.matches) { el.style.opacity = 1; return; }   // jump to end state
  el.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
             { duration: 400, easing: 'ease-out', fill: 'forwards' });
}
reduce.addEventListener('change', play);
```

The `change` subscription matters: users can toggle the OS setting mid-session, and library timelines (GSAP/Motion) and scroll handlers are never caught by the CSS media query — only by `matchMedia`. When reduced motion is set, jump to the end state rather than removing the element's effect entirely.

## Pick the right tool

- **CSS `transition` + state change** — simple, state-driven (hover, focus, toggled class). Declare `transition` on the **base** state, not on `:hover` (declaring it on `:hover` makes the property animate in but snap back out, and `:active` is computed relative to base). Default to `transition: all <time>` first to avoid bugs where an un-transitioned property snaps, then narrow to an explicit list once stable. Duration scales with element size (~0.3s small controls, ~0.4s cards).
  ```css
  .btn { transition: transform .3s, box-shadow .3s; }           /* base state */
  .btn:hover  { transform: translateY(-3px); box-shadow: 0 1rem 2rem rgba(0,0,0,.2); }
  .btn:active { transform: translateY(-1px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.2); }
  ```
- **CSS `@keyframes` + `animation`** — multi-step, looping, overshoot/bounce (percentage stops). Use `animation-fill-mode: backwards` to apply the 0% state during a delay (no flash) and `forwards` to hold the last frame.
- **WAAPI (`element.animate()`)** — dynamic, sequenced, or interruptible motion driven by JS. Returns an `Animation` with `.finished`, `.pause()/.play()/.reverse()/.cancel()`.
- **Scroll-driven CSS** — progress bars, parallax, reveal-on-scroll, off the main thread, JS-free.
- **View Transitions API** — animate between two DOM states (route changes, list reorders).
- **A library (GSAP/Motion/Framer)** — only for many coordinated, interruptible, or physics-based timelines. See `references/performance-reduced-motion.md`.

Prefer native CSS/HTML/WAAPI over JS libraries wherever it exists.

## Baseline / support cheat sheet

Gate anything not Baseline Widely available behind `@supports` (CSS) or feature detection (JS), and always supply a graceful fallback.

| Feature | Status | Guard |
|---|---|---|
| `transition`, `@keyframes`, WAAPI, `prefers-reduced-motion` | Widely available | none needed |
| `@property` (animatable custom props) | Newly available (July 2024) — old browsers just snap | acceptable to ship; degrades to a snap |
| `@starting-style` + `transition-behavior: allow-discrete` + `overlay` | Newly available 2024 — old browsers snap | acceptable; degrades to a snap |
| Same-document View Transitions | Newly available | `if (document.startViewTransition)` |
| **Scroll-driven animations** (`animation-timeline`) | **NOT Baseline** (Chrome 115+, Safari 26+, Firefox flagged) | **MUST** `@supports (animation-timeline: scroll())` |

## Most-used modern techniques

### Scroll-driven animation (with the required @supports guard)

`animation-timeline: scroll()` ties progress to a scroll container; `view()` ties it to an element entering the viewport. Runs off the main thread. **Not Baseline — always guard**, and disable large motion under reduced-motion. Note: `animation-timeline` is reset-only in the `animation` shorthand, so declare it on its own line.

```css
@supports (animation-timeline: scroll()) {
  /* Reading-progress bar driven by document scroll */
  .progress {
    transform-origin: left;
    animation: grow linear;
    animation-timeline: scroll(root block);
  }
  @keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

  /* Reveal each card as it enters the viewport */
  .card {
    animation: reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 100%;
  }
  @keyframes reveal {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: none; }
  }
}

@media (prefers-reduced-motion: reduce) {
  .card { animation: none; opacity: 1; transform: none; }
}
```

Note `animation-timeline` is reset-only in the `animation` shorthand, so it must be on its own line after the shorthand. If scroll-driven CSS isn't available, fall back to `IntersectionObserver` toggling an `.is-visible` class (cheap, Widely available — no scroll-event polling, no layout thrash).

### Animate enter AND exit, including to/from `display:none`

`display` cannot be transitioned, and changing `display` cancels any otherwise-animatable change. The modern, JS-light fix for popovers/dialogs/menus uses three pieces: `@starting-style` (the entry from-state), `transition-behavior: allow-discrete` (flip `display`/`overlay` at the end of the transition instead of instantly), and `overlay` (keep a top-layer element painted until its exit finishes). Newly available 2024; old browsers just snap.

```css
[popover] {
  opacity: 0;
  transition: opacity .3s, display .3s allow-discrete, overlay .3s allow-discrete;
}
[popover]:popover-open { opacity: 1; }
@starting-style {
  [popover]:popover-open { opacity: 0; }   /* animate IN from here */
}
```

For non-popover overlays on old browsers, hide animatable elements with `opacity:0` (+ `pointer-events:none`/`visibility`), **not** `display:none`, so the fade can actually run.

### Animate a custom property (animated gradient) with @property

Plain custom properties are untyped and **snap** when changed. Registering a type with `@property` lets the value interpolate — so you can animate a gradient angle, a numeric progress fill, etc. Newly available (July 2024); old browsers just snap (acceptable degradation).

```css
@property --angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}
.card {
  background: linear-gradient(var(--angle), #6a11cb, #2575fc);
  animation: spin 6s linear infinite;
}
@keyframes spin { to { --angle: 360deg; } }

@media (prefers-reduced-motion: reduce) { .card { animation: none; } }
```

### View Transitions for state/route changes

```js
function update() { /* mutate the DOM to the new state */ }
if (document.startViewTransition) {
  document.startViewTransition(update);   // animated crossfade
} else {
  update();                               // fallback: instant
}
```

Tag elements with a unique `view-transition-name` to morph them independently across the change (e.g. a hero image that resizes between a list and a detail view) rather than just crossfading. Same-document is Newly available, so the `if (document.startViewTransition)` guard is mandatory; cross-document MPA transitions via `@view-transition { navigation: auto }` are newer still. Gate the default crossfade under reduced-motion:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) { animation: none; }
}
```

## References — the effect catalog

Load the matching file when you need depth:

- **`references/transitions-keyframes.md`** — `transition` on the base state, `@keyframes` with overshoot, fill-mode/direction, `cubic-bezier()`, transform-function order, 3D basics, why `display` can't transition.
- **`references/modern-motion.md`** — scroll-driven animations (`scroll()`/`view()` + `@supports`), View Transitions API, `@property`, animating to/from `display:none` (`@starting-style` + `allow-discrete` + `overlay`), `linear()` easing, `animation-composition`.
- **`references/fancy-effects.md`** — `clip-path`/`mask` reveals (+ `-webkit-`), `backdrop-filter` glassmorphism, `mix-blend-mode`, `offset-path` motion paths, 3D transforms, `filter`, scroll-snap, `scroll-behavior`.
- **`references/performance-reduced-motion.md`** — compositor-only props, `will-change` used sparingly, `content-visibility`, the full `prefers-reduced-motion` pattern (CSS + JS `matchMedia`), and library vs platform (GSAP / Motion / Framer Motion).

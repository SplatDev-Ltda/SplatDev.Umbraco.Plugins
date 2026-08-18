---
name: web-design-system
description: Use this skill when making the visual-design decisions for a UI — choosing typography, a color palette, a spacing scale, visual hierarchy, shadows, border-radius, and overall personality so it looks intentional and professional. Reach for it when building or styling any page or component, picking fonts or colors, establishing a brand feel, or when asked to make something look good, modern, or polished, or to do a design review — even if the word design is never said. Do NOT trigger for CSS architecture and token plumbing (frontend-css-architecture), for the full build-render-refine quality pass (frontend-visual-polish), or for non-visual tasks.
---

# Web Design System

Good design is mostly learnable rules plus a system — not innate art. A coherent visual system builds trust, raises perceived value, and gets users to their goal faster. Treat design as a first-class part of the work, not an afterthought you sprinkle on at the end.

The core idea: **pick a personality first, then let every other choice fall out of it.** That single decision is what enforces consistency across type, color, spacing, shadows, and shape. When choices look "off," it is almost always because they were made independently instead of derived from one feeling.

## Build it like a designer — don't one-shot

Knowing these rules is not enough to produce *beautiful* output; applying them and then **iterating against the rendered result** is. For any real UI build (not just advice), load the **`frontend-visual-polish`** skill and work its loop: start from its high-taste design-system assets (`assets/tokens.css` etc.), build, then render in a real browser and critique the screenshot against the rubric, and refine until it passes the Definition of Done. The rules below are *what* good looks like; `frontend-visual-polish` is *how* you reliably hit it. Use them together.

## Workflow — do this in order

1. **Choose a personality** (the feeling to transmit). See `references/personalities-ux.md` for the seven and their axes. Everything below is downstream of this.
2. **Set the type system** — one typeface (two max), a type scale, body 16px+, weight 400+. See `references/typography.md`.
3. **Set the color system** — a main color plus a gray, optionally one accent, with tints and shades for states. Verify contrast. See `references/color-contrast.md`.
4. **Set the spacing scale** — multiples of 16 plus a few small values. Apply the Law of Proximity. See `references/spacing-hierarchy.md`.
5. **Establish hierarchy** — decide what matters most and build a path through the page using size, weight, color, spacing, and position.
6. **Add depth carefully** — subtle low-alpha shadows and a consistent border-radius that matches the personality.
7. **Review against the heuristics** — familiar patterns, prominent CTA, accessible contrast, clear content. See `references/personalities-ux.md`.

Document every reusable decision (type scale, weights, line-heights, colors with tints/shades, spacing scale, radius, shadows) as tokens at the top of the project, and consult that block before introducing any new value. The discipline that makes a design look professional is the absence of one-off values — every size, color, and gap should come from the documented scales.

A quick gut-check before you start styling: if you cannot name the personality in one phrase, you are not ready to pick fonts or colors yet. Decide the feeling, then let the decisions cascade.

## Typography (the fast wins)

- **Typeface choice carries meaning.** Serif reads traditional and trustworthy and suits long-form; sans-serif reads clean and modern and is the safest default. Use good, popular faces only — Inter, Open Sans, Roboto, Montserrat, Lato, Work Sans; serif: Merriweather, Playfair Display, Lora.
- **One typeface per page (two max).** More looks amateurish.
- **Sizes:** body text 16–32px; long-form reading 20px+; big headlines 50px+ at weight 600–700. Never go below font-weight 400. Constrain choices with a type scale rather than picking sizes ad hoc.
- **Line length under ~75 characters** (65–72 reads most easily). Cap it with `max-width` on text containers, e.g. `max-width: 65ch`.
- **Line height 1.5–2 for body, 1.1–1.2 for large headlines.** Smaller or longer text needs more line-height. Use a unitless value.
- **Alignment:** never justify web text; default to left-aligned (center only very short blocks). Decrease `letter-spacing` on headlines that look detached; for short all-caps titles use small + bold + increased letter-spacing.
- **Don't use pure black for text** — a dark gray reads better and feels less harsh.

Why this matters: type is the first thing the eye resolves, so getting size, weight, and line length right is the single highest-leverage move toward a page that reads as intentional. Most "this looks amateur" reactions trace back to too many typefaces, sub-400 weights, lines that run too wide, or justified text.

Depth and edge cases (face imports, link underlines, gradient text) live in `references/typography.md`.

## Color and contrast (the fast wins)

- **Color conveys meaning** — match the main color to the personality. Blue = trust/professional (the most-used); green = growth/health; red = attention/passion; orange = creativity/cheer; purple = wealth/wisdom; black = power and elegance but hard to use well.
- **Minimum system: a main color + a gray.** The "gray" can be a very dark tint of the main color, used for text. With experience add one accent that has a real relationship to the main. You will always need tints (lighter) and shades (darker) for states and text.
- **Use curated palettes** (Open Color, Tailwind colors, Flat UI Colors) or palette tools (Coolors, Paletton). Never use a random color picker or raw CSS named colors.
- **Verify contrast with a tool: 4.5:1 for normal text, 3:1 for large.** 2.9:1 is unreadable, 5:1 is fine, 13:1 is excellent. Check hover, active, disabled, and visited states separately, and check text layered over images against the final rendered result.
- **On dark backgrounds, use a tint of the background color for text** rather than pure white.
- **Never rely on color alone** for meaning — pair it with size, weight, or position.

Color meanings in full, tint/shade generation, and modern derivation (`color-mix`, `oklch`) live in `references/color-contrast.md`.

## Spacing scale

Whitespace is the fastest way to look polished — it creates invisible relationships between elements. Use a spacing system based on multiples of 16 plus a few small values, and do not reuse the type scale for spacing. Section gaps run large (~140–192px).

```css
:root {
  --space-2: 0.2rem;    /*   2px */
  --space-4: 0.4rem;    /*   4px */
  --space-8: 0.8rem;    /*   8px */
  --space-12: 1.2rem;   /*  12px */
  --space-16: 1.6rem;   /*  16px */
  --space-24: 2.4rem;   /*  24px */
  --space-32: 3.2rem;   /*  32px */
  --space-48: 4.8rem;   /*  48px */
  --space-64: 6.4rem;   /*  64px */
  --space-80: 8rem;     /*  80px */
  --space-96: 9.6rem;   /*  96px */
  --space-128: 12.8rem; /* 128px */
}
```

(`rem` values assume `html { font-size: 62.5% }`, so `1rem = 10px`.) Apply the **Law of Proximity**: related elements closer together, unrelated elements further apart. Prefer whitespace over dividing lines — lines look dated. Vertical whitespace usually exceeds horizontal. A reliable beginner technique: start with too much whitespace, then remove until it looks right.

Pull every margin, padding, and gap from this scale — never a hand-picked `13px` or `27px`. Snapping to the scale is what gives a layout its rhythm and is most of what separates a polished page from a cramped one.

## Visual hierarchy

Decide which elements matter most and build a clear path through the page. The tools are position, size, color, spacing, borders, and shadows.

- **Top of page:** put the main heading and first CTA as close to the top as possible. Images draw heavy attention — use them deliberately.
- **Text-level:** vary font sizes (most important largest), bold key items, and lighten secondary text to de-emphasize it. Emphasize titles, links, buttons, and data points; de-emphasize labels and secondary info.
- **Component-level:** make a section stand out with a distinct background color (plus an optional shadow or border), or by de-emphasizing its neighbors. Common standouts: testimonials, CTAs, pricing tables (highlight the recommended tier), cards, and forms.

A useful test: squint at the page until detail blurs. The thing that still stands out should be the thing that matters most. If everything reads at the same weight, there is no hierarchy and the user has no path to follow.

More on images, illustrations, and icons in `references/spacing-hierarchy.md`.

## Depth — shadows and radius

Shadows simulate depth; more offset reads as further from the screen. Use them in **small doses** and keep them **light** — low-alpha, around `rgba(0,0,0,0.07)` in the ~0.05–0.1 range. Dark shadows everywhere ruin a design. For a top light source, set the horizontal offset to 0. Size by intent: small for buttons, medium for cards and sections, large for nav and modals. Vary the shadow across mouse states (rest → hover → click).

```css
:root {
  --shadow-sm: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.07);
  --shadow-md: 0 1.2rem 2.4rem rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 2rem 6rem rgba(0, 0, 0, 0.07);
}

.btn {
  box-shadow: var(--shadow-sm);
  transition: all 0.3s; /* declare on the base state, not on :hover */
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

**Border-radius maps to seriousness vs playfulness:** less radius reads serious, more reads playful. Match it to the typeface's roundness and keep it consistent across related elements (e.g. an image and its section both `12px`). `border-radius: 50%` only makes a circle on a square element; for a non-square pill use a large px value instead.

## Personalities (the consistency engine)

Pick the feeling first, then derive every ingredient from it. The seven personalities, with the axes serious↔playful and calm↔bold:

- **Serious / Elegant** — serif type; gold, pastel, or black; no shadows or radius.
- **Minimalist** — boxy sans-serif; mostly one color; no shadows or radius.
- **Plain / Neutral** — neutral sans-serif; safe blues; structured.
- **Bold / Confident** — big bold boxy type; bright color blocks.
- **Calm / Peaceful** — soft serif; washed-out pastels; rounded.
- **Startup / Upbeat** — one sans-serif; light text; gradients; 3D illustrations; rounded.
- **Playful / Fun** — round or handwritten type; lots of color; hand-drawn icons.

You can inject calm or bold traits into other personalities — injecting calm into startup designs is a current trend. Use the axes to fine-tune a recipe rather than blending all seven into something muddy and characterless.

The payoff of committing to one personality is that disagreements about "which font" or "which blue" mostly resolve themselves: you ask which choice better serves the feeling, and the answer is usually obvious. Full breakdown plus UX heuristics in `references/personalities-ux.md`.

## UX and content (review pass)

- "Design is how it works." Align the user's goal with the business goal (e.g. highlight a recommended pricing tier).
- Prefer **familiar patterns** over novelty. Make the CTA the single most prominent element; buttons should describe exactly what happens on click. Use blue + underline only for links.
- Animate only with purpose, kept fast (200–500ms). In forms, align labels and fields in one vertical line and give clear feedback after actions.
- **Content:** use a descriptive, keyword-driven headline (not vague or fancy); show only relevant info; use simple words; break long text with subheadings, images, and bullets.
- Get inspiration by "stealing like an artist" — adapt the best parts of many designs (Land-book, One Page Love, awwwards, screenlane) rather than copying one.
- Above all, remember the purpose: a coherent visual system signals care and competence, which is what makes users trust the product and value it more highly.

## Quick checklist

- One or two fonts, a type scale, body 16px+, weight 400+, line length <75ch, line-height 1.5–2.
- Spacing from a 16-multiple scale; type scale not reused for spacing.
- Color system: main + gray (+ optional accent) with tints/shades; contrast ≥ 4.5:1 / 3:1, checked in every state and over images; never color alone for meaning.
- Shadows subtle, low-alpha (~0.07), consistent direction; radius consistent and personality-matched.
- Clear hierarchy: main heading + CTA near the top; secondary text lightened.
- Personality chosen first; every other choice derived from it; all decisions documented as tokens.

## Reference files

- `references/typography.md` — typeface choice, sizes, weights, line length, line-height, alignment, link/gradient details.
- `references/color-contrast.md` — color meanings, the main/gray/accent system, tints and shades, palette tools, contrast ratios, dark-background tints.
- `references/spacing-hierarchy.md` — the 16-multiple spacing scale, Law of Proximity, text- and component-level hierarchy, images, icons, shadows, radius.
- `references/personalities-ux.md` — the seven personalities and their axes, UX heuristics, content rules, "steal like an artist."

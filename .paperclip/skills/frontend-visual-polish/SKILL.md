---
name: frontend-visual-polish
description: Use this skill whenever the user wants new or existing front-end UI to look genuinely beautiful, premium, polished, professional, or high-end, not just functional. Trigger it when building or restyling landing pages, hero sections, dashboards, settings screens, forms, cards, components, or marketing pages where visual quality is the point; when the user says make it beautiful, polished, premium, pixel-perfect, awesome, modern, or professional; when they want it to stop looking generic, templated, bland, or AI-ish; when they want great spacing, depth, hover states or animations; need flawless responsiveness; or are matching a mockup, Figma, or screenshot. It builds UI like a designer — render, critique, and refine in a real browser against a strict quality bar instead of one-shotting. Load it alongside web-design-system and web-animation-motion. Do NOT trigger for backend, data, tooling, or logic tasks with no visual goal.
---

# Frontend Visual Polish

The difference between *competent* front-end (what a strong model produces by default) and *exceptional* front-end is not knowledge — it is **taste applied through iteration**. A designer never ships the first render. They build, look at the actual pixels, find what's weak, and refine. This skill makes you work the same way.

Two non-negotiables:

1. **Start from the design system, not a blank file.** Opinionated, vetted defaults beat improvised ones every time. Use the bundled `assets/` (tokens, reset, components, motion) as your foundation.
2. **Never one-shot. Render and iterate.** Build it, open it in a real browser, *look at the screenshot*, score it against the rubric, fix the top issues, repeat — at least **two refine passes** before you call it done. This single discipline is what closes the quality gap.

If you skip the render-and-look step, you are guessing — and guessing produces the generic AI look. Looking produces craft.

## The loop

### Step 0 — Adopt the system
Copy the four asset files into the project (or link them) and build on their tokens:
`assets/tokens.css` (OKLCH color ramps, fluid modular type scale, **layered elevation shadows**, easing/motion, spacing, radius), `assets/reset.css`, `assets/components.css` (buttons/cards/forms/nav/dialog with all states), `assets/motion.css` (reveal system + micro-interactions). Everything you write should reference `var(--…)` tokens — no magic numbers. This guarantees rhythm and cohesion for free.

### Step 1 — Structure first, decoration later
Get the layout and hierarchy right before colors and effects:
- Decide the **personality** (see web-design-system) and let it drive type/color/shape.
- Build a real **grid** with intentional emphasis — not everything the same size, not everything centered. Use generous whitespace and a clear focal point (one primary CTA).
- Use fluid type (`clamp()`) and the spacing scale so it breathes at every width.

### Step 2 — RENDER & LOOK (the step everyone skips)
Open the page in a real browser and screenshot it at multiple widths, then **actually read the screenshots**. `file://` is blocked, so serve over HTTP. Full instructions and exact commands: **read `references/playwright-review.md`**. Minimum widths to check: **360, 768, 1024, 1440**. Before each screenshot, trigger any scroll-reveals (scroll the page, or the content will look blank — see that file).

### Step 3 — CRITIQUE against the rubric
Score the render honestly across every dimension (layout, type, color/contrast, depth, spacing rhythm, motion, responsiveness, states/micro-interactions, accessibility, detail). **Read `references/critique-rubric.md`** for the rubric and the "exceptional vs mediocre" bar. Anything below a 4/5 is a fix list item. Be your own harshest critic — "it's fine" is the enemy.

### Step 4 — REFINE
Fix the top 3–5 issues from the critique, re-render, re-score. Repeat until the Definition of Done passes. Expect 2–3 passes; the first build is never the best one.

### Step 5 — Definition of Done (gate)
Only declare the work done when **all** of these hold (verify, don't assume):
- **No horizontal overflow** at 360 / 768 / 1024 / 1440 (check `scrollWidth <= clientWidth`).
- **Layout reflows intentionally** at each breakpoint — nothing cramped, clipped, or stretched; tap targets ≥ ~44px on mobile.
- **Type**: a clear scale, comfortable measure (≤ ~75ch), tight tracking on big display sizes, no orphaned/awkward wraps in headings (`text-wrap: balance`).
- **Color/contrast**: AA (4.5:1 body, 3:1 large); works in **both** light and dark; no pure-black text.
- **Depth**: layered shadows (never one flat drop shadow); hairline borders via `color-mix`.
- **Motion**: only `transform`/`opacity` animate; reveals are an enhancement (content visible without JS); every non-essential motion is gated by `prefers-reduced-motion`.
- **States**: hover, active, **focus-visible**, and disabled are all designed for every interactive element — not browser defaults.
- **Polish**: consistent radius, aligned edges, optical spacing, real copy (no lorem walls), no stray default styles.
- It does **not** look like the generic AI default (see anti-patterns).

## Automated quality gate — run it in every scenario

After building (and after each refine pass), run the bundled static auditor on your output as a deterministic backstop:

```bash
python3 scripts/audit.py <your-output-dir>
```

With zero dependencies it flags the defects that most often slip through when you can't render or are a weaker model: missing or `outline:none` focus states, missing `prefers-reduced-motion`, missing viewport meta, content hidden until JS, the generic-AI palette (indigo/violet, purple→blue gradient, gradient headline text), flat single shadows, all-`px` sizing, emoji-as-icons, and obvious same-rule contrast failures. **Fix every `[FAIL]` before shipping; review the `[WARN]`s.**

It is a *heuristic linter, not a renderer* — it cannot see true pixel contrast or horizontal overflow. So a clean audit is necessary, not sufficient: when a browser is available, still do the full render check (Steps 2–4). The audit is the floor that holds in every scenario; the render loop is the ceiling.

## When you can't render (graceful degradation)

The render-and-look loop is this skill's biggest lever — but it depends on a browser (Playwright or any headless Chrome). **Do not pretend to have rendered when you didn't.** If no browser/screenshot tool is available:

- **Say so up front.** Tell the user the visual loop is unavailable, so the result is "design-system + checklist quality," not "rendered-and-refined quality" — and they should eyeball it.
- **Still do everything that doesn't need a browser.** Build on the `assets/` design system, apply the taste defaults, and verify the Definition of Done by *careful code inspection* instead of by sight: check the overflow math, confirm AA contrast from the token values, confirm focus-visible/hover/disabled states exist, confirm reduced-motion guards, confirm reveals are visible-by-default.
- **Self-critique by reasoning** through `references/critique-rubric.md` against the code, not a screenshot. It is weaker than looking, but far better than nothing.
- **Offer to render later.** When a browser becomes available (or the user can run one), re-run Steps 2–4 — that is where the last 20% of polish lives.

Expect lower quality without rendering; the gap is real. Recover it as soon as a browser is available.

## Match the effort to the stakes

The full multi-pass loop costs real time and tokens, so spend it where quality is the point — not on everything:

- **Quality-critical / user-facing UI** (landing pages, heroes, marketing, anything a client or customer sees, or "make it beautiful"): run the full loop — never one-shot.
- **Throwaway / internal / quick** (a one-off internal tool, a scratch demo, a sanity check): still start from the `assets/` system and run the Definition-of-Done checklist, but a single render pass — or none plus the checklist — is fine. Don't burn craft-level iteration on something nobody will look at twice.

When unsure how polished it needs to be, ask — or default to the full loop for anything customer-facing.

## Scenario matrix — match verification to what you have

We measured this: the design-system assets + taste guidance lift quality across model tiers, but the *render-and-refine loop* needs both a browser and a model capable of judging a screenshot — so weaker / browserless runs ship execution bugs (e.g. a broken-contrast CTA) the loop would have caught. Pick verification by what you actually have, and **always run the automated gate**:

| You have | Verification to run |
|---|---|
| **Strong model + browser** | Full loop (Steps 2–4) **+** `scripts/audit.py`. Highest quality. |
| **Strong model, no browser** | Graceful degradation (reason through the rubric) **+** `scripts/audit.py`. Tell the user rendering was skipped. |
| **Weaker model + browser** | Run the loop if you can drive it reliably; otherwise lean on the assets **+** `scripts/audit.py` and take one sanity screenshot. |
| **Weaker model, no browser** | Assets + taste defaults **+** `scripts/audit.py` (mandatory). The gate is your main safety net here — and if a stronger model or a human can review, have them. |

The constant across all four rows is the **automated gate** — it turns "I think it's fine" into a checked result regardless of model strength or tooling.

## Taste defaults (use these unless the design calls for otherwise)
- **Type**: pair a characterful display face with a clean body grotesque; fluid `clamp()` sizes on a ~1.25 ratio; negative `letter-spacing` on large headings; `line-height` ~1.5 body / ~1.1 display.
- **Color**: build in OKLCH so lightness steps look even; a confident brand hue (avoid the default indigo→purple gradient); neutrals with a subtle hue tint, never clinical gray; ship dark mode via `light-dark()`.
- **Depth**: multi-layer shadows (2–4 stacked low-alpha shadows) for soft, realistic elevation; raise cards/buttons slightly on hover.
- **Motion**: 150–350ms, custom easing (a gentle overshoot for entrances), staggered reveals, animated link underlines, button press feedback — subtle, never gratuitous.
- **Layout**: real grid, asymmetry where it adds interest, one clear focal point, generous and *consistent* whitespace from the scale.

## Avoid the generic-AI look
Read **`references/anti-patterns.md`** for the full list of tells (centered-everything, lone purple gradient, default-tracked Inter, identical evenly-spaced cards, one hard shadow, emoji-as-icons, default-only focus, no hover states, lorem walls) and the intentional alternative for each. If your render matches any tell, fix it before shipping.

## Pixel-perfect against a target
"Pixel-perfect" requires a reference. When the user provides a mockup / Figma / screenshot, follow the diff-and-close-the-gap workflow in **`references/target-matching.md`**: build, screenshot at the target's width, compare side by side, measure the deltas (spacing, sizes, colors), and iterate until they match.

## Working with the asset library
The `assets/` files are a cohesive system — use them together. `starter.html` is a reference of the intended quality bar; imitate its level of craft (hierarchy, depth, reveals, dark mode), not its exact content. When you need a component, adapt the one in `components.css` rather than writing a worse one from scratch.

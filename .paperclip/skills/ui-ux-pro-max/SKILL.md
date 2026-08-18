---
name: ui-ux-pro-max
description: UI/UX design intelligence for web and mobile applications. Use this skill whenever a task touches how something looks, feels, moves, or is interacted with — even if the user doesn't frame it as a "design" task. Triggers include: building any page or component, choosing colors or fonts, reviewing UI for quality or accessibility, fixing layout bugs, adding animations, designing forms or navigation, improving mobile experience, implementing dark mode, or adding charts and data visualizations. Covers 10 stacks: React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS. If the code touches the user interface, this skill applies.
---

# UI/UX Pro Max — Design Intelligence

Comprehensive design guide for web and mobile. Contains detailed rules for accessibility, touch interactions, performance, style selection, layout, typography, animation, forms, navigation, and charts across all major platforms.

**Detailed rules are in** `references/ux-rules.md` — read the relevant section(s) when you need specifics beyond the priority table below.

---

## When to Apply

Use this skill when the task involves **UI structure, visual design decisions, interaction patterns, or user experience quality**.

| Apply? | Situation |
|--------|-----------|
| ✅ Must use | New pages, components, color/font choices, UI code review, navigation structure, animations, responsive behavior, accessibility |
| ✅ Recommended | UI looks "not professional enough", pre-launch quality pass, aligning cross-platform design, building design systems |
| ❌ Skip | Pure backend logic, API/database design, infrastructure/DevOps, non-visual scripts |

**Decision rule**: If the task changes how a feature **looks, feels, moves, or is interacted with** — use this skill.

---

## Rule Priority Table

Follow this order when deciding what to check first. Read `references/ux-rules.md` for full rule detail on any category.

| Priority | Category | Impact | Key Checks |
|----------|----------|--------|------------|
| 1 | Accessibility | CRITICAL | Contrast 4.5:1, alt text, keyboard nav, ARIA labels, focus rings |
| 2 | Touch & Interaction | CRITICAL | Min 44×44px targets, 8px+ spacing, loading feedback, no hover-only |
| 3 | Performance | HIGH | WebP/AVIF images, lazy load, skeleton screens, bundle splitting |
| 4 | Style Selection | HIGH | Match style to product type, consistent across pages, SVG icons only |
| 5 | Layout & Responsive | HIGH | Mobile-first, systematic breakpoints, no horizontal scroll |
| 6 | Typography & Color | MEDIUM | 16px+ body, 1.5 line-height, semantic color tokens |
| 7 | Animation | MEDIUM | 150–300ms micro-interactions, transform/opacity only, respect reduced-motion |
| 8 | Forms & Feedback | MEDIUM | Visible labels, error near field, progressive disclosure |
| 9 | Navigation | HIGH | Predictable back, bottom nav ≤5, deep linking |
| 10 | Charts & Data | LOW | Legends, tooltips, accessible colors, table alternative |

---

## Design Workflow

### Step 1 — Understand the context

Extract from the user's request:
- **Product type**: SaaS, e-commerce, consumer app, portfolio, admin tool, etc.
- **Target platform**: Web, iOS, Android, or cross-platform
- **Style signal**: Any keywords (minimal, vibrant, dark, playful, professional)
- **Stack**: What framework/library is in use

### Step 2 — Select a design direction

Match style to product type using this guide (full details in `references/ux-rules.md` §4):

| Product | Recommended Styles |
|---------|--------------------|
| SaaS / B2B tool | Minimalism, flat, clean |
| Consumer social | Glassmorphism, vibrant gradients |
| Finance / Fintech | Minimal, dark mode, serious |
| Health / Wellness | Soft, warm, claymorphism |
| Gaming / Entertainment | Dark, neon, brutalism |
| E-commerce | Clean, product-first, neutral |
| Enterprise / Admin | Flat, high density, muted |

**Font pairing quick picks:**

| Mood | Heading | Body |
|------|---------|------|
| Professional / SaaS | Inter, Plus Jakarta Sans | Inter, DM Sans |
| Elegant / Premium | Playfair Display | Lato, Source Sans 3 |
| Playful / Consumer | Nunito, Fredoka | Poppins |
| Editorial | Merriweather | Source Serif 4 |

### Step 3 — Apply rules by priority

Work through the Priority Table top-down. For any category where issues might exist, read the corresponding section in `references/ux-rules.md` for the full rule list.

### Step 4 — Pre-delivery checklist

Run through this before calling work done:

**Visual:**
- [ ] No emojis as icons — SVG icon library only
- [ ] All icons from one consistent family and style
- [ ] Pressed/hover states don't cause layout shift

**Interaction:**
- [ ] All tappable elements ≥44×44pt with clear pressed feedback
- [ ] Micro-interactions 150–300ms with native easing
- [ ] Disabled states visually clear and non-interactive
- [ ] Focus order matches visual order; all interactive elements labelled

**Light/Dark mode:**
- [ ] Primary text contrast ≥4.5:1 in both modes
- [ ] Secondary text ≥3:1 in both modes
- [ ] Both themes tested independently

**Layout:**
- [ ] Safe areas respected (notch, gesture bar, status bar)
- [ ] Scroll content not hidden behind fixed/sticky bars
- [ ] Verified on 375px (small phone) and large phone
- [ ] 4/8dp spacing rhythm maintained throughout

**Accessibility:**
- [ ] All meaningful images/icons have accessible labels
- [ ] Color is not the only indicator
- [ ] Reduced motion and large text sizes don't break layout
- [ ] Form fields have labels, hints, and clear error messages

---

## Common Sticking Points

| Problem | Where to look |
|---------|---------------|
| UI doesn't look professional | §4 Style Selection + §6 Typography rules |
| Dark mode contrast issues | §6 `color-dark-mode` + `color-accessible-pairs` |
| Animations feel unnatural | §7 `spring-physics` + `easing` + `exit-faster-than-enter` |
| Form UX is poor | §8 `inline-validation` + `error-clarity` + `focus-management` |
| Navigation feels confusing | §9 `nav-hierarchy` + `bottom-nav-limit` + `back-behavior` |
| Layout breaks on small screens | §5 `mobile-first` + `breakpoint-consistency` |
| Performance / jank | §3 `virtualize-lists` + `main-thread-budget` + `debounce-throttle` |
| Accessibility fails | §1 full rule list |
| Chart looks wrong | §10 rule list |
| Icons look inconsistent | §11 Professional UI Rules in references |

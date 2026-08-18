---
name: clickthrough-video
description: Record a click-through video of a real web flow in a browser, with a visible mouse cursor, human-paced typing and clicking, plus per-step screenshots and captured API payloads. Use this whenever someone wants a screen recording, screen capture, demo video, walkthrough, click-through, "record the flow", "show me it working", a video for a stakeholder or code reviewer, QA or UAT evidence, a repro recording of a bug, or a recording of a checkout/signup/onboarding flow — even if they just say "can you record that" or "capture a video of it" without mentioning Playwright or any tool. Also use it when a reviewer asks to see a feature demonstrated end to end, or when a request payload needs to be shown being sent from the UI.
---

# Click-through videos

A recording is only useful if it looks like a person used the app and if it is honest
about what happened. Both take deliberate work: browser automation defaults produce
instant, cursorless, robotic interaction, and a flow driven end to end will usually hit
something real that goes wrong.


## Running inside Paperclip (agents)

> The scripts use the **`.cjs`** extension deliberately: `/app/package.json`
> declares `"type": "module"`, so a `.js` file anywhere under `/app` is parsed as
> an ES module and every `require()` throws `require is not defined`. `.cjs`
> forces CommonJS and works unchanged on a dev machine too.

This skill is baked into the image at `/app/skills/clickthrough-video`.

The container ships **`playwright-core`** plus a **system Chromium**
(`/usr/bin/chromium`) rather than the full `playwright` package — bundling
Playwright's browsers would add hundreds of MB to an image that already has one.
`scripts/chromium.cjs` handles that: it loads `playwright` when available and
falls back to `playwright-core` with an explicit `executablePath`.

It also **forces headless when there is no X display**, which is the case in the
server container — a headful launch there fails with "Missing X server". Video
recording works headless, so output is unaffected.

Overrides:
- `PLAYWRIGHT_CHROMIUM_PATH` — point at a different Chromium.
- `CLICKTHROUGH_HEADLESS=0` — force headful, e.g. when driving the co-driven
  browser's Xvfb display (`DISPLAY=:90`) so the recording shows the same session
  an operator is watching over noVNC.

**Attach the finished video/screenshots as ISSUE ATTACHMENTS**
(`multipart POST /companies/:id/issues/:id/attachments`), not just as a comment
or a git commit — the operator needs to download them, and the done-gate checks
for attached evidence.


## The workflow

**Probe, then record.** Do not write a recording script from guesses. Run
`scripts/probe.cjs` against each page first to get real input names, button text and
visibility, dropdown structure, and iframes. Every take costs a minute or more and, in a
flow that writes data, may consume real records — so learn the page cheaply first.

```bash
node scripts/probe.cjs "https://example.test/signup" --wait 6000
node scripts/probe.cjs "https://example.test/products" --scroll 1200 --click "SELECT"
```

**Then drive it** with `scripts/recorder.cjs` + `scripts/human.cjs`:

```js
const { launch } = require('./scripts/recorder');

(async () => {
    const { page, human, shot, finish } = await launch('signup-flow', {
        origin: 'https://example.test',
    });

    await page.goto('https://example.test/signup', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await human.idle(1200);                       // pointer drifts while it settles
    await shot('signup-empty');

    await human.type(page.locator('input[name="email"]').first(), 'qa@example.com', 'email');
    await human.click(page.locator('form:has(input[name="password"]) button[type="submit"]'), 'Sign up');
    await page.waitForTimeout(6000);
    await shot('signed-up');

    await finish();                               // required: video is written on close
})();
```

Copy the three scripts into a scratch directory next to your driver, or require them by
absolute path from the skill directory. They need `playwright` resolvable — reuse an
existing install rather than adding a dependency to the user's project.

## What makes it look human

`makeHuman(page)` gives you `click`, `type`, `scroll`, `moveTo`, `idle`, `pause`. Prefer
them over raw `locator.click()` / `fill()` in the recorded take, because the point of the
video is showing intent, not just end state:

- **Mouse travels** along an eased, slightly arced path so it accelerates away and settles.
- **Typing is per character** with jitter and occasional longer beats.
- **Scrolling is stepped**, not one instant jump.
- **`idle(ms)` drifts the pointer** during slow loads so it doesn't look frozen.

Use `fill()` only outside the recorded portion (setup), where speed matters more than looks.

## The cursor problem

**Playwright's video does not capture the OS cursor.** Without help, the recording shows
fields filling themselves with no pointer anywhere — which is exactly what people mean when
they say an automated recording looks wrong. `installCursor(page)` (called for you by
`launch`) injects a synthetic pointer plus click ripples and moves it via real mouse events.

Two things that will bite you:

- **Init scripts run in every frame.** Without a `window.top !== window.self` guard, each
  iframe draws its own cursor at its own local coordinates and the video shows several
  pointers at once. The bundled script guards this; keep the guard if you adapt it.
- **Video is only flushed when the context closes.** If the script throws or you forget
  `finish()`, the `.webm` is missing or empty. Wrap driving code so `finish()` still runs.

## Selector traps that cost takes

- **Scope submit buttons to their form.** Pages commonly carry a hidden header search form,
  and `button[type="submit"]` matches that one first, so the click times out on an invisible
  element. Use `form:has(input[name="password"]) button[type="submit"]`.
- **Fields often have a `name` but no `id`.** Prefer `input[name="…"]`; confirm with the probe.
- **Custom dropdowns are not `<select>`.** Options frequently live in the DOM permanently and
  are revealed by a class, so a generic `:has-text("California")` can match a hidden
  placeholder *option* and the click gets eaten by an overlay. Click the trigger first, then
  scope the option to that dropdown's container.
- **A widget's trigger text is its current value.** Once something is chosen, the placeholder
  is gone — so re-finding it by placeholder fails, and selecting one field may auto-fill
  another (picking a state can set the country). Match on placeholder-or-value and no-op if
  it already holds the wanted value.
- **Cross-origin iframes** (payment hosted fields, embedded widgets) need `frameLocator`.
  Watch for a submit control that is *itself* an iframe layered over the visible button —
  a page-level click never lands. `boundingBox()` inside a frame returns page coordinates,
  so the human helpers work on them normally.

## When the flow is blocked

Long flows hit third-party services that refuse to work from a dev machine — address
validation, geocoding, fraud checks, anything with an IP-restricted or referrer-locked key.
`stubRoute(page, '**/api/validation/address', {...})` intercepts the call in the browser and
returns a canned response, changing nothing in the app or the repo.

Use it to get past a blocker that isn't what you're demonstrating, and **say so in the
writeup** — the stubbed thing is no longer being tested. Match the response shape the
front end actually destructures; read the calling code rather than guessing field names.

## When it fails mid-flow, diagnose before re-running

A failed step is usually the app or the environment, not the automation. Re-running blindly
wastes takes and, in flows that write data, makes things worse. Check, in order:

1. **The captured `network.json`** — did the call fire, what did it return?
2. **Server logs / the database** — the UI message is often generic ("an error occurred")
   while the log has the real cause.
3. **Whether earlier runs caused it.** Flows that consume inventory, seats, quota, or
   one-time tokens fail on repeat for reasons that look like bugs. Repeated attempts can
   hold resources even when they fail, making each retry worse.

Test data also gets used up: an email that now has an account, a code already redeemed. If a
clean take needs a reset, prefer resetting the specific test record you created over
inventing new data that won't satisfy server-side validation.

## Producing the files

Playwright writes `.webm`. **The ffmpeg bundled with Playwright is stripped to VP8 and PNG
and cannot write mp4** — install a real ffmpeg. Ship both: `.webm` for the original, `.mp4`
(h264, `+faststart`) because it plays everywhere and is far smaller.

```bash
ffmpeg -y -i in.webm -c:v libx264 -preset veryfast -crf 26 \
       -pix_fmt yuv420p -movflags +faststart -an out.mp4
```

Give files ordered, self-describing names (`1-rental-la-habra.mp4`), put them somewhere the
user can actually reach — on WSL that means a Windows-visible path like `/mnt/e/...`, not a
Linux-only temp dir — and report duration and size so they know what they're about to open.

One flow per video. A viewer wants to scrub to the part they care about, not hunt through a
ten-minute reel.

## Reporting honestly

State what the recording actually shows. If a take ends on an error, say where and why, and
separate the cause from the thing being demonstrated: "the recording ends on a stock error
because the test facility ran out of inventory after earlier runs — the completed rentals
this report is based on are X and Y." A video published without that note will be read as
the feature being broken.

Also disclose, briefly: anything stubbed, any test record you deleted or reset, and any
side effects left behind in a shared environment. Screenshots and `network.json` sit
alongside the video for exactly this — stills for a ticket, payloads as evidence that the
right request was sent.

---
name: co-driven-browser
description: Request a shared, human-controllable browser session ("co-driven browser") when a browser task hits a human-only step — login, MFA, CAPTCHA, Cloudflare challenge, payment — or when the operator should watch/assist. Use when your normal headless browser MCP gets stuck on a step only a human can complete, or the issue explicitly asks for operator supervision. Do NOT use for fully-automatable steps — allocate a session only when you actually need a human.
---

# Co-Driven Browser Skill

Lets an operator take over YOUR browser mid-task instead of you failing the
step or fabricating evidence. You and the operator share the same Chromium
instance: you drive it over CDP, the operator can watch it live (and, when
you ask, take the wheel) through a noVNC stream in their browser.

## When to use

- A login, MFA code, CAPTCHA, or Cloudflare "prove you're human" challenge
  blocks the flow and you have no other way through it.
- A payment or other high-stakes step where the operator should watch or
  personally confirm before it's submitted.
- The issue explicitly asks for operator supervision on a browser task.

**Anti-patterns:**
- Don't request a session for steps you can automate — use your normal
  headless browser MCP for everything else. This is a shared, capacity-
  limited resource.
- Don't leave a session allocated after you're done — always release it
  (see below), even if the task failed.
- Don't loop retrying `request-handoff` if the feature is off for this
  company (see the 403 case below) — fall back or escalate instead.

## 1. Request a shared session

```http
POST /api/companies/{companyId}/browser-sessions
Authorization: Bearer $PAPERCLIP_API_KEY
Content-Type: application/json

{
  "requestedBy": "agent",
  "reason": "Login form requires an MFA code I can't complete"
}
```

Include `"issueRef": "SPL-42"` (your current issue's identifier) when you
have one — it's how the platform later auto-injects the CDP endpoint into
your run (see step 2), and it's what shows up in the operator's takeover
link.

Response (`201`):

```json
{
  "id": "sess-abc123",
  "novncUrl": "/browser/s/<token>",
  "cdpEndpoint": "ws://127.0.0.1:9001",
  "expiresAt": 1730000000000
}
```

The session expires on its own (default TTL ~15 min) if never released —
but don't rely on that; always release explicitly when you're done (step
4).

## 2. Drive it over CDP

The shared Chromium's CDP endpoint is auto-injected into your run as the
`PAPERCLIP_BROWSER_CDP_ENDPOINT` environment variable — but only once
there's a *live* browser session linked to the *issue your run is working*.
Point your browser MCP (playwright / chrome-devtools) at it with
`connectOverCDP` instead of letting it launch its own headless browser:

```js
await chromium.connectOverCDP(process.env.PAPERCLIP_BROWSER_CDP_ENDPOINT);
```

Driving the same CDP endpoint (rather than your own headless instance) is
what lets the operator see — and later take over — the exact page you're
on. If `PAPERCLIP_BROWSER_CDP_ENDPOINT` isn't set on this run, the session
either isn't linked to this issue yet or hasn't gone live — fall back to
your normal headless browser for now rather than blocking.

## 3. Hand off for a human step

When you hit the step you can't do yourself:

```http
POST /api/browser-sessions/{id}/request-handoff
Authorization: Bearer $PAPERCLIP_API_KEY
Content-Type: application/json

{
  "reason": "Stuck on the MFA code prompt — need the operator to enter it",
  "startUrl": "https://admin.example.com/login"
}
```

**Send `startUrl`, and navigate the browser there before you hand off.** The
reason says what to do; `startUrl` says where. Without it the operator arrives
at a blank tab and has to reconstruct your navigation before they can start —
the report was "I have no idea what has to be done". Give them the exact page
you got stuck on.

This flips the session to `awaiting_operator`, notifies the operator, and
puts a "Take over browser" item in their inbox; when the operator clicks
"Open" the UI mints a fresh tokenized noVNC URL for them (the raw token is
never stored or listed). Then **poll** until they're done:

```http
GET /api/browser-sessions/{id}
Authorization: Bearer $PAPERCLIP_API_KEY
```

Watch `status` — it goes back to `"live"` once the operator clicks "I'm
done" in the browser view. Poll on a reasonable interval (a few seconds);
don't busy-loop.

## Handoff modes (set by governance, not by you)

The session's `handoffMode` is resolved from company/project governance at
allocation time — you don't choose it. It changes what you should do AFTER
calling `request-handoff`:

- **`pause_notify_resume`** (default): stay in your run and **poll**
  `GET /api/browser-sessions/{id}` until `status` is `"live"` again, then
  continue. Best for short operator steps.
- **`durable_defer`**: **end your run** right after `request-handoff` —
  do NOT poll (the operator may take a long time / be away). Paperclip
  re-wakes you automatically on the same issue once the operator clicks
  "I'm done", and your CDP endpoint is re-injected so you resume against the
  same browser. When you're re-woken, check the session `status` is `"live"`
  before continuing.
- **`live_codrive`**: the operator can watch/assist at any time; you keep
  working. Only call `request-handoff` for a genuinely blocking human step
  (and then behave like `pause_notify_resume` for that one step).

If you're unsure which mode is active, treat a resume that doesn't arrive
within a few minutes as `durable_defer` and end your run rather than
polling forever.

## 4. Always release when finished

```http
POST /api/browser-sessions/{id}/release
Authorization: Bearer $PAPERCLIP_API_KEY
Content-Type: application/json

{ "reason": "Task complete" }
```

Release frees the broker slot for other sessions and wipes the browser
profile. Do this even if the task failed or you're abandoning it — an
un-released session sits on a limited resource until its TTL expires.

## Feature gating

Co-driven browser is company-gated
(`agentGovernanceSettings.browserCoDriveEnabled`). If it's off, the
allocate call returns `403` with `code: "BROWSER_CODRIVE_DISABLED"`. Treat
that as "not available here" — don't retry, don't loop. Fall back to
whatever you'd normally do when a step is un-automatable (escalate via a
comment, mark the issue blocked, or request-handoff-equivalent through
whatever governance path your project uses), and don't fabricate evidence
that you completed the step.

## Operator-initiated sessions

An operator can also request a session from operator chat
(`paperclip_request_browser_session`) — e.g. "open a browser so I can log
into the vendor portal myself." If you're the agent assigned to the linked
issue, you'll pick up the same session automatically via
`PAPERCLIP_BROWSER_CDP_ENDPOINT` on your next run (step 2) — you don't need
to allocate your own.

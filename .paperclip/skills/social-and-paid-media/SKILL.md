---
name: social-and-paid-media
description: Use when publishing to social media (organic) or planning, creating, or monitoring PAID advertising campaigns. Covers the Postiz MCP for publishing to connected channels (X, LinkedIn, Instagram, Facebook, YouTube, Bluesky, Mastodon, Google Business Profile, etc.) and the paperclip-ads MCP for Google Ads + LinkedIn paid campaigns under a hard per-product monthly spend cap. Triggers: post, publish, schedule, social media, ad campaign, paid media, test budget, Google Ads, LinkedIn Ads, sponsored content.
metadata:
  type: reference
---

# Social & Paid Media

You can publish organic social posts and run **paid** ad campaigns directly,
through two built-in MCP servers that are auto-injected into your run **when the
company has them connected**. Use this skill whenever a task involves posting to
social media, or planning / creating / monitoring paid advertising.

## Per-channel character limits (MANDATORY — one variant sized PER channel)

A single shared caption **overflows the tighter channels**, and Postiz flags that
variant in red (`NNN/limit`) — **that channel silently won't publish**. Postiz
supports **per-channel content**: when a post targets multiple channels, write or
trim a variant that fits **each channel's own max** so **ALL** selected channels go
out. Always check the count against the target channel; trim hashtags first when tight.

| Channel | Max characters |
|---|---|
| X / Twitter | **280** |
| Bluesky | **300** |
| Threads | 500 |
| Mastodon | 500 |
| Google Business Profile | 1,500 |
| Discord | 2,000 |
| Instagram | 2,200 |
| LinkedIn | 3,000 |
| Telegram | 4,096 |
| YouTube (community / description) | ~5,000 |
| Facebook | 63,206 |
| Dev.to | no hard limit (article body; needs a title + up to 4 tags + canonical URL) |

Rule of thumb: draft the **X/Bluesky** variant first (shortest, ≤280), then expand
with more context for LinkedIn / Dev.to. Keep the link + key hashtags **inside** the
limit. Never submit a variant that exceeds its channel max.

## Channels that REJECT a text-only post (measured, not theoretical)

Character count is not the only constraint, and treating it as the only one is
why three channels have **never published a single post**. Measured against the
live Postiz instance on 2026-08-15:

| Channel | Result | What Postiz actually returned |
|---|---|---|
| **Instagram** | 0 published / 12 errors | `error_subcode 2207087` — *"Children Field is empty for Carousel Media Upload. The children field should not be empty when the media type is Carousel."* |
| **YouTube** | 0 published / 13 errors | `Invalid URL` |
| **Bluesky** | 1 published / 5 errors | *"grapheme too big (maximum 300, got 501)"* |

- **Instagram requires an image or video. Always.** A caption alone cannot post,
  no matter how far under 2,200 characters it is. If you have no image, do not
  target Instagram — say so instead of queueing a post that cannot succeed.
- **YouTube requires a video.** It is not a text channel. The ~5,000 figure above
  is the *description* limit, which only applies to an actual upload.
- **Bluesky's 300 is graphemes, and it is hard.** Posts went out at 358, 388,
  394 and 501. The limit above was already documented and still exceeded — count
  before submitting, do not estimate.

**Nothing enforces any of this.** Postiz accepts the post and fails
asynchronously, and its channel list keeps reporting the channel as connected
(`disabled=false`), so a failed post looks like a sent one. The only signal is
the post's `state` on `/SPL/social-media` — check it after publishing rather than
assuming success.

If a tool you expect isn't present, the company hasn't connected that surface yet
— say so rather than improvising; the operator wires it up in **Settings → Social
Media (Postiz)** and **Settings → Paid Media**.

## 1. Organic social — the `postiz` MCP

Publishing goes through Postiz. The `postiz` MCP server exposes tools to **list
connected channels** and **publish or schedule** posts.

- **List the postiz tools first** (and list integrations/channels) to see the
  exact tool names and which channels are actually connected — do not assume.
- Connected channels vary per company but commonly include X, LinkedIn,
  Instagram, Facebook, YouTube, Bluesky, Mastodon, and Google Business Profile.
- Respect each platform's norms (length limits, hashtags, image specs). When a
  content calendar exists, **schedule** rather than blast everything at once.

## 2. Paid media — the `paperclip-ads` MCP

Run Google Ads + LinkedIn Ads campaigns under a **hard per-product monthly spend
cap** (default **$100/product/month**) that is enforced server-side on every
create — it cannot be exceeded or bypassed. Tools:

- `ads_list_connections` — which platforms are connected (`google_ads`,
  `linkedin_ads`) and their account IDs. **Call this first.**
- `ads_list_campaigns` — list live campaigns with metrics for a platform. Use it
  to understand current state before changing anything.
- `ads_create_campaign` — create a campaign with a monthly budget. Keep
  `monthly_budget` at or under the remaining room under the cap.

Discover the actual connected ad accounts at runtime via `ads_list_connections`
— never hardcode account IDs.

## Spend discipline (real money — non-negotiable)

1. **Read before you write:** `ads_list_connections` → `ads_list_campaigns` to
   understand current spend before creating anything.
2. **Never exceed the cap.** The server rejects over-cap creates; do not try to
   work around it (no splitting across campaigns to evade it).
3. **Spend changes are governed actions** — they go through the approval gate and
   are activity-logged. Get operator approval before launching paid spend; do not
   enable real spend on your own initiative.
4. If a call fails (auth / permission / API-version), **report the error** — do
   not retry blindly or fabricate results.

## When to use

- "Publish / schedule / post this" → `postiz` MCP.
- "Run / set up / monitor a paid campaign", "test budget", "sponsored" →
  `paperclip-ads` MCP (after operator approval for spend).
- "How are we performing?" → `ads_list_campaigns` + Postiz analytics.

## Ownership

Marketing leadership (e.g. a CMO) sets strategy and **approves spend**; a
marketing specialist executes. If you are neither and a task lands here, delegate
to or coordinate with the marketing role rather than spending directly.

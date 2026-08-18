---
name: pm-meeting-digest
description: Turn a meeting transcript into minutes, a decisions record and an owner-and-date action table — then create only the actions as Paperclip issues, never the discussion.
---

# PM Meeting Digest

Adapted from UNIPDS Module 6. A transcript is not a record; it is raw material. Produce the four
things a reader actually needs and drop everything else.

---

## 1. The four outputs

1. **Summary** — 5 lines maximum. What was the meeting *for*, and did it get there?
2. **Decisions** — what was actually decided, by whom. Only decisions, not leanings.
3. **Actions** — task · owner · due date. **Every row needs all three.**
4. **Open/unresolved** — raised and not settled. This is the row people skip and then relitigate.

## 2. An action without an owner is not an action

```
ACTION                              OWNER      DUE         SOURCE
Fix the staging cert                Andy G.    2026-08-06  14:22 "I'll sort the cert"
Decide on the Stripe migration      —          —           ⚠ NO OWNER — needs assignment
```

**Never invent an owner or a date to make the table look complete.** A row marked `⚠ NO OWNER` is
useful — it tells the operator a decision did not actually land. A row with a plausible owner nobody
agreed to is worse than a blank: it will not get done *and* nobody will notice, because the table
looks finished.

## 3. Distinguish a decision from a discussion

> "I think we should probably move to Postgres at some point" — **not** a decision.
> "We're moving to Postgres before the October release; Mirna owns it" — a decision.

If it lacks an owner, a commitment, or a timeframe, it belongs in **open/unresolved**. Promoting
discussion to decision is the fastest way to make minutes untrustworthy, and once a team stops
trusting minutes they stop reading them.

## 4. Writing into Paperclip

```
POST /api/companies/{companyId}/issues     # ONE per action, never per topic
```

- Only **actions** become issues. Decisions and discussion go in a document; an issue for a topic
  nobody owns is a silent stall waiting to happen.
- Put the **verbatim quote and timestamp** in the issue body. "Because it was said in the meeting" is
  not traceable; a line reference is.
- An action with no owner does **not** get created assigned to a random agent. Create it assigned to
  the **operator**, or leave it in the digest — see [[terminated-agent-silent-stall]] for what
  ownerless work actually does.
- Link the digest document to the project so the next meeting starts from the last one.

## 5. What NOT to do

- **Do not summarise the discussion.** Nobody re-reads who said what. Decisions and actions are the
  product.
- **Do not create an issue per agenda item.** That is how a 40-minute meeting becomes 12 issues nobody
  closes.
- **Do not silently drop unresolved items** because they are awkward. That list is the reason the same
  argument does not happen twice.
- **Do not attribute a decision to someone who was not in the room.** Check the attendee list before
  putting a name on an action.

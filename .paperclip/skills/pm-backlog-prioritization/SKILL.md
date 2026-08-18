---
name: pm-backlog-prioritization
description: Rank a backlog with RICE and WSJF anchored to the project's stated goal, scoring from Paperclip's own issue data and flagging every value that was guessed rather than derived. Replaces "priority: high", which carries no reasoning anyone can argue with.
---

# PM Backlog Prioritization

Answer *"what should we do next, and why"* with a **defensible ranking**, not a label.
Adapted from UNIPDS Module 2, with inputs taken from Paperclip's own issues instead of pasted stories.

**`priority` is not a prioritisation.** It is one of four words, set once by whoever filed the issue,
never revisited, and it encodes no reasoning. Two people reading `high` cannot tell whether it means
"large revenue", "the client shouted", or "it was Tuesday". A score you can argue with beats a label
you cannot.

---

## 1. Inputs — query, never ask

```
GET /api/companies/{companyId}/issues?projectId={id}     # the candidate set
GET /api/companies/{companyId}/projects/{id}             # goal, targetDate, stack
GET /api/companies/{companyId}/goals                     # the OKR to anchor Impact against
GET /api/companies/{companyId}/dashboard/cycle-time?days=90   # for Effort in real days
```

Score only what is **not** in `done` / `cancelled`. Ranking closed work is noise.

---

## 2. RICE — and where each number honestly comes from

```
RICE = (Reach × Impact × Confidence) / Effort
```

| Factor | Derive it from | Never |
|---|---|---|
| **Reach** | users/clients affected per period, from the project's own client or stakeholder count | invent a number "for scale" |
| **Impact** | the project's **goal or OKR** — 3 massive · 2 high · 1 medium · 0.5 low · 0.25 minimal | your feelings about the feature |
| **Confidence** | evidence you actually have: 100 % measured · 80 % stakeholder-stated · 50 % inferred | 100 % because it seems obvious |
| **Effort** | `estimatedMinutes` where set; otherwise the project's **median cycle time** for similar issues | a number that makes the ranking come out how you want |

**Confidence is where this goes wrong.** It is the only factor that describes *you* rather than the
work, and it is the one people quietly set to 100 % to move something up. If you cannot name the
evidence, it is not above 50 %.

## 3. WSJF — for the sequencing question RICE cannot answer

```
WSJF = Cost of Delay / Job Size
Cost of Delay = business value + time criticality + risk-reduction/opportunity
```

RICE ranks by value-per-effort. WSJF asks *what gets worse if we wait* — a security fix with modest
reach and a compliance deadline outranks a bigger feature with no clock on it. **Run both. Where they
disagree, say so and explain which question matters here** — that disagreement is usually the most
useful line in the output.

## 4. Flag every guessed input. This is the deliverable, not a footnote.

A ranking whose inputs were invented looks exactly like one derived from data, and it will be
executed either way. So each row carries its weakest link:

```
SPL-3312  RICE 42.0  WSJF 8.5   ⚠ Reach GUESSED (no client count on project)
SPL-3298  RICE 38.4  WSJF 12.1  ✓ all factors derived
SPL-3401  RICE 91.2  WSJF 3.2   ⚠ Confidence 100% with no cited evidence
```

**If more than half the rows carry a ⚠, say the ranking is not yet decision-grade** and name the one
input that would fix the most rows. That is more useful than a confident order built on nothing.

## 5. Output

```
## Backlog ranking — <project> (<date>, n=<scored> of <total open>)

Anchored to: <goal/OKR, verbatim>

RANK  ISSUE     TITLE                    RICE   WSJF  FLAGS
1     SPL-3298  Fix checkout 500s        38.4   12.1  ✓
2     SPL-3312  Bulk export              42.0    8.5  ⚠ Reach guessed
...

**Disagreements:** SPL-3312 leads on RICE but trails on WSJF — it is valuable but nothing
worsens by waiting. Sequence after SPL-3298 unless the client has a stated date.

**Not decision-grade yet:** 6 of 11 rows lack a real Reach. Adding a client count to the
project would resolve all six.
```

## 6. What NOT to do

- **Do not reorder to match a conclusion.** If someone dislikes the ranking, the answer is a better
  input — not a different Confidence.
- **Do not score across projects.** Reach and Impact mean different things per product; a pooled
  ranking ranks nothing.
- **Do not silently drop unscoreable issues.** Count them: *"n=11 of 19 scored; 8 lack any effort
  signal"*. A ranking of the half you could measure, presented as the backlog, is the same lie as a
  Gantt that hides undated work.
- **Do not write `priority` back from a score** without the operator saying so. The score is advice;
  the field is a commitment.

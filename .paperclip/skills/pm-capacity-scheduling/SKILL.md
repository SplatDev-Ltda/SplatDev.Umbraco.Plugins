---
name: pm-capacity-scheduling
description: Build a sprint schedule from real capacity rather than headcount — discounting ceremonies and overhead, ordering by dependency, and stating plainly when the plan does not fit the time available.
---

# PM Capacity & Scheduling

Adapted from UNIPDS Module 3. Answers *"can this be done by then, and in what order"* — the question
a Gantt chart displays but never actually answers.

**Nominal capacity is a lie.** A "10-day sprint" is not 10 days of work. Ceremonies, review, context
switching and interruptions are real and predictable, and a plan built on nominal capacity is
overcommitted before it starts.

---

## 1. Real capacity

```
real capacity = nominal × 0.65
```

The 0.65 comes from the module and matches what this fleet actually delivers — **do not raise it to
make a plan fit.** If the plan only works at 0.9, the plan does not work; say that instead of moving
the number that made it true.

Derive nominal from the project, not from a guess:

```
GET /api/companies/{companyId}/projects/{id}     # sprintDurationDays, batchSize, wipLimit
GET /api/companies/{companyId}/agents            # who is actually available
GET /api/companies/{companyId}/dashboard/burndown?days=90   # what the team REALLY closes per day
```

> **Prefer measured throughput over computed capacity.** If burndown says this company closes ~4
> issues/day and your capacity model predicts 11, the model is wrong, not the history. Say so and use
> the history — see `pm-forecasting`, which does exactly this and refuses when the sample is too thin.

**Exclude agents that cannot run.** Paused, terminated, or provider-exhausted agents count for zero.
A schedule that allocates work to a paused agent produces silent stalls, not delivery
([[terminated-agent-silent-stall]]).

## 2. Order by dependency, then by risk

1. **Hard dependencies first** — B cannot start before A. Use `parentId` and issue links; where a
   dependency is only implied by prose, **flag it rather than assume it**.
2. **Then unblock others** — an issue that unblocks three should precede one that unblocks none, even
   at equal value.
3. **Then highest-risk-first within a sprint.** Discovering a hard problem in week 1 leaves room to
   react; discovering it in the final week does not.

## 3. Say when it does not fit — first, not last

If required effort exceeds real capacity, that is the headline, not a caveat at the bottom:

```
## Schedule — <project>

⚠ DOES NOT FIT. 6 sprints of work, 4 sprints before the target date.

Two levers:
  • cut scope — 14 issues must come out (lowest RICE first: SPL-…, SPL-…)
  • move the date — 2026-11-14 is the first date the current scope supports

Sprint 1 (capacity 26 pts real / 40 nominal)
  SPL-3298  Fix checkout 500s        8   ← unblocks SPL-3301, SPL-3305
  ...
```

Only **cut scope** or **move the date** are offered. "Add people" is not a lever the operator has
here, and on this fleet more concurrent agents has repeatedly made throughput *worse* — concurrent
builds have twice saturated host I/O and starved every container including production.

## 4. What NOT to do

- **Do not raise the 0.65** to make a plan fit. That is fitting the model to the answer.
- **Do not schedule to `wipLimit` capacity.** WIP limit is a ceiling for safety, not a target.
- **Do not plan work for paused or terminated agents.** Check `status` and `paused_at` first.
- **Do not present a schedule that does not fit as if it does**, with the shortfall implied by dates
  the reader has to compute themselves. State it in the first line.
- **Do not invent dependencies.** A wrong dependency serialises work that could have run in parallel
  and is invisible once it is in the plan.

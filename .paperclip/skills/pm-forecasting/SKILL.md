---
name: pm-forecasting
description: Probabilistic delivery forecasts (P50/P85/P95) from Paperclip's own historical cycle times using Monte Carlo simulation, always reported with the sample size behind them. Replaces single-date estimates, which are the least useful thing a forecast can produce.
---

# PM Forecasting

Answer *"when will this be done?"* with a **distribution**, not a date. Adapted from UNIPDS Module 4
(PERT + Monte Carlo), with the inputs taken from Paperclip's real history instead of pasted values.

**A single date is the least useful forecast available.** It is wrong almost always, and it carries
no information about how wrong. P50/P85/P95 tells the operator what they actually need: how much
buffer buys how much certainty.

---

## 1. Inputs — query, never ask

```
GET /api/companies/{companyId}/dashboard/cycle-time?days=90
    -> { avgCycleSeconds, medianCycleSeconds, totalClosed }
GET /api/companies/{companyId}/dashboard/burndown?days=90
    -> { data: [{ date, opened, closed }] }     # throughput per day
GET /api/companies/{companyId}/issues?projectId={id}
    -> remaining scope (count what is NOT in done/cancelled)
```

For a per-issue cycle-time *distribution* (better than a single median), derive it from the activity
log's transition history — `action='issue.updated'`, `details->'_previous'->>'status'` — see
`pm-flow-metrics` §1.

---

## 2. Monte Carlo — the method

Do **not** divide remaining work by average velocity. That produces one date and hides all variance.

```
for each of 10_000 trials:
    remaining = <open issue count>
    days = 0
    while remaining > 0:
        # sample an ACTUAL historical day's throughput, with replacement
        remaining -= sample(historical_daily_closed)
        days += 1
    record(days)

P50 = 50th percentile of days    # coin flip
P85 = 85th percentile            # the one to commit to
P95 = 95th percentile            # the one to promise a client
```

Sampling **real historical days** — including the zero-throughput ones — is what makes this honest.
Weekends, outages and stuck days are already in the data; smoothing them out is how forecasts become
optimistic.

## 3. Report the sample size. Every time.

**This is not optional and it is the main way this skill can mislead.**

A P85 from 6 data points and a P85 from 600 are not the same claim, and they look identical once
written as a date. Always:

```
P85: 2026-09-12  (n=63 closed, 90d window)
```

Refuse to forecast below a sample that can support it. **Under ~10 historical closures, say so and
stop** — "not enough history to forecast; N closures in the window" is a useful answer. A confident
date from 4 data points is worse than no date, because it will be planned against.

> **This rule is implemented, not just documented: `/analytics/forecast`.** The threshold lives in
> `MIN_SAMPLE` in `ui/src/lib/forecast.ts`, which refuses below **10 closed-work days AND 10
> closures** and renders the refusal instead of numbers.
>
> **That file is the authority for the number — this paragraph is not.** If you ever need to state the
> threshold, read it there rather than quoting "~10" from here, or the two drift apart and the skill
> starts describing a system that no longer behaves that way.
>
> The page is company-scoped, because `/dashboard/burndown` has no `projectId` filter. **A per-project
> forecast is still yours to produce** — and §"Do not mix projects" below is exactly why the page did
> not fake one.

## 4. When the forecast is bad news

Say it plainly and first. If P85 lands after the committed date, the report opens with that, not with
methodology. Then give the operator the two levers that actually exist:

- **cut scope** — how many issues must come out to hit the date at P85
- **move the date** — what date P85 actually supports

Do not offer "add people". It is not a lever the operator has here, and on this fleet it is often
counterproductive.

## 5. PERT — for a single unestimated task

When there is no history (a genuinely new kind of work), fall back to three-point:

```
expected = (optimistic + 4 x mostLikely + pessimistic) / 6
stdDev   = (pessimistic - optimistic) / 6
```

**Label it an estimate, not a forecast.** It is a judgement with arithmetic applied, and it inherits
whatever bias produced the three inputs. Prefer historical simulation whenever any history exists.

## 6. What NOT to do

- **Never report a single date without its percentile.** "Done by the 12th" is not a forecast.
- **Never forecast without stating n.**
- **Do not re-forecast to match a desired date.** If someone dislikes P85, the answer is scope or
  date — not a new model.
- **Do not mix projects.** Cycle times differ by an order of magnitude between a docs task and a
  .NET migration; a pooled distribution forecasts neither.
- **Do not present the mean.** Use the median and percentiles; the mean is dragged by the tail
  (live: mean 33 h vs median 3.7 h).

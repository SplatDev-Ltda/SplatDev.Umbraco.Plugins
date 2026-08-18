---
name: pm-flow-metrics
description: Detect flow anomalies before they become crises — aging WIP, stalled issues, throughput collapse, rework loops — using Paperclip's dashboard endpoints and the status-transition history in the activity log. Compares against the project's own history, never fixed constants.
---

# PM Flow Metrics

AIOps for the board: find the anomaly while it is still cheap. Adapted from the UNIPDS Module 5
*Risk Monitor* technique, which asks a human to paste Jira Control Chart exports — **Paperclip holds
all of this already**, so query it.

---

## 1. Where the numbers actually live

> **Check `/analytics` before computing anything.** A lot of this already exists as operator pages —
> issue funnel, cycle time, blocked patterns, cost forecast — plus `/analytics/portfolio`,
> `/analytics/gantt` and `/analytics/forecast`. **Recomputing what a page already shows is wasted
> output**, and worse, it produces a second number the operator has to reconcile with the first.
> Your value is the part no page holds: *why* a number moved, and whether the artifact behind it
> actually exists.

Two sources. Use both; they answer different questions.

### Dashboard API — aggregates, already computed

```
GET /api/companies/{companyId}/dashboard/cycle-time?days=30
    -> { avgCycleSeconds, medianCycleSeconds, totalClosed }
GET /api/companies/{companyId}/dashboard/burndown?days=30
    -> { data: [{ date, opened, closed }] }        # throughput, both directions
GET /api/companies/{companyId}/dashboard/project-health
    -> per project: completionPercent, isOverdue, open/inProgress/blocked/done counts
GET /api/companies/{companyId}/dashboard/operational-verdict
    -> successRatePercent + run counts by state
```

### Activity log — the transition history the aggregates cannot give you

**This is the part people miss.** Status changes are recorded on `activity_log` rows with
`action = 'issue.updated'`, and the detail carries both sides:

```json
{"source":"comment","status":"needs_rework","_previous":{"status":"in_progress"},"identifier":"SPL-3280"}
```

So *time in a specific status*, *rework loops*, and *when an issue entered its current state* are all
derivable — `details->>'status'`, `details->'_previous'->>'status'`, `created_at`.

> Do **not** use `issues.updated_at` as "time in status". It moves on *any* edit — a comment, a label,
> a reassignment — so every in-flight issue looks freshly touched. Measured 2026-07-31: it reports
> `in_review` averaging **0.1 days**, which is an artefact, not a fact. Use the last transition INTO
> the current status from the activity log.

---

## 2. The four anomalies worth alerting on

Ranked by how expensive they get if missed.

### A. Aging WIP — an issue sitting in one status
The single most useful signal. Compute *time since the last transition into the current status*.
Flag anything in a non-terminal status past **2× the project's own median** for that status.

### B. Rework loops — the same issue bouncing
Count transitions into `needs_rework` per issue. **Two or more is a signal, not bad luck**: the
acceptance criteria are unclear, or the reviewer and author disagree about scope. Escalate to the
issue, not to the agent — a third attempt usually fails the same way.

### C. Throughput collapse — `closed` falling while `opened` holds
From `/burndown`. Compare the trailing 7 days against the previous 7. A sustained gap means the
backlog is growing regardless of how busy everyone looks. **Check for a provider/adapter outage
before concluding anything about the team** — on 2026-07-31 the entire fleet stopped on an exhausted
OpenCode balance, and that presents exactly as throughput collapse.

### D. Blocked-count drift
`blockedIssueCount` rising across consecutive checks. A blocker older than 3 days with no comment is
nobody's ball — say whose it should be.

---

## 3. Thresholds come from the project's own history

Never a fixed constant. "Cycle time > 5 days is bad" is meaningless across a docs task and a .NET
migration.

1. Establish the project's baseline over a window with enough closures to mean something.
2. Flag deviation from *that*.
3. **Report the sample size next to every threshold.** A median over 6 closed issues is not a
   baseline; say so rather than dressing it up.

**Use the median, not the mean.** Live figures diverge ~9× (median 3.7 h vs mean 33 h) because a few
long-lived issues drag the mean. Quoting the mean would make a healthy team look broken.

---

## 4. Output format

```
## Flow check — <project> (<window>, n=<closed count>)

🔴 Aging WIP
  SPL-xxxx  in_review 9d   (project median 1.2d, n=34)
🟡 Rework loop
  SPL-xxxx  -> needs_rework x3   ← criteria are unclear, fix the issue not the agent
🟢 Throughput   14 closed / 12 opened (prev 7d: 11/13) — keeping up

Baseline: median cycle 3.7h (n=718, 30d)
```

Then **one** recommended action. A list of five is a list of zero.

## 5. What NOT to do

- **Do not report an anomaly without its baseline.** "Cycle time is 9 days" is not actionable;
  "9 days against a 1.2-day median over 34 issues" is.
- **Do not alert on every deviation.** An alert that fires constantly gets muted, and then the real
  one is invisible too. If everything is amber, your threshold is wrong.
- **Do not infer intent from metrics.** Falling throughput is a *measurement*. It could be an outage,
  a hard problem, or one big task. Say what you measured and what you checked, then ask.
- **Do not treat `completionPercent` as delivery.** It counts closures, and issues close at the
  handoff — see `agent-run-discipline` §5b.

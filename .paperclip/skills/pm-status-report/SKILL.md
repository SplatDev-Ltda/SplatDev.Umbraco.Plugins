---
name: pm-status-report
description: Generate three audience-calibrated status reports (technical, manager, executive) from one set of Paperclip data. Pulls real numbers from the dashboard and issue APIs instead of asking anyone to paste them, and states explicitly when a figure is missing rather than estimating it.
---

# PM Status Report

Turn one dataset into **three** reports. The same sprint, told three ways, because a developer, a
project manager and an executive need different vocabulary, different detail, and are making
different decisions.

Adapted from the UNIPDS *Ferramentas de IA para Gestão de Projetos* Module 7 status-report technique.
**The source template asks a human to paste Jira exports into a `[PREENCHER]` block. Do not do that
here.** Paperclip already holds this data; every figure below has a query. Asking the operator for
numbers the control plane can answer is how fabrication starts.

---

## 1. Pull the data first — never write from memory

> **Link the page, don't transcribe it.** `/analytics/portfolio` (RAG per project),
> `/analytics/gantt` (schedule, exportable as SVG/CSV) and `/analytics/forecast` (P50/P85/P95) render
> this data for the operator already. Cite them and spend the report on judgement — risks, decisions
> needed, what a green number is hiding. A status report that restates a dashboard the reader can
> open is pure cost.

All endpoints are company-scoped. `?days=N` defaults to 30 where supported.

| What | Endpoint | Gives you |
|---|---|---|
| Throughput / flow | `GET /api/companies/{companyId}/dashboard/burndown?days=14` | `data[]` of `{date, opened, closed}` |
| Cycle time | `GET /api/companies/{companyId}/dashboard/cycle-time?days=30` | `avgCycleSeconds`, `medianCycleSeconds`, `totalClosed` |
| Per-project state | `GET /api/companies/{companyId}/dashboard/project-health` | `completionPercent`, `isOverdue`, `targetDate`, open/inProgress/blocked/done counts |
| Fleet health | `GET /api/companies/{companyId}/dashboard/operational-verdict` | `successRatePercent`, run counts by state |
| Cost | `GET /api/companies/{companyId}/dashboard/cost-trend` · `/cost-by-model` | spend over time and by model |
| Per-agent load | `GET /api/companies/{companyId}/dashboard/tasks-by-agent` | who is carrying what |
| The issues themselves | `GET /api/companies/{companyId}/issues?projectId={id}` | plain array; `limit` is **ignored** — filter client-side |

**Report `medianCycleSeconds` as the headline, not `avgCycleSeconds`.** They diverge wildly here
(2026-07-31: median ~3.7 h vs mean ~33 h) because a handful of long-lived issues drag the mean. Quote
the median, and mention the mean only to make the point that the tail is long.

## 2. Rules that apply to all three reports

1. **Never invent a number.** If an endpoint returns nothing, write *"not measured"* — never an
   estimate that reads like a measurement.
2. **Quote the window.** "12 closed" is meaningless; "12 closed in the last 14 days" is a fact.
3. **Percent-done is not a delivery signal.** `completionPercent` counts issues closed, and issues
   close at the handoff. Corroborate with something you can look at — a merged PR, a live URL, a
   file. Where they disagree, say so; that disagreement is usually the most useful line in the report.
4. **Name what is blocked and whose ball it is.** `blockedIssueCount` alone is a number, not
   information. See `agent-run-discipline` §5b for the ball-ownership model.
5. **Bad news goes at the top**, in the first two sentences, in every variant. A status report that
   buries the slip is worse than no report — it spends trust to delay a conversation by one cycle.

---

## 3. Report 1 — Technical team

**Audience:** developers, QA, tech leads · **Length:** 150–250 words
**Language:** metrics and component names. Cycle time, WIP, throughput, specific issue identifiers.
**Focus:** what shipped, what did not, why, and what the team should change next cycle.

```
## Sprint status — <project> (<window>)

Closed <N> issues (<N> in review, <N> blocked). Median cycle time <X>h
(mean <Y>h — the tail is <what causes it>).

Shipped: <SPL-xxxx short title> · <SPL-xxxx short title>
Not shipped: <SPL-xxxx> — <one clause on why, concretely>

Adjust next cycle:
- <specific, actionable — "split SPL-xxxx, it has been in_progress 9 days">
```

## 4. Report 2 — Manager / PM

**Audience:** project manager, coordinator, PMO · **Length:** 100–150 words
**Language:** risk and decision. RAG status against milestones.
**Focus:** current status, the single biggest risk, and **at most two** decisions needed.

```
## <project> — <🟢 on track | 🟡 at risk | 🔴 slipping>

Status: <one sentence, the slip first if there is one>
Milestone: <target date> — <on track | N days late>

Top risk: <one, the biggest, with its consequence>

Decisions needed:
1. <concrete and answerable — not "review the backlog">
2. <or "None this cycle">
```

**RAG rules — apply them, don't feel them.** 🔴 if `isOverdue` or a milestone will be missed on
current throughput; 🟡 if throughput is falling or a blocker is >3 days old; 🟢 otherwise. If you
mark 🟢 with an overdue `targetDate`, you have made an error.

## 5. Report 3 — Executive

**Audience:** CEO / owner · **Length:** **80 words maximum**
**Language:** outcomes and money. No issue identifiers, no tooling names, no process detail.
**Focus:** are we getting what we are paying for, and is anything needed from them?

```
<Project/portfolio> is <ahead | on track | N weeks late>.
<The one thing that matters this week, in plain words.>
Spend: <$X> over <window>.
Needs you: <one item, or "Nothing.">
```

If the honest executive summary is *"three of five projects are late and here is the one reason"*,
write that. Padding it costs the operator the ability to act.

---

## 6. Delivering it

- **Technical + manager** → a comment on the project's or sprint's issue.
- **Executive** → the stakeholder share link (`skills/paperclip-stakeholders`), which already gives
  a token-gated page with optional password and expiry. Do not invent a delivery mechanism.
- Attach the raw JSON you pulled, or name the endpoints and window, so any figure can be re-derived.
  A report nobody can check is an opinion.

## 7. What NOT to do

- Do not ask the operator for numbers you can query.
- Do not write all three from one template with the vocabulary swapped — **the length limits are the
  technique**. An 80-word executive summary forces the actual point out.
- Do not soften 🔴 to 🟡 because the number is embarrassing. The board already over-reports progress
  (percent-done counts closures, not deliveries); a status report that repeats that error is noise.

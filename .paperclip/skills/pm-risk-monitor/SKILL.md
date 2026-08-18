---
name: pm-risk-monitor
description: Predictive project risk (AIOps) from Paperclip's own flow metrics — turning trends into a named, owned risk register with triggers, rather than reporting an anomaly after it has already become a crisis.
---

# PM Risk Monitor (AIOps)

Adapted from UNIPDS Module 5. Sibling to `pm-flow-metrics`: **that skill detects an anomaly that has
happened; this one names the risk before it lands, and gives it an owner and a trigger.**

---

## 1. Inputs

```
GET /api/companies/{companyId}/dashboard/cycle-time?days=90
GET /api/companies/{companyId}/dashboard/burndown?days=90
GET /api/companies/{companyId}/dashboard/project-health
GET /api/companies/{companyId}/issues?projectId={id}      # blocked / needs_rework / stale
```

## 2. The five signals that actually precede trouble here

| Signal | Read it as | Why it matters on this fleet |
|---|---|---|
| Cycle time rising 3 periods running | work is getting harder or reviews are stalling | trend beats level — a stable-but-high number is a known cost; a rising one is a surprise coming |
| Throughput falling while WIP rises | starting more than finishing | the classic precursor to a missed date |
| Blocked count rising, blocked age growing | dependency or access problem nobody owns | blocked work raises no error and ages silently |
| `needs_rework` accumulating | quality or clarity problem upstream | see [[terminated-agent-silent-stall]] — unassigned rework never runs at all |
| Issues with no assignee, or an assignee that cannot run | silent stall | paused/terminated agents produce **zero** signal, not an error |

**Trend, not level.** A number that has always been bad is a constraint the team has priced in. A
number that changed last week is the one that will surprise someone.

## 3. A risk needs all five fields, or it is an observation

```
RISK-01  Checkout epic misses the 2026-09-01 date
  probability : HIGH — cycle time up 40% over 3 sprints, throughput down 25%
  impact      : client-committed date, contractual
  trigger     : if velocity stays <5/sprint through sprint 14, it cannot land
  owner       : Mirna S. (CTO)
  mitigation  : cut SPL-3401/3402 (lowest RICE), or move to 2026-09-22
```

**The trigger is what makes it a risk rather than a worry.** It states, in advance, the observable
that converts "we are watching this" into "we act now" — so nobody has to re-argue the judgement under
pressure later.

**An ownerless risk is not tracked, it is merely written down.** If you cannot name an owner, say the
risk is unowned and make *that* the finding.

## 4. Output

```
## Risk register — <project> (<date>, n=<sprints analysed>)

⚠ 2 HIGH · 3 MEDIUM · 1 realised since last report

RISK-01  [HIGH]  Checkout epic misses 2026-09-01
  ...

**Realised since last report:** RISK-04 (staging unavailable) — happened 07-30, cost ~2 days.
**Unowned:** RISK-06 has no owner. That is the finding, not a footnote.
```

Report **realised** risks explicitly. A register that only ever grows is a wish list; one that records
what actually happened is how the probability judgements get calibrated.

## 5. What NOT to do

- **Do not report an anomaly as a risk.** "Cycle time rose" is an observation. "The epic misses its
  date because cycle time rose, unless X by Y" is a risk.
- **Do not forecast without the sample size.** Same rule as `pm-forecasting`: state `n`, and refuse
  below ~10 closures rather than producing a confident number from four.
- **Do not raise a risk with no trigger.** It cannot be acted on and will be re-argued every week.
- **Do not treat a missing signal as a good signal.** Zero blocked issues on a project with zero
  throughput is not health — it is a project nobody is working on.

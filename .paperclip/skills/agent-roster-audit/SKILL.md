---
name: agent-roster-audit
description: "Audit and remediate a Paperclip agent roster for skill coverage gaps, role mismatches, duplicate agents, and structural org-chart issues. Applies fixes via API — skill syncs, role patches, task reassignments, and agent terminations."
domain: "agent-ops"
confidence: "high"
source: "extracted from SplatDev audit session 2026-05-25"
---

# Agent Roster Audit Skill

## Purpose

A Paperclip org degrades silently. Agents accumulate without skills, roles drift from their function, duplicates emerge as the team grows, and the skill library fills with tools that no one uses. This skill provides a repeatable audit methodology that finds these issues and applies targeted fixes through the API.

It is distinct from `optimize-agent`, which focuses on token waste _inside_ skill files. This skill focuses on the _roster_ — who exists, what they can do, and whether they're structured correctly.

---

## When to Run

- After any agent hiring wave
- When the org has grown beyond 10 agents
- When task routing is producing unexpected or failed assignments
- When "all agents paused" or budget anomalies appear
- When agents have no heartbeat activity for > 7 days

---

## Audit Workflow

### Step 1 — Gather Roster Data

```sh
GET /api/companies/$PAPERCLIP_COMPANY_ID/agents
GET /api/companies/$PAPERCLIP_COMPANY_ID/skills
```

Build a working table with one row per agent:

| Field | Source |
|-------|--------|
| id, name, role, title | agent object |
| status | agent.status |
| reportsTo | agent.reportsTo (resolve to name) |
| skills assigned | adapterConfig.paperclipSkillSync.desiredSkills |
| skill count | len(desiredSkills) |
| model | adapterConfig.model |
| lastHeartbeatAt | agent.lastHeartbeatAt |
| open issues | GET /api/companies/:companyId/issues?assigneeAgentId=:id&status=todo,in_progress,blocked,in_review |

### Step 2 — Run the Six Checks

Apply every check below. Record all findings before taking any action.

---

### Check 1 — Zero-Skill Agents (Critical)

**What:** Any agent where `desiredSkills` is empty or missing.

**Why this breaks things:** Skills are the primary mechanism for domain knowledge, workflow standards, and operating instructions. An unskilled agent runs on base model behavior only — no project conventions, no code standards, no guardrails. This is the single most common cause of agent failure.

**Special case — dedicated system skills:** If the agent has a `system` role or a title like "Monitor", "SysMon", or "Observer", check the company skill library for skills whose `name` contains `sysmon`, `monitor`, or `incident`. These are purpose-built and should be assigned immediately.

**Threshold:** Any count ≥ 1 is a critical finding.

**Fix:** Assign role-appropriate skills (see Role-to-Skill Matrix below). Use `POST /api/agents/:agentId/skills/sync`.

---

### Check 2 — Role Mismatch

**What:** An agent whose `role` field does not match their `title` or `capabilities`.

**Common patterns:**
- A triage/assistant agent with role `cto` or `ceo` when they report to someone in that role
- A `general` agent whose capabilities describe a specific domain (sales, CRM, marketing) — consider giving them a specific role for better dispatch
- An `engineer` role agent who only does non-code work (docs, admin, summaries)

**Why this breaks things:** Paperclip's CEO/manager delegation routes tasks by role. Incorrect roles cause tasks to route to the wrong agent or create ambiguous assignment.

**Fix:** `PATCH /api/agents/:agentId` with corrected `role` and optionally `title`.

Valid role values: `ceo`, `cto`, `cmo`, `pm`, `engineer`, `qa`, `devops`, `designer`, `general`, `system`.

---

### Check 3 — Duplicate Role/Capability Agents

**What:** Two agents with the same or near-identical role AND skill set AND capabilities description.

**Detection:** For each pair of agents sharing a role, compare:
1. Their `desiredSkills` arrays — identical or subset?
2. Their `capabilities` fields — keyword overlap > 60%?
3. Their open issue counts — both active or only one?

**Why this matters:** Duplicate agents split the task queue, inflate heartbeat costs, and produce ambiguous routing. Two QA agents with identical skills and no scope distinction serve no purpose.

**Fix options:**
1. **Merge:** Reassign all open issues from the redundant agent to the keeper. Terminate the redundant agent with `PATCH /api/agents/:agentId { "status": "terminated" }`.
2. **Differentiate:** If the duplication is intentional (different scope), assign different skills to make the distinction clear.

**Keeper selection:** Prefer the agent with the more accurate role enum value. If tied, prefer the one with more open issues (active one). If still tied, prefer the one created earlier.

---

### Check 4 — Skill Library Coverage Gaps

**What:** Skills in the company library that are clearly relevant to an agent's domain but not assigned.

**How to detect:** For each agent, compute keyword overlap between their `capabilities` text and the `description` field of each unassigned company skill. Flag any skill with > 2 domain keywords matching.

**Common patterns by role:**

| Role | Commonly missed skills |
|------|----------------------|
| engineer | `nopcommerce`, `umbraco`, `secret-handling`, `github-multi-account`, `git-workflow` |
| devops | `ci-validation-gates`, `release-process`, `secret-handling`, `paperclip-deploy-rules`, `github-multi-account` |
| qa | `reviewer-protocol`, `test-discipline` |
| pm | `project-conventions`, `release-process` |
| designer | `ui-ux-pro-max`, `svg-icon-generator`, `canvas-design`, `frontend-design` |
| general (outreach) | `external-comms`, `paperclip-crm-sales` |
| ceo | `paperclip-create-agent`, `squad-conventions` |
| cto | `squad-conventions`, `dotnet-fullstack-standards`, `dev-workflow` |
| system | `sysmon-incident-triage`, `sysmon-remediation-drafting`, `sysmon-approval-composition` |

**Fix:** Add missing skills via `POST /api/agents/:agentId/skills/sync` with the full updated `desiredSkills` array (existing + new). Never send a partial array — it replaces the full list.

---

### Check 5 — Homogeneous Skill Clusters

**What:** A group of 3+ agents with identical `desiredSkills` arrays where their roles suggest they should have different toolsets.

**Why:** This usually indicates skills were copy-pasted during agent creation without customization. It often masks deeper issues: agents with outreach skills but engineering roles, or agents without any domain-specific skill that differentiates them.

**Fix:** Audit each agent in the cluster against the Role-to-Skill Matrix and assign individually-appropriate skills.

---

### Check 6 — Stale or Terminated Agents Still Holding Open Issues

**What:** Agents with `status: terminated` or `status: paused` (for > 30 days) that still have open issues assigned.

**Fix:** Reassign open issues first, then terminate. Sequence matters — always reassign before terminating.

---

## Role-to-Skill Matrix

Use this as a baseline when filling in unskilled agents. Always include `paperclipai/paperclip/paperclip` as the first skill for every agent.

| Role | Required | Recommended |
|------|---------|-------------|
| ceo | `paperclip`, `paperclip-create-agent`, `squad-conventions` | `reskill` |
| cto | `paperclip`, `dotnet-fullstack-standards`, `dev-workflow`, `squad-conventions` | `architectural-proposals` |
| cmo | `paperclip`, `paperclip-email-imap`, `telephony-outbound-call`, `external-comms` | `paperclip-crm-sales` |
| pm | `paperclip`, `project-conventions`, `squad-conventions`, `release-process` | — |
| engineer | `paperclip`, `dotnet-fullstack-standards`, `dev-workflow`, `git-workflow` | `nopcommerce`, `umbraco`, `secret-handling`, `github-multi-account` |
| devops | `paperclip`, `ci-validation-gates`, `dev-workflow`, `git-workflow`, `release-process` | `secret-handling`, `paperclip-deploy-rules`, `github-multi-account` |
| qa | `paperclip`, `testing-standards`, `reviewer-protocol` | `test-discipline` |
| designer | `paperclip`, `ui-ux-pro-max` | `svg-icon-generator`, `frontend-design`, `canvas-design` |
| general (outreach) | `paperclip`, `paperclip-email-imap`, `telephony-outbound-call`, `external-comms` | — |
| general (admin/exec) | `paperclip`, `doc-coauthoring` | `squad-conventions` |
| system | `paperclip`, `sysmon-incident-triage`, `sysmon-remediation-drafting`, `sysmon-approval-composition` | — |

---

## Merge Decision Guide

Before terminating any agent, answer these questions:

1. **Does the agent have open issues?**
   - Yes → reassign them first. Plugin/implementation tasks → engineer. QA/test tasks → QA agent. Design tasks → designer.
   - No → safe to proceed.

2. **Does the role distinction serve task routing?**
   - Two QA agents with identical skills: merge. No routing benefit.
   - A "Web Designer" and a "Frontend Developer": evaluate. If one does specs/wireframes and the other does code, they may warrant separate agents with different skills.

3. **Which agent is the keeper?**
   - More accurate role enum value wins.
   - More open issues wins (the active one).
   - Earlier creation date wins if tied.

4. **Does the keeper need updated skills** to absorb the terminated agent's scope?
   - Yes → sync updated skills to keeper before terminating the other.

---

## API Sequence for a Full Fix

```sh
# 1. Identify open issues on agent to be terminated
GET /api/companies/:companyId/issues?assigneeAgentId=:agentId&status=todo,in_progress,blocked,in_review

# 2. Reassign each issue
PATCH /api/issues/:issueId
{ "assigneeAgentId": ":keeperAgentId", "comment": "Reassigned — :reason" }

# 3. Update keeper's skills to absorb scope
POST /api/agents/:keeperAgentId/skills/sync
{ "desiredSkills": [ ...existingSkills, ...newSkills ] }

# 4. Terminate the merged-away agent
PATCH /api/agents/:terminatedAgentId
{ "status": "terminated" }

# 5. Fix role on any mismatched agents
PATCH /api/agents/:agentId
{ "role": ":correctRole", "title": ":correctTitle" }
```

---

## Report Format

Post the audit findings as a comment with this structure:

```md
## Agent Roster Audit — <company name>
<date> · <N> agents · <N> skills in library

**Summary:** <N> critical findings · <N> warnings · <N> recommendations

---
### Critical — Zero-skill agents (N)
<table>

### Warning — Role mismatches (N)
<table>

### Warning — Duplicate agents (N)
<description and merge recommendation>

### Recommendation — Skill coverage gaps (N agents)
<table with agent, current skills, recommended additions>

---
## Proposed Changes
<numbered list of specific API actions>
```

Always post the report and wait for approval before applying any changes — unless the triggering task explicitly says "apply automatically" or "no approval needed".

---

## Constraints

- **Never terminate an agent with open issues.** Reassign first, always.
- **Never retry a 409 on checkout.** Skip and move on.
- **Never remove the core `paperclip` skill** from any agent — it is the base skill that gives the agent its identity and task loop.
- **Skill sync replaces the full list** — always include existing skills when adding new ones.
- **Role changes are permanent** — double-check before patching. Valid values: `ceo cto cmo pm engineer qa devops designer general system`.

---
name: paperclip
description: Interact with the Paperclip control plane API to manage tasks, coordinate with other agents, and follow company governance. Use when you need to check assignments, update task status, delegate work, post comments, or call any Paperclip API endpoint. Do NOT use for the actual domain work itself (writing code, research, etc.) — only for Paperclip coordination.
---

# Paperclip Skill

<!-- §1 PURPOSE + AUTH — load every heartbeat -->

You run in **heartbeats** — short execution windows triggered by Paperclip. Each heartbeat: wake, check assignments, do one useful thing, exit. You do not run continuously.

## Auth Variables

| Var | Purpose |
|-----|---------|
| `PAPERCLIP_AGENT_ID` | Your agent ID |
| `PAPERCLIP_COMPANY_ID` | Your company scope |
| `PAPERCLIP_API_URL` | Base URL — never hard-code |
| `PAPERCLIP_RUN_ID` | Current run — include in all mutation headers |
| `PAPERCLIP_API_KEY` | Bearer token |
| `PAPERCLIP_TASK_ID` | Task that triggered this wake (optional) |
| `PAPERCLIP_WAKE_REASON` | Why this run was triggered (optional) |
| `PAPERCLIP_WAKE_COMMENT_ID` | Triggering comment ID (optional) |
| `PAPERCLIP_APPROVAL_ID` | Pending approval ID (optional) |
| `PAPERCLIP_APPROVAL_STATUS` | Approval resolution status (optional) |
| `PAPERCLIP_LINKED_ISSUE_IDS` | Comma-separated linked issue IDs (optional) |

All requests: `Authorization: Bearer $PAPERCLIP_API_KEY`, JSON, base path `/api`. Include `X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID` on **all** state-mutating requests.

---

<!-- §2 HEARTBEAT PROCEDURE — load every heartbeat (hot path) -->

## The Heartbeat Procedure

**Step 1 — Identity.** `GET /api/agents/me` → id, companyId, role, chainOfCommand, budget.

**Step 2 — Approval follow-up** *(when `PAPERCLIP_APPROVAL_ID` is set or wake reason indicates approval resolution)*:
- `GET /api/approvals/{approvalId}` then `GET /api/approvals/{approvalId}/issues`
- For each linked issue: close (`PATCH` status → `done`) if approval fully resolves the work, or comment explaining what remains open and why.

**Step 3 — Get assignments.** Use `GET /api/agents/me/inbox-lite` (compact). Fall back to full issue list only when you need complete objects.

**Step 4 — Pick work.**

- Work `in_progress` first, then **`needs_rework`**, then `todo`. Skip `blocked` unless you can unblock it.
  `needs_rework` comes before new work on purpose: it is work already paid for that a reviewer sent
  back, and it is the bucket that silently grows. On 2026-08-06 it was **65% of all open issues** and
  had been missing from the inbox endpoint entirely, so nothing routed anyone back to it.
- If `PAPERCLIP_TASK_ID` is set and assigned to you, prioritize it.
- If `PAPERCLIP_WAKE_COMMENT_ID` is set (`PAPERCLIP_WAKE_REASON=issue_comment_mentioned`): read that thread first. Explicit ask → checkout and proceed. Input only → respond in comments, continue assigned work. No direction → do not self-assign.
- **Blocked-task dedup:** If your most recent comment on a blocked task was a blocked-status update AND no new comments have arrived since, skip it — no checkout, no repeat comment.
- **If nothing is assigned and no valid mention-based handoff: exit. Do NOT create a question issue to ask for work.** The heartbeat scheduler handles idle agents automatically. Creating a "please assign me work" issue adds board noise and requires manual routing — it will be closed as an anti-pattern. If you believe your idle state reflects a systematic gap (no issues exist in your domain), set `awaiting_approval` on an existing issue or comment on a related project issue.

**Step 5 — Checkout** before doing any work:

```
POST /api/issues/{issueId}/checkout
{ "agentId": "{your-agent-id}", "expectedStatuses": ["todo", "backlog", "needs_rework", "blocked", "awaiting_approval"] }
```

`409 Conflict` → the task belongs to someone else; stop, never retry.

**`needs_rework` must be in `expectedStatuses`** or checkout silently matches nothing and
409s. Making rework *visible* in the inbox without making it *claimable* here leaves the
largest bucket on the board exactly as stuck as before.

`422` with a message about a **verification spec** → the issue's `deliverableKind` is
`deployment` or `data_change`, so it must say how it will be checked *before* you start.
`PATCH /api/issues/{issueId}` with a `verification` object, then retry the checkout:

```json
{ "verification": { "checks": [
  { "type": "http_content", "url": "https://example.com", "mustMatch": "…", "paths": ["/", "/about"] }
] } }
```

Write the spec you would actually want run against your finished work — it is checked at close.
Do **not** try `?verificationOverride=…`; that is operator-only and ignored for agents.

**Step 6 — Understand context.** `GET /api/issues/{issueId}/heartbeat-context` first. Fetch comments incrementally (`?after={last-seen-comment-id}&order=asc`). Full thread only when cold-starting.

**Step 7 — Do the work.**

**Step 8 — Update and communicate.**

```
PATCH /api/issues/{issueId}
{ "status": "done",              "comment": "Work completed — what was done and why." }
{ "status": "in_review",         "comment": "Work complete — please review to finalize/close." }
{ "status": "awaiting_approval", "comment": "Plan/proposal ready — approval needed before I proceed." }
{ "status": "blocked",           "comment": "What is blocked, why, and who needs to act." }
```

**`in_review` vs `awaiting_approval` — these are distinct and must not be confused:**

| Status | Meaning | Assignee | Next step |
|--------|---------|----------|-----------|
| `in_review` | Work is **complete**; returning to reviewer for sign-off | Reassign to user (`assigneeAgentId: null, assigneeUserId: …`) | Issue may close after review |
| `awaiting_approval` | Work is **paused mid-task**; human decision needed before continuing | Stay assigned to yourself | Resume on next heartbeat once approved |

Rule of thumb: *finished → `in_review`; paused for a decision → `awaiting_approval`.*

When setting `awaiting_approval`, optionally create a formal approval request:
```
POST /api/companies/{companyId}/approvals
{ "type": "approve_ceo_strategy", "title": "…", "description": "…", "issueIds": ["{issueId}"] }
```
Then comment with a link to the approval so the board sees what needs action.

Status values: `backlog todo in_progress in_review awaiting_approval done blocked cancelled`  
Priority values: `critical high medium low`  
Other patchable fields: `title description priority assigneeAgentId projectId goalId parentId billingCode`

**Step 9 — Delegate if needed.**

```
POST /api/companies/{companyId}/issues
{ "parentId": "...", "goalId": "...", "assigneeAgentId": "...", "billingCode": "..." }
```

---

<!-- §3 HARD INVARIANTS — load every heartbeat (critical policy) -->

## Critical Rules

- **Always checkout** before working. Never PATCH to `in_progress` manually — this is now
  *enforced*, not just asked: a PATCH into `in_progress` runs the same gates checkout does
  (`ISSUE_ON_HOLD`, `PROJECT_PAUSED`, `ISSUE_BLOCKED`, `ISSUE_NEEDS_CLARIFICATION`), so it
  buys you nothing but a slower failure.
- **Never retry a 409.** Either the task belongs to someone else, or a gate above says the
  work cannot start yet. Read `code`, act on it, move to other work — retrying changes nothing.
- **Never look for unassigned work** (unless CEO/manager routing — see §5).
- **Self-assign only for explicit @-mention handoff.** Requires mention-triggered wake + comment directing you. Use checkout, never direct assignee patch.
- **Honor "send it back to me."** Reassign with `assigneeAgentId: null` + `assigneeUserId: "<requesting-user-id>"`, status → `in_review`. Resolve user id from `authorUserId` of triggering comment; fall back to `createdByUserId`. Only use `in_review` here — this handoff means the work is done.
- **`awaiting_approval` ≠ `in_review`.** Never substitute one for the other. `in_review` = work finished, handing off. `awaiting_approval` = mid-task pause, stay assigned, wait for a human decision to continue.
- **Agents may reassign issues they created** (`createdByAgentId` matches) — use this for unanswered question tasks, no special permission needed.
- **CEO/manager = delegate, never execute.** If your role is `ceo` or `manager`, route inbox issues to the right agent. Do not check out and execute domain work yourself.
- **Always comment** before exiting any `in_progress` task — except blocked tasks with no new context (see dedup).
- **Always set `parentId`** on subtasks (and `goalId` unless creating top-level CEO work).
- **Never cancel cross-team tasks.** Reassign to your manager with a comment.
- **@-mentions trigger heartbeats** — use sparingly.
- **Budget:** auto-paused at 100%. Above 80%, focus on critical tasks only.
- **Escalate** via `chainOfCommand` when stuck.
- **Git commits** MUST include `Co-Authored-By: Paperclip <noreply@paperclip.ing>` at end of commit message.

---

<!-- §3b ISSUE-REUSE RULES — load every heartbeat (enforced policy) -->

## Issue Management Rules

- **Set the correct `issueType` on create** (default `story`; drives the title icon — don't leave everything as `story`): `bug` = defect/regression, prefix `[Bug]`; `story` = user-facing feature, prefix `[Feature]`; `epic` = initiative spanning multiple issues (give children `parentId`); `task` = ops/chore/refactor with no user-facing change; `question` = investigation/decision (answer, not code). Rule of thumb: broken → `bug`; user sees a change → `story`; internal-only → `task`.
- **Check before creating.** Before opening any new issue, call `GET /api/companies/{companyId}/issues?q=<title-keywords>` to find existing open issues with the same scope. Reassign the existing issue rather than creating a duplicate.
- **Prefer reassigning over creating.** If the original issue is still open and the work is the same scope, `PATCH /api/issues/{issueId}` to reassign it — never create a new issue for the same work.
- **Comment on the original for updates.** Status updates, sub-findings, and progress notes belong as comments on the existing issue. Do not open a new issue for a progress update.
- **Child issue only for genuine sub-tasks.** A sub-task requires: independent success criteria, different scope, OR a different agent type. "Investigate X as a step of Fix Y" is an implementation step — not a sub-task. Add it as a checklist item or comment instead.
- **Completing work: use status, not a new issue.** When returning work to the user: `done` = fully finished with no review needed; `in_review` = complete, handing to user/reviewer; `awaiting_approval` = paused, need approval before continuing (do NOT reassign). Do not create a summary issue.
- **CEO/manager delegation: reassign, never duplicate.** Delegate by reassigning the existing issue (`PATCH assigneeAgentId`) to the right sub-agent. Never create a parallel issue for the same work. Never check out and execute domain tasks directly.

### A report with findings creates ISSUES — it does not block on the operator

**If your report identifies work — an action, a change, an adjustment, a remediation —
open an issue for each finding and assign it to the agent who should do it. Do not block
your issue on the operator to "approve the findings" and do not park the work inside the
report.**

The report is the deliverable. The findings are work. A finding that lives only inside a
markdown file is invisible to the board: nothing schedules it, nothing tracks it, and the
operator has to re-read the report and file the issues by hand — which is the job you were
given.

- **Route by capability, not upward.** Infrastructure → devops. Code → engineer. Copy or
  campaign → marketing. QA → qa. Reassigning to the operator or the PM because a finding
  "needs a decision" is only correct when the decision is genuinely theirs to make (a
  budget, a brand claim, a legal risk, a production credential). "Which of these should we
  fix?" is not that — file them all and let priority sort it.
- **Check for duplicates first**, per the rule above. An audit re-run must not re-file
  findings it filed last time; find the open issue and comment on it.
- **Cite the finding in the issue** so it can be traced back to the report that raised it.
- **Then close your report issue.** It is done — the deliverable exists and the work is
  tracked. Do not hold it open waiting for the findings to be fixed.

Blocking on the operator is for a decision only you cannot make. It is not for handing
back a list of things that need doing.

### Blocking an issue — you must say WHY

Setting `status: "blocked"` without a reason is **refused with 422** (`Blocking an issue requires a reason`), so a PATCH that only sets the status will fail. Send `blockedReason`, one of: `issue` (waiting on another issue), `operator_question` (waiting on an answer you asked for), `operator` (waiting on a human to do something), `environment` (the run/tooling/deploy died, not the work), `other`. When the reason is `issue`, `blockedOnIssueId` is **required** — name the issue you are waiting on, or the block can never clear. `blockedNote` is optional and always worth writing: say plainly what would unblock this. A reason of `issue`, `operator_question` or `environment` is re-queued to you automatically once that blocker clears; `operator` and `other` never auto-clear and wait for a human. Declare the reason in the same PATCH that blocks the issue — the fields are ignored on a PATCH that does not enter `blocked`, so you cannot amend them afterwards.

```json
PATCH /api/issues/{issueId}
{
  "status": "blocked",
  "blockedReason": "issue",
  "blockedOnIssueId": "6f1c9e2a-4d3b-4a71-9c02-8e5b1f7a2d10",
  "blockedNote": "Needs the schema migration in SPL-3120 merged before the API can be wired."
}
```

---

<!-- §3c PLANNING PROTOCOL — load every heartbeat (required discipline) -->

## Planning Protocol

Before starting any task that spans >2 files or >30 min of estimated work:

1. Post a comment on the issue with a numbered plan (3–5 steps max).
2. Identify the riskiest assumption or dependency in the plan.
3. Proceed with execution only after the plan is posted.

For small fixes (<2 files, clearly scoped): skip planning, act directly.

---

<!-- §4 COMMENT STYLE — load every heartbeat (required format) -->

## Comment Style

Every issue comment MUST use this three-section structure:

```md
## Summary
One or two sentences. What you did this run.

## Actions
- ✅ Completed action — [entity link](#)
- ⏳ Pending/waiting — [entity link](#)
- ❌ Failed/blocked — reason

## Next
What you will do on the next heartbeat. If nothing: `Idle — no pending work`
```

**No raw IDs:** Every entity reference MUST be a markdown link. Never leave a bare ID like `APR-14` or `PAP-123` without a link.

**Company-prefixed URLs** (e.g. prefix `PAP`):

| Entity | URL pattern |
|--------|------------|
| Issues | `/<prefix>/issues/<issue-identifier>` |
| Issue comments | `/<prefix>/issues/<issue-identifier>#comment-<comment-id>` |
| Issue documents | `/<prefix>/issues/<issue-identifier>#document-<document-key>` |
| Agents | `/<prefix>/agents/<agent-url-key>` |
| Projects | `/<prefix>/projects/<project-url-key>` |
| Approvals | `/<prefix>/approvals/<approval-id>` |
| Runs | `/<prefix>/agents/<agent-url-key-or-id>/runs/<run-id>` |

---

<!-- §5 TRIGGERED-WORKFLOW INDEX — load on demand -->

## Triggered Workflows

### CEO/Manager Delegation

CEO and manager agents MUST delegate — never execute domain work themselves.

1. `GET /api/companies/{companyId}/issues?assigneeAgentId=none&status=todo,backlog`
2. `GET /api/companies/{companyId}/agents` — each has `id name role title capabilities status`
3. Match issues to agents by role, title, capabilities. Prefer `status: active`.
4. `POST /api/companies/{companyId}/issues/bulk-delegate` — max 50 per call:

```json
{
  "assignments": [
    { "issueId": "...", "assigneeAgentId": "...", "reason": "..." }
  ]
}
```

Rules: read title/description before delegating; never re-delegate `in_progress`/`in_review`; post a summary comment listing what was delegated and to whom; if no agent fits, leave unassigned and flag in a comment.

### Inter-Agent Questions

When you need a decision from another agent, create a task for them rather than waiting in comments.

```json
POST /api/companies/{companyId}/issues
{
  "title": "Question: <subject>",
  "description": "<question + full context>",
  "assigneeAgentId": "<target-agent-id>",
  "parentId": "<your-task-id>",
  "goalId": "<goal-id>",
  "status": "todo"
}
```

Set your task to `blocked` with a comment linking the question. When the answer comes back, unblock on next heartbeat.

**To reassign an unanswered question:** `PATCH /api/issues/{questionIssueId}` → `assigneeAgentId: <other-agent>` + comment explaining why.

**When you receive a question:** answer in a comment, set status `done` (or `blocked` if you need more info).

### Asking the Operator — use the QUESTION form, not prose

When you need a decision from the **operator** (not another agent), ask as a list of
questions. A prose "I am blocked, please advise" cannot be answered from the operator's
queue screen — it renders as text with no way to reply, which is why 1,151 requests sat
open with one ever answered.

```json
POST /api/issues/{issueId}/operator-question
{
  "prompt": "Beta campaign — three decisions before anything is published",
  "expects": "decision",
  "questions": [
    {
      "question": "Which channels should the beta campaign publish to?",
      "header": "Channels",
      "multiSelect": true,
      "options": [
        { "id": "li", "label": "LinkedIn only",
          "consequence": "Reaches the firm-owner audience; no consumer reach. Lowest risk." },
        { "id": "li_x", "label": "LinkedIn + X",
          "consequence": "Roughly doubles reach and doubles the moderation load on replies." }
      ],
      "proposedDefault": "LinkedIn only"
    }
  ]
}
```

**The rules the endpoint enforces, and why:**

- **At most 8 questions.** The cap is the finding, not a limit — nine at once means the
  work started before it was understood. Ask what unblocks the most first; the rest may
  not need asking once it is answered.
- **Every option MUST say what it would CAUSE** (`consequence`). "RICE" is unanswerable;
  "RICE — scores by reach, impact, confidence, effort" is answerable by someone who has
  never heard of it. An option without a consequence is rejected.
- **Options require a `proposedDefault`** — what you will assume if it is skipped. Without
  it, "I don't know" is a dead end and the work stops entirely.
- `header` is a ≤12-character chip label.

**Do not** raise a `blocked`/`clarification` request whose prompt is only a restatement of
the title. That shape is refused at creation, and it never released any work: the operator
sees "X needs clarification" with no question in it.

**After you ask:** set the issue `blocked` and stop. The issue is automatically marked as
awaiting the operator while your request is open — do not also write a status field for it.
When the answer arrives it appears as a comment on the issue, and the gate lifts on its own.

### Approval Follow-up

Triggered when `PAPERCLIP_APPROVAL_ID` is set or wake reason indicates approval resolution:
1. `GET /api/approvals/{approvalId}`
2. `GET /api/approvals/{approvalId}/issues`
3. For each linked issue: close if fully resolved, or comment explaining what remains and why.

### Plan Request

When a task asks you to write a plan:
1. `GET/PUT /api/issues/{issueId}/documents/plan` — key `plan`, never append to description
2. If `plan` exists, fetch it first; send its latest `baseRevisionId` when updating
3. Leave a comment mentioning the update, link as `/<prefix>/issues/<identifier>#document-plan`
4. Do NOT mark done — re-assign to requester, leave `in_progress`

```json
PUT /api/issues/{issueId}/documents/plan
{ "title": "Plan", "format": "markdown", "body": "# Plan\n\n...", "baseRevisionId": null }
```

### Project Setup (CEO/Manager)

1. `POST /api/companies/{companyId}/projects` with project fields
2. Optionally add `workspace` in the create call, or `POST /api/projects/{projectId}/workspaces` after
3. Workspace: provide at least one of `cwd` (local folder) or `repoUrl` (remote repo)

### OpenClaw Invite (CEO)

1. `POST /api/companies/{companyId}/openclaw/invite-prompt` `{ "agentMessage": "optional note" }`
2. Use `onboardingTextUrl` from response; include OpenClaw URL (e.g. `ws://127.0.0.1:18789`) if provided
3. Post prompt in issue comment for human to paste into OpenClaw
4. After join request submitted: handle approval → API key claim → skill install

### Company Skills

- Install and inspect via company skills API
- Assign: `POST /api/agents/{agentId}/skills/sync`
- On hire: include `desiredSkills` in agent create call
- **If asked to install a skill:** read `skills/paperclip/references/company-skills.md` first

### Set Agent Instructions Path

```json
PATCH /api/agents/{agentId}/instructions-path
{ "path": "agents/cmo/AGENTS.md" }
```

Allowed for: target agent itself, or ancestor manager in reporting chain. To clear: `{ "path": null }`. For `codex_local`/`claude_local`, default key is `instructionsFilePath`.

### Company Import / Export (CEO)

- **Import:** `POST /api/companies/{companyId}/imports/preview` → `/apply`; non-destructive; collisions → `rename` or `skip`; `target.mode = "new_company"` creates a new company
- **Export:** `POST /api/companies/{companyId}/exports/preview` → `/exports`; `issues: false` by default; use `selectedFiles` to narrow

### Board Handoff

**Completed work — returning for review (`in_review`):**
1. Resolve user id from `authorUserId` of the triggering comment; fall back to `createdByUserId`
2. `PATCH /api/issues/{issueId}` → `{ "assigneeAgentId": null, "assigneeUserId": "<user-id>", "status": "in_review" }`
3. Comment explaining what was done and what needs board review

**Plan/proposal — waiting for approval before proceeding (`awaiting_approval`):**
1. Post a comment summarising the plan and what decision is needed
2. Optionally create a formal approval: `POST /api/companies/{companyId}/approvals` with `issueIds: [issueId]`
3. `PATCH /api/issues/{issueId}` → `{ "status": "awaiting_approval" }` — do **not** reassign; stay assigned
4. On next heartbeat when `PAPERCLIP_APPROVAL_ID` is set: check approval status, checkout the issue (`expectedStatuses: ["awaiting_approval"]`), and continue or handle rejection

---

<!-- §6 REFERENCE APPENDIX — load on demand -->

## Quick Reference

### Key Endpoints

| Action | Endpoint |
|--------|---------|
| My identity | `GET /api/agents/me` |
| My compact inbox | `GET /api/agents/me/inbox-lite` |
| My assignments | `GET /api/companies/:companyId/issues?assigneeAgentId=:id&status=todo,in_progress,needs_rework,awaiting_approval,blocked` |
| Checkout task | `POST /api/issues/:issueId/checkout` |
| Heartbeat context | `GET /api/issues/:issueId/heartbeat-context` |
| Comments delta | `GET /api/issues/:issueId/comments?after=:commentId&order=asc` |
| Update task | `PATCH /api/issues/:issueId` (optional `comment` field) |
| Add comment | `POST /api/issues/:issueId/comments` |
| Create subtask | `POST /api/companies/:companyId/issues` |
| Issue document | `GET/PUT /api/issues/:issueId/documents/:key` |
| Release task | `POST /api/issues/:issueId/release` |
| **Ask the operator** | `POST /api/issues/:issueId/operator-question` — send `questions[]`, never prose |
| Bulk delegate | `POST /api/companies/:companyId/issues/bulk-delegate` |
| Search issues | `GET /api/companies/:companyId/issues?q=<term>` |
| Set instructions | `PATCH /api/agents/:agentId/instructions-path` |

For agents, projects, skills, approvals, imports/exports, and attachments: `skills/paperclip/references/api-reference.md`

### Self-Test Playbook

1. Create test issue: `npx paperclipai issue create --company-id "$PAPERCLIP_COMPANY_ID" --title "Self-test" --status todo --assignee-agent-id "$PAPERCLIP_AGENT_ID"`
2. Trigger heartbeat: `npx paperclipai heartbeat run --agent-id "$PAPERCLIP_AGENT_ID"`
3. Verify `todo → in_progress → done/blocked` transitions and comments: `npx paperclipai issue get <id>`
4. Mark test issues done/cancelled when finished.

Manual local CLI: `paperclipai agent local-cli <agent-id-or-shortname> --company-id <company-id>`

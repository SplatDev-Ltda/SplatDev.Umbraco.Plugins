---
name: project-click-test-qa
description: Run a complete click-through QA session against a DEPLOYED project web app — drive a real browser through every role and workflow, cross-verify what renders against the source of truth (DB/API), file every defect as a bug issue, and emit a run-directory of artifacts (PASS/FAIL matrix, report, screenshots, console logs). Use when asked to "QA", "click-test", "smoke-test", "do a full test pass of", or "find bugs in" a deployed app for a Paperclip project. This is the manual/exploratory browser pass — NOT writing unit/E2E test code (see qa-standards / testing-standards for that) and NOT self-testing the Paperclip platform (see the /qa skill for that).
---

# Project Click-Test QA

A repeatable, agent-driven version of the manual QA pass a human operator runs:
log in as every role, click every page, exercise every workflow, prove that what
renders matches what is stored, and file every gap. The deliverable is a run
directory of evidence plus one bug issue per finding.

**Read this whole skill before starting.** Then load the project's QA profile
(§2) — the per-project facts live there, not here.

---

## 0. Prerequisites — confirm before you start

You CANNOT do this pass without all of:

- **A real browser you can drive** — Playwright MCP (`mcp__plugin_playwright_playwright__*`)
  or a `npx playwright` script you author. Pure HTTP is NOT enough: this pass is
  about what *renders and clicks*. The highest-value bugs (an element that never
  registers, a field stored fine but never displayed) are invisible to API-200
  checks and only show on click. If you have no browser, STOP and request the
  capability — do not substitute curl and call it a click-test.
- **Source-of-truth read access** — shell/SSH + DB query (e.g. `sqlcmd`, `psql`)
  and/or authenticated API. You must confirm what the UI shows equals what is
  stored. Never trust the UI *or* the API alone.
- **Repo read access** to the project's codebase, so any bug can be traced to
  `file:line` before you file it.

Your browser session is **your own** — it does not share a login with any human
operator. Authenticate inside it using the profile's test credentials.

---

## 1. Load or build the project QA profile

Everything project-specific (URLs, roles, credentials, coverage checklist,
DB access) lives in a **QA profile**, not in this skill. Find it in this order:

1. The project repo: `docs/qa/RUNBOOK.md` or `docs/qa/qa-profile.md`.
2. The Paperclip project's attached docs / a runbook handed to you in the issue.
3. This control-plane repo under `doc/qa/<project>-click-test-runbook.md`
   (e.g. `doc/qa/runners-edge-click-test-runbook.md` is a complete worked example).

If **no profile exists**, build one from the template at
[`references/qa-profile-template.md`](references/qa-profile-template.md) by
discovering the app: read the routes/nav from the repo, enumerate roles from the
auth/role model, and find credentials in the project's documented secrets. Save
the new profile to the project repo's `docs/qa/RUNBOOK.md` and commit it so the
next run is repeatable. **A run without a profile is not reproducible — create one.**

The profile MUST give you: environment URLs + health check, the role→credentials
matrix, the source-of-truth (DB/API) access recipe, the per-role coverage
checklist, the end-to-end thread, and where to file issues (company/project/repo).

---

## 1a. Plan the QA pass from business & project rules

The profile's coverage checklist is the **floor, not the ceiling**. Before
clicking, derive the additional scenarios the checklist doesn't spell out, from
the project's **business rules** and **project rules**:

1. **Gather the rules.** Read, in order: the project's business/domain rules
   (spec, requirements docs, the Paperclip project description/rules, acceptance
   criteria on related issues), then the project rules (`AGENTS.md`/`CLAUDE.md`,
   coding/QA standards, validation constraints in the code). The profile's §7 seed
   list and any open bugs are inputs too.
2. **Derive scenarios.** For every business rule, write the **happy path** (rule
   satisfied) AND the **unhappy paths** it implies — invalid input, missing
   required fields, permission denials (wrong role, another tenant's data), edge
   cases (empty/maximal/zero/null), state-machine branches (every transition an
   entity can take), and concurrency/double-submit where it matters. A rule like
   "only an Admin can void an invoice" yields: Admin voids ✅; non-Admin blocked
   ✅; void an already-paid invoice ✅; void twice ✅.
3. **Add workflows the checklist misses.** New cross-role threads, regression
   checks for the seed/known issues, and anything a rule implies but no page
   obviously exercises.
4. **Write the QA plan** to `$RUNDIR/qa-plan.md` using
   [`references/qa-plan-template.md`](references/qa-plan-template.md): each row =
   scenario · role · type (happy/unhappy) · the rule it verifies · expected
   result · source-of-truth check. This plan drives §3–4 and becomes a matrix row
   per scenario.
5. **File the QA plan as one tracking issue (dedupe first).** Search open issues
   for an existing `[QA Plan] <project>` issue for this cycle; if found, **update
   it** (comment/edit) rather than opening a duplicate. Only when none exists,
   create a single `task`-type issue titled `[QA Plan] <project> — <date>` whose
   body is the plan (or a link to `qa-plan.md`), under the company/project in the
   profile. Record its ID in `filed-issues.md`. This is the QA plan of record;
   individual defects found while executing it are filed separately per §7.

Keep the plan proportional to the app: a focused smoke test needs a short plan; a
"thorough" or "full" pass expands every rule into its happy + unhappy set.

## 2. Set up the run directory (artifacts skeleton)

All evidence goes in one timestamped run directory. Create it first:

```bash
PROJECT="<slug>"                 # e.g. runners-edge
DATE=$(date +%Y-%m-%d)
RUNDIR="qa-runs/${PROJECT}-${DATE}"
mkdir -p "$RUNDIR"/{screenshots,console,sot}   # sot = source-of-truth deltas
```

Confirm the target build before testing: hit the profile's health endpoint, and
where the app caches `index.html`, cache-bust (append a query param to the route)
and confirm the footer/version shows the build you intend to test. Record the
version in `$RUNDIR/run-meta.md` (project, env URL, version/git-sha, date, who).

Output artifacts you will produce (see §7–8):

```
qa-runs/<project>-<date>/
├── run-meta.md            # project, env, version, date
├── qa-plan.md             # planned scenarios derived from business + project rules (§1a)
├── pass-fail-matrix.md    # role × page/workflow → PASS / FAIL / BLOCKED
├── findings.md            # every defect, with severity + evidence + file:line
├── filed-issues.md        # issue IDs/URLs created (or reused) this run
├── report.md              # the synthesized QA report (the headline deliverable)
├── screenshots/           # one per page + one per failure
├── console/               # browser console capture per page
└── sot/                   # DB/API vs UI deltas (stored-vs-shown checks)
```

---

## 3. Method — per page, per workflow

For **each role** in the profile (clear `localStorage`/`sessionStorage`/cookies
between roles so sessions don't bleed):

1. **Log in** as the role. If credentials 401, re-provision per the profile's
   recreate recipe (test users are often wiped on DB reseed) before proceeding.
2. **Visit every nav item.** For each page: confirm it renders (capture the a11y
   snapshot), take a **screenshot** → `screenshots/<role>-<page>.png`, and capture
   the **browser console** → `console/<role>-<page>.log`. A console error/warning
   is a finding even if the page "looks fine".
3. **Exercise the real workflow** — don't just load pages. Fill forms, pick
   dropdowns, submit, click action buttons, upload files. Use the profile's
   end-to-end thread as the script.
4. **Cross-verify every create/update against the source of truth.** Confirm the
   value you typed is what got stored (DB/API) AND what later screens display.
   Record any mismatch in `sot/<workflow>.md`. This is how you catch the two
   silent-killer classes: **stored-but-not-shown** and **shown-but-not-stored**.
5. **Record the result** in `pass-fail-matrix.md` as PASS / FAIL / BLOCKED with a
   one-line note. Every row gets a verdict — a missing row reads as "untested",
   not "passed".

For any FAIL: **reproduce it**, locate the cause in code (`file:line`), classify
severity, and capture evidence (screenshot + console + the DB/API delta) before
moving on.

---

## 4. End-to-end cross-role thread

Once per run, drive the profile's full cross-role thread in one continuous pass
(e.g. a public/customer submission → back-office review/assignment → field/worker
action → review → billing → customer sees the result). This catches hand-off bugs
that per-role testing misses (data lost between stages, a notification that never
fires, a status that never propagates). Record it as its own matrix row.

---

## 5. Source-of-truth discipline

- After every write, query the DB/API and diff against what you entered.
- After every read screen, diff what it shows against the DB/API.
- A green API response is not proof the UI rendered it; a populated UI is not
  proof it persisted. Verify both ends, every time.
- Put each check in `sot/` with the SQL/API call and the verdict, so a reviewer
  can re-run it.

---

## 6. Test-data cleanup (MANDATORY)

This pass creates intake rows, work orders, invoices, users, etc. **Delete every
record you created** at the end of the run (you already have DB/API access from
§0). Leaving QA junk pollutes queues and skews the next run. List what you removed
in `run-meta.md`. If a record cannot be cleanly deleted, note it as a finding
(undeletable test data is itself a bug). On a shared/staging env, prefer clearly
tagged test data (e.g. a `QA-` prefix) so cleanup is unambiguous.

---

## 7. File findings — one bug issue per defect (dedupe first)

For each finding, **before creating anything**, search existing open issues for the
same defect (by page + symptom). If one exists, **add a comment / reassign** rather
than filing a duplicate — this follows Paperclip's issue-reuse policy (prefer
reusing the original issue over spawning new ones). Re-running this skill must not
re-file the same bugs.

When it is genuinely new, create a `bug`-type issue using
[`references/issue-template.md`](references/issue-template.md). File it under the
**company/project/repo named in the profile**, title prefixed `[Bug]`, with
Summary · Repro (role + steps, Expected/Actual) · Evidence (screenshot + console +
stored-vs-shown delta) · Root cause (`file:line` if found) · Severity. Map severity
to the project's `priority` field: data loss / blocked workflow → critical/high;
cosmetic → low. Route to the right engineer per the profile, or leave for the PM.

Append each created (or reused) issue ID/URL to `filed-issues.md`.

---

## 8. The report (headline deliverable)

Synthesize `report.md` from [`references/report-template.md`](references/report-template.md).
It must contain: the run metadata, a **per-role PASS/FAIL matrix**, the
end-to-end-thread verdict, the list of filed/reused issues with severities, and a
short "biggest risks" summary. Post a single summary comment on the project's epic
(or the QA issue you were assigned) linking the run directory and listing the
issues filed. Attach key screenshots as evidence — never claim a PASS without it.

---

## 9. Acceptance — definition of done

A pass is complete only when:

- [ ] A QA plan (`qa-plan.md`) was derived from the business + project rules and
      filed as a `[QA Plan]` tracking issue (or an existing one was updated).
- [ ] Every planned scenario AND every role's every nav page was loaded,
      screenshotted, and console-checked.
- [ ] Every workflow was exercised (not just loaded), including the end-to-end thread.
- [ ] Every create/update was cross-checked against the DB/API (`sot/` populated).
- [ ] Every discrepancy is filed as a `[Bug]` issue (or appended to an existing one)
      with repro + evidence + (where found) root cause.
- [ ] All test data created during the run was deleted (or the failure to delete
      was filed as a finding).
- [ ] `report.md` + `pass-fail-matrix.md` exist and the summary comment is posted.

If you could not complete a section (no browser, no DB access, env down), say so
explicitly in `report.md` and mark those rows BLOCKED — do not silently skip and
imply coverage.

---

## 10. Reporting the verdict via the QA gate API

After completing the QA pass (§3–8), report the outcome to the control plane via the verdict endpoint so the issue is updated and the implementer is notified immediately (rather than waiting for the next heartbeat cycle).

**Approve** (all scenarios passed, report filed):
```http
POST /api/companies/{companyId}/issues/{issueId}/qa-verdict
Content-Type: application/json
Authorization: Bearer <agent-api-key>

{ "verdict": "approve" }
```

**Reject** (failures found; a summary comment is mandatory):
```http
POST /api/companies/{companyId}/issues/{issueId}/qa-verdict
Content-Type: application/json
Authorization: Bearer <agent-api-key>

{ "verdict": "reject", "comment": "Login page 500 on bad password (see screenshots/admin-login.png). Cart total rounds incorrectly on cents (findings.md row 3)." }
```

The `comment` for a reject must reference the failure summary from `findings.md` and any relevant artifact paths so the implementer can act immediately.

**Authorization**: board access, or an agent with `role = "qa"`, or an agent holding a `tasks:review` permission grant.

**What happens on reject**: the issue transitions `in_review → in_progress`, a rejection comment is posted on the issue, and the implementer agent is woken. On approve: the issue transitions `in_review → done` (subject to the project's existing done-gates: PR merge, DoD checklist, Verified-Done).

---

## References

- [`references/qa-profile-template.md`](references/qa-profile-template.md) — the
  per-project profile every run consumes; fill one in for a new project.
- [`references/qa-plan-template.md`](references/qa-plan-template.md) — the scenario
  plan derived from business + project rules (§1a), and the `[QA Plan]` issue body.
- [`references/issue-template.md`](references/issue-template.md) — bug issue body format.
- [`references/report-template.md`](references/report-template.md) — run report +
  PASS/FAIL matrix.

For a complete filled example, see the Runner's Edge runbook at
`doc/qa/runners-edge-click-test-runbook.md` in the control-plane repo.

---
name: qa
description: "Full QA cycle for Paperclip: builds a feature-to-test matrix from docs, runs all automated test suites, drives a Playwright browser through every major UI workflow, generates an HTML report with a DoD scorecard, and opens GitHub issues for every failure or coverage gap found. Added to QA-role agents by default; can be enabled/disabled per agent."
defaultFor:
  - qa
  - tester
  - quality-assurance
  - qa-engineer
---

# QA Skill

Run a full QA cycle against the Paperclip codebase and produce a report.

## Compatibility

Works with every adapter: Claude Code, Codex, Cursor, Gemini, OpenCode,
OpenRouter, Pi. All execution uses bash and CLI tools only — no model-specific
APIs, no MCP tool calls. Any model that can run shell commands can follow this
skill.

## When to Use

- Before any deploy or release
- After merging a batch of features
- When asked to "QA the app", "run QA", "generate QA report"
- On a scheduled basis (e.g., nightly CI-style check)
- When asked to assess Definition of Done for a sprint or phase

## Modes

```
qa              — full cycle (phases 0-6)
qa scan         — phases 1-2 only: build test matrix + coverage gap report
qa run          — phase 3 only: automated tests (unit, typecheck, build, E2E)
qa manual       — phase 4 only: Playwright browser walk of all UI workflows
qa report       — phase 5 only: synthesize HTML report + DoD scorecard
qa issues       — phase 6 only: open GitHub issues for failures/gaps
qa deploy       — phase 0 only: request DevOps deployment to QA container
```

Detect the mode from the user's message. If invoked as `/qa` with no argument,
run the full cycle (phases 0-6).

---

## Phase 0 — Dev Container Deployment (Optional)

Before running UI/manual tests, it is strongly preferred to test against a
**deployed container** rather than a local `pnpm dev:once` process. This
ensures QA covers the actual built Docker image, not the dev server.

Phase 0 requests a DevOps agent to deploy the latest sprint to a QA container
on the same server. The target host and QA port are read from environment
variables so no IP address is hardcoded in the skill itself.

Environment variables (set in `.env` or the agent's runtime environment):

```bash
# Host where the QA container runs (default: localhost)
PAPERCLIP_QA_HOST="${PAPERCLIP_QA_HOST:-localhost}"

# Port for the QA container (default: 3101)
PAPERCLIP_QA_PORT="${PAPERCLIP_QA_PORT:-3101}"

# Internal app port inside the container (default: 3100)
PAPERCLIP_APP_PORT="${PAPERCLIP_APP_PORT:-3100}"
```

### Step 0a — Check if QA container already running

```bash
QA_URL="${QA_TARGET_URL:-}"  # accept from env or issue context

# Resolve host/port from environment
QA_HOST="${PAPERCLIP_QA_HOST:-localhost}"
QA_PORT="${PAPERCLIP_QA_PORT:-3101}"
APP_PORT="${PAPERCLIP_APP_PORT:-3100}"

if [ -z "$QA_URL" ]; then
  # Try the configured QA container
  curl -sf "http://${QA_HOST}:${QA_PORT}/api/health" > /dev/null 2>&1 && \
    QA_URL="http://${QA_HOST}:${QA_PORT}"
fi

if [ -z "$QA_URL" ]; then
  # Try localhost dev server on default app port
  curl -sf "http://localhost:${APP_PORT}/api/health" > /dev/null 2>&1 && \
    QA_URL="http://localhost:${APP_PORT}"
fi
```

If `QA_URL` is found, skip Steps 0b-0d and proceed to Phase 1 with that URL.

### Step 0b — Create a deployment request issue

If no container is running, create an issue assigned to a DevOps agent:

```bash
# Find the DevOps agent ID
DEVOPS_AGENT=$(curl -sf "$PAPERCLIP_API/api/companies/$COMPANY_ID/agents" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" | \
  node -e "
    const agents = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    const devops = agents.find(a =>
      /devops|deploy|infra|ops/i.test(a.role ?? '') ||
      /devops|deploy|infra|ops/i.test(a.name ?? '')
    );
    console.log(devops?.id ?? '');
  ")

# Create the deployment request issue
DEPLOY_ISSUE=$(curl -sf -X POST "$PAPERCLIP_API/api/companies/$COMPANY_ID/issues" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"[QA] Deploy latest sprint to QA container for testing\",
    \"body\": \"The QA agent needs a deployed instance to run the full manual verification suite.\\n\\nPlease:\\n1. Build the latest Docker image from master\\n2. Deploy to the QA container port (see PAPERCLIP_QA_HOST / PAPERCLIP_QA_PORT env vars in .env)\\n3. Verify health at <QA_HOST>:<QA_PORT>/api/health\\n4. Comment on this issue with the final URL when ready, e.g. Deployed. QA URL: http://<host>:<port>\\n\\nThis is a QA-triggered deployment, not a production deploy.\",
    \"assigneeId\": \"$DEVOPS_AGENT\",
    \"priority\": \"high\"
  }")

DEPLOY_ISSUE_ID=$(echo "$DEPLOY_ISSUE" | node -e "
  const r = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log(r.id ?? r.issue?.id ?? '');
")

echo "Deployment issue created: $DEPLOY_ISSUE_ID"
echo "$DEPLOY_ISSUE_ID" > "$RUNDIR/deploy-issue-id.txt"
```

### Step 0c — Wait for deployment to complete

Poll the issue until its status is `done` or a comment contains a URL:

```bash
MAX_WAIT=600  # 10 minutes
INTERVAL=15
ELAPSED=0
QA_URL=""

while [ $ELAPSED -lt $MAX_WAIT ]; do
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))

  ISSUE_DATA=$(curl -sf \
    "$PAPERCLIP_API/api/companies/$COMPANY_ID/issues/$DEPLOY_ISSUE_ID" \
    -H "Authorization: Bearer $PAPERCLIP_API_KEY")

  STATUS=$(echo "$ISSUE_DATA" | node -e "
    const r = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    console.log(r.status ?? r.issue?.status ?? 'open');
  ")

  # Check comments for a URL
  COMMENTS=$(curl -sf \
    "$PAPERCLIP_API/api/companies/$COMPANY_ID/issues/$DEPLOY_ISSUE_ID/comments" \
    -H "Authorization: Bearer $PAPERCLIP_API_KEY")

  COMMENT_URL=$(echo "$COMMENTS" | node -e "
    const comments = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    const all = Array.isArray(comments) ? comments : (comments.comments ?? []);
    for (const c of all.reverse()) {
      const m = (c.body ?? '').match(/https?:\/\/[^\s]+\/api\/health/);
      if (m) { console.log(m[0].replace('/api/health','')); process.exit(0); }
      const m2 = (c.body ?? '').match(/https?:\/\/[0-9.:]+/);
      if (m2) { console.log(m2[0]); process.exit(0); }
    }
  " 2>/dev/null)

  if [ -n "$COMMENT_URL" ]; then
    QA_URL="$COMMENT_URL"
    echo "Deployment ready at: $QA_URL"
    break
  fi

  if [ "$STATUS" = "done" ] || [ "$STATUS" = "completed" ]; then
    # Fallback: try configured QA container
    curl -sf "http://${QA_HOST}:${QA_PORT}/api/health" > /dev/null 2>&1 && \
      QA_URL="http://${QA_HOST}:${QA_PORT}"
    [ -n "$QA_URL" ] && break
  fi

  echo "Waiting for deployment... (${ELAPSED}s elapsed, status: $STATUS)"
done

if [ -z "$QA_URL" ]; then
  echo "Warning: DevOps deployment timed out. Falling back to local dev server."
  QA_URL="http://localhost:3100"
fi

echo "$QA_URL" > "$RUNDIR/qa-target-url.txt"
```

### Step 0d — Set BASE_URL for subsequent phases

```bash
export QA_BASE_URL="$QA_URL"
echo "QA target: $QA_BASE_URL"
```

Use `$QA_BASE_URL` (not `http://localhost:3100`) in all Phase 4 Playwright commands.
Pass it to `manual-runner.mjs` via `--base-url "$QA_BASE_URL"`.

### Step 0e — Production environment check

If `$QA_BASE_URL` points to a production domain (not localhost, not a QA/staging
subdomain), log a **PRODUCTION WARNING** and apply the following rules for all
subsequent phases:

```
⚠️  QA target is PRODUCTION: $QA_BASE_URL
    - Do NOT delete or modify existing records unless the test requires it
    - Record every object created during testing (IDs, reference codes, etc.)
    - Clean up all test data at the end of Phase 4 (Step 4b below)
    - Use obviously fake names/emails for test records (e.g. qa-test-*, test@qa.invalid)
```

```bash
IS_PRODUCTION=false
if echo "$QA_BASE_URL" | grep -qvE 'localhost|127\.0\.0\.1|qa\.|staging\.|test\.'; then
  IS_PRODUCTION=true
  echo "⚠️  WARNING: QA running against production: $QA_BASE_URL" | tee "$RUNDIR/production-warning.txt"
  echo "All test data created will be tracked for cleanup." >> "$RUNDIR/production-warning.txt"
fi
echo "$IS_PRODUCTION" > "$RUNDIR/is-production.txt"
# Initialise test data tracking file
echo "[]" > "$RUNDIR/created-test-data.json"
```

### Notes for DevOps agents receiving this issue

When you receive a `[QA] Deploy latest sprint to QA container` issue:

1. Read `PAPERCLIP_QA_HOST` and `PAPERCLIP_QA_PORT` from the project `.env`
   (defaults: `localhost` and `3101`).
2. Build the Docker image: `docker build -t paperclip-qa:latest .`
3. Run the container:
   ```bash
   docker run -d --name paperclip-qa \
     -p "${PAPERCLIP_QA_PORT:-3101}:${PAPERCLIP_APP_PORT:-3100}" \
     -e NODE_ENV=production \
     paperclip-qa:latest
   ```
4. Wait for health:
   ```bash
   curl -sf "http://${PAPERCLIP_QA_HOST:-localhost}:${PAPERCLIP_QA_PORT:-3101}/api/health"
   ```
5. Comment on the issue: `Deployed. QA URL: http://<host>:<port>`
6. Close the issue.

The QA agent will detect your comment and proceed automatically.

---

## Phase 1 — Discovery

Set the run directory first:

```bash
DATE=$(date +%Y-%m-%d)
RUNDIR="report/qa-$DATE"
mkdir -p "$RUNDIR/screenshots"
echo "$RUNDIR" > report/.last-qa-run
```

Read all feature sources using bash. Use `git show HEAD:` so this works even
with sparse checkouts or when source directories are not present on disk.

```bash
# Core docs
git show HEAD:doc/SPEC-implementation.md > "$RUNDIR/src-spec.md"    2>/dev/null || true
git show HEAD:doc/PRODUCT.md             > "$RUNDIR/src-product.md" 2>/dev/null || true
git show HEAD:doc/GOAL.md                > "$RUNDIR/src-goal.md"    2>/dev/null || true
git show HEAD:doc/DEVELOPING.md          > "$RUNDIR/src-developing.md" 2>/dev/null || true
git show HEAD:AGENTS.md                  > "$RUNDIR/src-agents.md"  2>/dev/null || true

# Roadmap
git show HEAD:doc/plans/2026-04-26-pro-plus-roadmap.md \
  > "$RUNDIR/src-roadmap.md" 2>/dev/null || true

# All batch specs
git ls-files 'doc/plans/batch-*-spec.md' 2>/dev/null | while read f; do
  echo "=== $f ===" >> "$RUNDIR/src-batches.md"
  git show "HEAD:$f" >> "$RUNDIR/src-batches.md" 2>/dev/null
  echo "" >> "$RUNDIR/src-batches.md"
done

# Test file inventory
git ls-files \
  'server/src/__tests__/*.test.ts' \
  'tests/e2e/*.spec.ts' \
  'cli/src/__tests__/*.test.ts' \
  'ui/src/__tests__/*.test.ts' \
  'packages/*/src/__tests__/*.test.ts' \
  2>/dev/null > "$RUNDIR/test-inventory.txt"

# Open GitHub issues
gh issue list \
  --repo splatdevtech/paperclip-surfers \
  --state open --limit 200 \
  --json number,title,labels,createdAt \
  > "$RUNDIR/open-issues.json" 2>/dev/null || echo "[]" > "$RUNDIR/open-issues.json"
```

### Step 1e — Fetch recently closed sprint issues from the Paperclip board

**This is mandatory.** The test matrix in Phase 2 must be grounded in what was
actually delivered in the current sprint — not just the static feature inventory.
Read each closed issue's title and description so you know exactly what to verify.

```bash
# Resolve project ID from issue context (ISSUE_PROJECT_ID set by runtime, or
# passed as QA_PROJECT_ID env var)
PROJECT_ID="${QA_PROJECT_ID:-$ISSUE_PROJECT_ID:-}"

if [ -n "$PROJECT_ID" ]; then
  # Fetch issues closed in the last 30 days for this project
  curl -sf \
    "$PAPERCLIP_API/api/companies/$COMPANY_ID/issues?\
projectId=$PROJECT_ID&status=done&status=cancelled&limit=100" \
    -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
    > "$RUNDIR/closed-sprint-issues.json" 2>/dev/null \
    || echo "[]" > "$RUNDIR/closed-sprint-issues.json"

  # Also fetch current sprint issues (any status) for full context
  curl -sf \
    "$PAPERCLIP_API/api/companies/$COMPANY_ID/issues?\
projectId=$PROJECT_ID&limit=200" \
    -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
    | node -e "
      const issues = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
      const done = issues.filter(i =>
        i.status === 'done' || i.status === 'cancelled'
      ).slice(0, 50);
      process.stdout.write(JSON.stringify(done, null, 2));
    " \
    > "$RUNDIR/closed-sprint-issues.json" 2>/dev/null || true
else
  echo "Warning: PROJECT_ID not set — closed issue scan skipped." \
    > "$RUNDIR/closed-sprint-issues-warning.txt"
  echo "[]" > "$RUNDIR/closed-sprint-issues.json"
fi

# Count how many closed issues were found
CLOSED_COUNT=$(node -e "
  try {
    const f = require('fs').readFileSync('$RUNDIR/closed-sprint-issues.json','utf8');
    console.log(JSON.parse(f).length);
  } catch(e) { console.log(0); }
")
echo "Found $CLOSED_COUNT closed sprint issues to verify."
```

Extract each closed issue into a readable summary for Phase 2:

```bash
node -e "
  const fs = require('fs');
  const issues = JSON.parse(fs.readFileSync('$RUNDIR/closed-sprint-issues.json','utf8'));
  const lines = issues.map(i =>
    '### ' + (i.identifier ?? i.id) + ' — ' + i.title + '\n' +
    (i.description ? i.description.slice(0, 800) : '(no description)') + '\n'
  );
  fs.writeFileSync('$RUNDIR/closed-issues-summary.md', lines.join('\n---\n'));
" 2>/dev/null || true
```

**Checkpoint**: confirm these files were written, note which are empty.
Log closed issue count to the chat before proceeding to Phase 2.

---

## Phase 2 — Test Matrix Generation

Read the files written in Phase 1. Build the test matrix from **two sources** —
you must use both; neither alone is sufficient:

**Source A — Closed sprint issues** (`$RUNDIR/closed-issues-summary.md`):
For every closed issue, derive at least one test scenario that directly verifies
the feature or bug fix described in that issue. If the issue has acceptance
criteria, each criterion becomes a scenario. Name the scenario after the issue
identifier so traceability is clear (e.g. `SPL-2041: status-review-queue approve flow`).

**Source B — Feature inventory** (`references/feature-inventory.md`):
For each feature in the inventory, determine:

1. **Happy paths** — nominal scenarios where the feature works correctly
2. **Unhappy paths** — error cases, boundary conditions, concurrent access
3. **Existing test files** — which test files from `test-inventory.txt` cover this feature
4. **Coverage gaps** — scenarios that have NO existing test

Write `$RUNDIR/test-matrix.json`. Use the schema in `references/test-matrix-schema.md`.
Include a `sourceIssue` field on each scenario derived from a closed issue.

Then write `$RUNDIR/coverage-gaps.md` — a Markdown table listing each gap with
feature ID, gap description, suggested test file, and priority (P0/P1/P2).

**Minimum coverage requirements:**
- At least one scenario per closed sprint issue found in Phase 1
- At least the 19 features in `references/feature-inventory.md`
- Expand with any additional features found in docs

If no closed issues were found (PROJECT_ID was not set), note this as a coverage
limitation in the report and proceed with Source B only.

---

## Phase 3 — Automated Test Execution

Run each command. Capture output to files. Never skip a step because a previous
one failed — always run all steps so the report is complete.

```bash
# Step 1 — TypeScript
pnpm -r typecheck > "$RUNDIR/typecheck.log" 2>&1
echo $? > "$RUNDIR/typecheck.exit"

# Step 2 — Unit + integration tests
# vitest --reporter=json writes structured output
pnpm test:run --reporter=json --outputFile="$RUNDIR/unit-results.json" \
  > "$RUNDIR/unit.log" 2>&1
echo $? > "$RUNDIR/unit.exit"

# Step 3 — Build
pnpm build > "$RUNDIR/build.log" 2>&1
echo $? > "$RUNDIR/build.exit"

# Step 4 — E2E (Playwright handles app startup via webServer config)
cd tests/e2e && npx playwright test \
  --reporter=json 2>&1 | tee "../../$RUNDIR/e2e.log"
echo "${PIPESTATUS[0]}" > "../../$RUNDIR/e2e.exit"
cd ../..
```

Parse results into `$RUNDIR/automated-results.json`:

```json
{
  "typecheck": {
    "pass": true,
    "exit": 0,
    "logFile": "typecheck.log"
  },
  "unit": {
    "pass": true,
    "exit": 0,
    "total": 0,
    "passed": 0,
    "failed": 0,
    "failures": [],
    "resultsFile": "unit-results.json"
  },
  "build": {
    "pass": true,
    "exit": 0,
    "logFile": "build.log"
  },
  "e2e": {
    "pass": true,
    "exit": 0,
    "total": 0,
    "passed": 0,
    "failed": 0,
    "failures": [],
    "logFile": "e2e.log"
  }
}
```

To parse `unit-results.json` (vitest JSON format):
- Top-level `numTotalTests`, `numPassedTests`, `numFailedTests`
- `testResults[].assertionResults[]` where `status === "failed"` for failures

To parse `e2e.log` (Playwright JSON reporter to stdout):
- Look for `{ "suites": [...] }` JSON block
- Drill into `suites[].specs[].tests[].results[]` for status
- Or check `e2e.exit` value (0 = all pass)

---

## Phase 4 — Manual Playwright Verification

Check if the app is running:

```bash
curl -sf http://localhost:3100/api/health > /dev/null 2>&1
APP_RUNNING=$?
```

If not running (exit ≠ 0), start it:

```bash
pnpm dev:once > "$RUNDIR/app-startup.log" 2>&1 &
APP_PID=$!
echo $APP_PID > "$RUNDIR/app.pid"
# Wait up to 30s for health endpoint
for i in $(seq 1 30); do
  curl -sf http://localhost:3100/api/health > /dev/null 2>&1 && break
  sleep 1
done
```

Run the manual verification runner:

```bash
node .agents/skills/qa/references/manual-runner.mjs \
  --base-url http://localhost:3100 \
  --output "$RUNDIR/manual-results.json" \
  --screenshots "$RUNDIR/screenshots/"
```

If the manual runner fails to start (missing Playwright install), skip Phase 4
and write `$RUNDIR/manual-results.json` with `{"skipped": true, "reason": "..."}`.

If the app was started by this skill, stop it after Phase 4:

```bash
[ -f "$RUNDIR/app.pid" ] && kill $(cat "$RUNDIR/app.pid") 2>/dev/null || true
```

### Step 4b — Clean up production test data

If `IS_PRODUCTION=true`, delete or reverse every record created during Phase 4:

```bash
if [ "$(cat "$RUNDIR/is-production.txt" 2>/dev/null)" = "true" ]; then
  echo "Cleaning up production test data..."
  node -e "
    const fs = require('fs');
    const created = JSON.parse(fs.readFileSync('$RUNDIR/created-test-data.json','utf8'));
    console.log('Test records to clean up:', JSON.stringify(created, null, 2));
    // For each record: call the appropriate DELETE/archive endpoint
    // Implementation is scenario-specific; QA agent must handle this manually
    // based on what was created during the run.
  " 2>/dev/null || true
  echo "⚠️  Review created-test-data.json and confirm cleanup was performed." \
    >> "$RUNDIR/production-warning.txt"
fi
```

---

## Phase 5 — Report Generation

Run the bundled report generator:

```bash
node .agents/skills/qa/references/report-generator.mjs "$RUNDIR"
```

This produces:
- `$RUNDIR/qa-report.html` — standalone HTML report (no external deps, self-contained)
- `$RUNDIR/scorecard.json` — DoD scorecard (see `references/scorecard-schema.md`)

Print the DoD level and top blockers to the chat:

```
QA Run: report/qa-2026-06-10/
Overall Score: 88.5 / 100
DoD Level: SPRINT_DONE
Blockers:
  - [E2E] budget-hardstop.spec.ts — assertion failed on line 42
  - [Manual] team-chat workflow — message not appearing
Report: report/qa-2026-06-10/qa-report.html
```

---

## Pre-Review Gate (mandatory before in_review)

**Do not change the issue status to `in_review` or submit the final comment until
all of the following are confirmed.** This gate exists because a partial submission
wastes reviewer time and requires a second QA cycle.

### Checklist

```bash
GATE_PASS=true

# 1. Screenshots — at least one screenshot per major workflow tested
SCREENSHOT_COUNT=$(ls "$RUNDIR/screenshots/"*.{png,webp,jpg} 2>/dev/null | wc -l)
if [ "$SCREENSHOT_COUNT" -lt 1 ]; then
  echo "GATE FAIL: No screenshots found in $RUNDIR/screenshots/"
  GATE_PASS=false
else
  echo "✓ Screenshots: $SCREENSHOT_COUNT found"
fi

# 2. QA report document — must be created on the issue before in_review
# (done in Phase 5 via the Paperclip API, not just a comment)
if [ ! -f "$RUNDIR/report-document-id.txt" ]; then
  echo "GATE FAIL: QA report document not uploaded to issue."
  echo "  → Create an issue document via POST /api/issues/:id/documents"
  echo "    and save its ID to $RUNDIR/report-document-id.txt"
  GATE_PASS=false
else
  echo "✓ QA report document ID: $(cat "$RUNDIR/report-document-id.txt")"
fi

# 3. All automated phases ran — exit codes recorded
for phase in typecheck unit build; do
  if [ ! -f "$RUNDIR/$phase.exit" ]; then
    echo "GATE FAIL: Phase 3 ($phase) did not run — exit file missing"
    GATE_PASS=false
  fi
done

# 4. Screenshots uploaded to the Paperclip issue
if [ ! -f "$RUNDIR/attachments-uploaded.txt" ]; then
  echo "GATE FAIL: Screenshots not uploaded as issue attachments."
  echo "  → Upload each screenshot via POST /api/issues/:id/attachments"
  echo "    then write attachment IDs to $RUNDIR/attachments-uploaded.txt"
  GATE_PASS=false
else
  echo "✓ Attachments uploaded"
fi

# 5. Production cleanup confirmed (if applicable)
if [ "$(cat "$RUNDIR/is-production.txt" 2>/dev/null)" = "true" ]; then
  if ! grep -q "cleanup" "$RUNDIR/production-warning.txt" 2>/dev/null; then
    echo "GATE FAIL: Production test data cleanup not confirmed."
    GATE_PASS=false
  fi
fi

if [ "$GATE_PASS" = "false" ]; then
  echo ""
  echo "PRE-REVIEW GATE FAILED — complete all items above before submitting."
  exit 1
fi

echo ""
echo "✓ Pre-review gate passed. Ready to submit final comment and move to in_review."
```

### Uploading screenshots to the issue

```bash
ISSUE_ID="${QA_ISSUE_ID:-}"  # set by runtime from the current issue context
ATTACHMENT_IDS=()

for SCREENSHOT in "$RUNDIR/screenshots/"*.{png,webp,jpg}; do
  [ -f "$SCREENSHOT" ] || continue
  RESP=$(curl -sf -X POST \
    "$PAPERCLIP_API/api/issues/$ISSUE_ID/attachments" \
    -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
    -F "file=@$SCREENSHOT")
  AID=$(echo "$RESP" | node -e "
    const r = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    console.log(r.id ?? '');
  " 2>/dev/null)
  [ -n "$AID" ] && ATTACHMENT_IDS+=("$AID")
  echo "Uploaded $(basename "$SCREENSHOT") → $AID"
done

printf '%s\n' "${ATTACHMENT_IDS[@]}" > "$RUNDIR/attachments-uploaded.txt"
```

### Uploading the QA report document to the issue

```bash
REPORT_BODY=$(cat "$RUNDIR/qa-report-body.md" 2>/dev/null \
  || node "$RUNDIR/../generate-md-report.mjs" "$RUNDIR" 2>/dev/null \
  || echo "# QA Report\n\nSee attached scorecard.")

REPORT_RESP=$(curl -sf -X POST \
  "$PAPERCLIP_API/api/issues/$ISSUE_ID/documents" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(node -e "
    process.stdout.write(JSON.stringify({
      key: 'qa-report',
      title: 'QA Report — Full Cycle Run ($DATE)',
      format: 'markdown',
      body: require('fs').readFileSync('$RUNDIR/qa-report-body.md', 'utf8')
    }));
  " 2>/dev/null || echo '{}')")

DOC_ID=$(echo "$REPORT_RESP" | node -e "
  const r = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log(r.id ?? '');
" 2>/dev/null)

[ -n "$DOC_ID" ] && echo "$DOC_ID" > "$RUNDIR/report-document-id.txt"
echo "QA report document created: $DOC_ID"
```

---

## Phase 6 — Issue Creation

Read `$RUNDIR/scorecard.json` and `$RUNDIR/open-issues.json`.

For each failure in `scorecard.failures[]`:

1. Check if an open issue title already contains the test/workflow name (de-duplicate).
2. If no match, create an issue:

```bash
# Failing unit/E2E test
gh issue create \
  --repo splatdevtech/paperclip-surfers \
  --title "[QA] Test failure: <test name from failure>" \
  --label "bug,qa-regression" \
  --body "$(node -e "
    const fs = require('fs');
    const tmpl = fs.readFileSync('.agents/skills/qa/references/issue-body-test-failure.md','utf8');
    const data = JSON.parse(fs.readFileSync('$RUNDIR/scorecard.json','utf8'));
    console.log(tmpl
      .replace('{{TEST}}', '<test name>')
      .replace('{{ERROR}}', '<error message>')
      .replace('{{FILE}}', '<file>')
      .replace('{{RUN_DIR}}', '$RUNDIR')
    );
  ")"

# Coverage gap (P0 and P1 only — skip P2)
gh issue create \
  --repo splatdevtech/paperclip-surfers \
  --title "[QA] Missing test: <feature> — <gap description>" \
  --label "test-coverage" \
  --body "$(cat .agents/skills/qa/references/issue-body-coverage-gap.md \
    | sed 's/{{FEATURE}}/<feature>/' \
    | sed 's/{{GAP}}/<gap description>/' \
    | sed 's/{{PRIORITY}}/<P0|P1>/')"
```

Write all created issue URLs to `$RUNDIR/created-issues.json`.

If `gh` auth is not available, print a warning and skip Phase 6 gracefully.
Never fail the whole run because of issue creation errors.

---

## Output Summary

After all phases complete, print:

```
=== QA Run Complete ===
Run dir:      report/qa-YYYY-MM-DD/
Version:      <from package.json>
DoD Level:    <SPRINT_DONE | PHASE_DONE | RELEASE_DONE | SHIP_READY | NOT_READY>
Score:        <overall>%
  typecheck:  <pass/fail>
  unit:       <N>/<total> passed
  build:      <pass/fail>
  e2e:        <N>/<total> passed
  manual:     <N>/<total> passed
Gaps (P0/P1): <count>
Issues opened: <count>
HTML report:  report/qa-YYYY-MM-DD/qa-report.html
Scorecard:    report/qa-YYYY-MM-DD/scorecard.json
```

---

## Error Handling

| Situation | Action |
|-----------|--------|
| `git show HEAD:doc/...` returns empty | Continue; note missing doc in report |
| `pnpm test:run` fails to start | Write `unit.exit = 1`, log error, continue |
| App won't start (Phase 4) | Write `manual-results.json` with `skipped: true`, continue |
| `npx playwright` not installed | Skip Phase 4, note in report |
| `gh` not authenticated | Skip Phase 6, print warning |
| `node` report generator fails | Print raw scorecard to chat as fallback |

Never abort mid-run. Always produce at least a partial report.

---

## Reference Files

All reference files are in `.agents/skills/qa/references/`:

| File | Purpose |
|------|---------|
| `workflow-coverage-map.md` | All UI workflows with steps and expected outcomes |
| `feature-inventory.md` | Canonical feature list with module + priority |
| `dod-criteria.md` | DoD levels and gates |
| `test-matrix-schema.md` | JSON schema for test matrix |
| `issue-body-test-failure.md` | GitHub issue body template for test failures |
| `issue-body-coverage-gap.md` | GitHub issue body template for coverage gaps |
| `report-generator.mjs` | Node.js script: reads run dir → writes HTML + scorecard JSON |
| `manual-runner.mjs` | Playwright CLI script: walks all UI workflows |
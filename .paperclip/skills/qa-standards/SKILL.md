---
name: qa-standards
description: QA and test agent standards for Paperclip. Covers required test types, all-paths coverage, screenshot attachment protocol, bug creation format, Playwright E2E structure, and performance thresholds.
---

# QA Standards

Read this skill at the start of every QA or testing run.

> **Which QA skill?** This one is the *standards* (test types, coverage, bug
> format, thresholds) — applies to all QA work. For the **stack mechanics** of
> writing tests (.NET/xUnit, real-MSSQL integration, demo data) use
> **testing-standards**. To run a **manual click-through of a deployed app**
> (drive every role/workflow in a browser, cross-verify UI vs DB, emit a
> run-dir of artifacts) use **project-click-test-qa**, which follows the bug
> format below.

---

## 1. Required Test Types

Every QA run must produce all applicable test types:

| Test type | When required | Tool |
|-----------|--------------|------|
| **Unit tests** | Every new function, service method, or component | Vitest |
| **Regression tests** | Every bug fix — a test that would have caught the original regression | Vitest |
| **Integration tests** | New API endpoints; DB ↔ service layer interactions | Vitest |
| **E2E tests** | Every new user flow or page | Playwright |
| **Performance tests** | Endpoints handling > 100 req/min; critical data paths | `autocannon` or `k6` |
| **Load tests** | Auth, checkout, search, and other concurrent-user critical flows | `k6` |

If a test type is not applicable, state why in your run comment.

---

## 2. All-Paths Coverage Requirement

**Happy paths:** Every primary user flow for every user role (board operator, agent, unauthenticated stakeholder). If the feature has N roles, cover N flows.

**Unhappy paths (must ALL be covered):**
- Invalid input / validation errors
- Missing required fields
- Permission denials (accessing another company's data, wrong role)
- Edge cases (empty lists, max-length strings, zero-value numbers, null fields)
- Timeout or slow-response scenarios (where applicable)

**Workflow routes:** Every branch in a state machine. If an issue can be `todo → in_progress → in_review → done` OR `todo → in_progress → awaiting_approval → in_progress`, both paths need a test.

---

## 3. Screenshot Attachment Protocol

Attach at least one screenshot per test suite to the issue:

1. **Passing test output**: a terminal screenshot or copy of the test runner output showing all tests passing.
2. **UI features**: a screenshot of the rendered UI in its passing state.
3. **Error cases**: a screenshot of the error message or validation state (if testing error handling).

Attach as file comments on the issue, or paste inline. Never claim tests pass without evidence.

---

## 4. Bug Issue Creation Format

For every failure found during QA, create a `bug` type issue (do not just leave a comment):

```
Title: [Bug] <concise description of what's broken>

issueType: bug
priority: [critical / high / medium / low based on severity]
labels: [regression] and/or [blocker] if applicable

Description:
## Environment
- Version: [app version]
- Browser/runtime: [if applicable]

## Steps to reproduce
1. [Step 1]
2. [Step 2]
3. ...

## Expected behavior
[What should happen]

## Actual behavior
[What actually happens]

## Evidence
[Attached screenshot or test output]

## Related issue
Blocked by: #[original issue ID]
```

Link the bug issue back to the original issue with a `blocked_by` or `related` link.

---

## 5. Test Results Comment Format

At the end of every QA run, post this comment on the issue:

```
## Test Results — [YYYY-MM-DD]

| Suite | Result | Count |
|-------|--------|-------|
| Unit | ✅ Passing | 47/47 |
| Regression | ✅ Passing | 3/3 |
| Integration | ✅ Passing | 12/12 |
| E2E (Playwright) | ✅ Passing | 8/8 |
| Performance | ✅ p95 = 180ms (threshold: 500ms) | — |
| Load | ✅ 200 VU, 0 errors | — |

**Issues found:** [none / list bug issue IDs created]
**Evidence:** [screenshot attached / test output attached]
```

If any suite fails, list the failing tests and link the bug issues created.

---

## 6. Playwright E2E Structure

Every Playwright test must follow this structure:

```ts
test('[Feature name] — [scenario]', async ({ page }) => {
  // SETUP: navigate to the feature, log in if needed
  await page.goto('/companies/:id/...');

  // INTERACT: perform the user actions being tested
  await page.click('...');
  await page.fill('...', '...');

  // ASSERT: verify the expected result
  await expect(page.locator('...')).toBeVisible();
  await expect(page.locator('...')).toHaveText('...');

  // CLEANUP: remove any test data created
  // (call API directly or use a test helper)
});
```

Test files live in `tests/e2e/`. Use `test.describe` to group related scenarios. Use `test.afterEach` for cleanup.

---

## 7. Performance Thresholds

Default thresholds (project settings may override):

| Metric | Default threshold |
|--------|-----------------|
| p50 response time | < 100ms |
| p95 response time | < 500ms |
| p99 response time | < 2000ms |
| Error rate under load | < 0.1% |
| Throughput (minimum) | > 50 req/s for critical endpoints |

If a project defines its own thresholds in project settings or a comment on the performance issue, use those instead.

If thresholds are exceeded:
1. Create a `bug` issue with type `task` (performance issue) and priority `high`.
2. Include profiling output or response time histogram in the issue.
3. Do not mark the original issue `done` until performance is within threshold.

---
name: "ci-validation-gates"
description: "Defensive CI/CD patterns: semver validation, token checks, retry logic, draft detection — earned from v0.8.22"
domain: "ci-cd"
confidence: "high"
source: "extracted from Drucker and Trejo charters — earned knowledge from v0.8.22 release incident"
---

## Context

CI workflows must be defensive. These patterns were learned from the v0.8.22 release disaster where invalid semver, wrong token types, missing retry logic, and draft releases caused a multi-hour outage. Both Drucker (CI/CD) and Trejo (Release Manager) carried this knowledge in their charters — now centralized here.

## Patterns

### Semver Validation Gate
Every publish workflow MUST validate version format before `npm publish`. 4-part versions (e.g., 0.8.21.4) are NOT valid semver — npm mangles them.

```yaml
- name: Validate semver
  run: |
    VERSION="${{ github.event.release.tag_name }}"
    VERSION="${VERSION#v}"
    if ! npx semver "$VERSION" > /dev/null 2>&1; then
      echo "❌ Invalid semver: $VERSION"
      echo "Only 3-part versions (X.Y.Z) or prerelease (X.Y.Z-tag.N) are valid."
      exit 1
    fi
    echo "✅ Valid semver: $VERSION"
```

### NPM Token Type Verification
NPM_TOKEN MUST be an Automation token, not a User token with 2FA:
- User tokens require OTP — CI can't provide it → EOTP error
- Create Automation tokens at npmjs.com → Settings → Access Tokens → Automation
- Verify before first publish in any workflow

### Retry Logic for npm Registry Propagation
npm registry uses eventual consistency. After `npm publish` succeeds, the package may not be immediately queryable.
- Propagation: typically 5-30s, up to 2min in rare cases
- All verify steps: 5 attempts, 15-second intervals
- Log each attempt: "Attempt 1/5: Checking package..."
- Exit loop on success, fail after max attempts

```yaml
- name: Verify package (with retry)
  run: |
    MAX_ATTEMPTS=5
    WAIT_SECONDS=15
    for attempt in $(seq 1 $MAX_ATTEMPTS); do
      echo "Attempt $attempt/$MAX_ATTEMPTS: Checking $PACKAGE@$VERSION..."
      if npm view "$PACKAGE@$VERSION" version > /dev/null 2>&1; then
        echo "✅ Package verified"
        exit 0
      fi
      [ $attempt -lt $MAX_ATTEMPTS ] && sleep $WAIT_SECONDS
    done
    echo "❌ Failed to verify after $MAX_ATTEMPTS attempts"
    exit 1
```

### Draft Release Detection
Draft releases don't emit `release: published` event. Workflows MUST:
- Trigger on `release: published` (NOT `created`)
- If using workflow_dispatch: verify release is published via GitHub API before proceeding

### Build Script Protection
Set `SKIP_BUILD_BUMP=1` (or `$env:SKIP_BUILD_BUMP = "1"` on Windows) before ANY release build. bump-build.mjs is for dev builds ONLY — it silently mutates versions.

## Known Failure Modes (v0.8.22 Incident)

| # | What Happened | Root Cause | Prevention |
|---|---------------|-----------|------------|
| 1 | 4-part version published, npm mangled it | No semver validation gate | `npx semver` check before every publish |
| 2 | CI failed 5+ times with EOTP | User token with 2FA | Automation token only |
| 3 | Verify returned false 404 | No retry logic for propagation | 5 attempts, 15s intervals |
| 4 | Workflow never triggered | Draft release doesn't emit event | Never create draft releases |
| 5 | Version mutated during release | bump-build.mjs ran in release | SKIP_BUILD_BUMP=1 |

## Security Scanning Patterns

Run before every staging or production deploy as part of the security gate.

### Secret Scanning
```sh
# Option A: gitleaks (preferred)
gitleaks detect --source . --no-git --exit-code 1

# Option B: trufflehog
trufflehog filesystem . --fail
```

Any finding = deploy blocked. Create a `critical` bug issue with the finding details (file, line, type — **NOT the secret value**). The issue title must be: `[Bug] Secret detected in codebase — deploy blocked`.

### Dependency Vulnerability Audit
```sh
pnpm audit --audit-level=high
# or for npm projects:
npm audit --audit-level=high
```

Exit code non-zero = critical/high vulnerabilities found. Block deploy. Create a bug issue per vulnerability with CVE ID and package name.

### SAST with semgrep
```sh
semgrep --config=auto --error --metrics=off .
```

Runs static analysis across the codebase. For large repos, run on the diff only:
```sh
git diff --name-only HEAD~1 | xargs semgrep --config=auto --error --metrics=off
```

Critical rules include: hardcoded credentials, SQL injection, path traversal, XSS. Critical/high findings create bug issues; use judgment on whether to block deploy.

### Scan result comment format (post to sprint)
```
## Security Scan — [Sprint / Deploy target] — [Date]
- Secret scan: ✅ No secrets found / ❌ [N] finding(s) — issues created: SPL-XXXX
- Dependency audit: ✅ Clean / ⚠️ [N] medium / ❌ [N] high|critical — issues: SPL-XXXX
- SAST: ✅ No critical findings / ⚠️ [N] finding(s) — issues: SPL-XXXX
Deploy decision: PROCEEDING / BLOCKED — [reason]
```

## Anti-Patterns
- ❌ Publishing without semver validation gate
- ❌ Single-shot verification without retry
- ❌ Hard-coded secrets in workflows
- ❌ Silent CI failures — every error needs actionable output with remediation
- ❌ Assuming npm publish is instantly queryable
- ❌ Deploying without running the secret scan first
- ❌ Including secret values (tokens, passwords) in bug issue descriptions

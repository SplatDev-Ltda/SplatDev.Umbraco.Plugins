---
name: devops-staging-deploy
description: DevOps staging deploy discipline for Paperclip. Covers sprint-close deploy trigger, security scan sequence, Docker staging deploy, health check polling, feature flag sequencing, and rollback procedure.
---

# DevOps Staging Deploy

Read this skill when triggered by a sprint-close event, a deploy request, or a feature flag enable action.

---

## 1. Sprint-Close Deploy Trigger

When notified that a sprint is complete (`wakeReason: sprint_completed` or a PM comment tagging you):

**Pre-deploy checklist:**
- [ ] All sprint issues are in `done` status (or explicitly deferred to next sprint with PM sign-off)
- [ ] Security scan passed (see §2)
- [ ] `pnpm -r typecheck && pnpm test:run && pnpm build` passes on the sprint branch

If any check fails, post a sprint comment explaining what blocked the deploy. Do not deploy until resolved.

---

## 2. Security Scan Sequence

Run ALL three scans before any staging deploy. Stop on first critical finding.

### Step 1: Secret Scanning
```sh
# Option A: gitleaks (preferred)
gitleaks detect --source . --no-git --exit-code 1

# Option B: trufflehog
trufflehog filesystem . --fail
```

**On finding:** STOP. Create a `critical` bug issue:
- Title: `[Bug] Secret detected in codebase — deploy blocked`
- Include: file path, line number, type of secret (NOT the secret value itself)
- Do not deploy until the secret is removed and git history scrubbed.

### Step 2: Dependency Vulnerability Audit
```sh
pnpm audit --audit-level=high
```

**On critical/high finding:** Create a `high` priority bug issue per vulnerability. Block deploy.
**On medium finding:** Create a `medium` priority bug issue. Deploy may proceed with PM sign-off.
**On low finding:** Note in sprint comment. No block.

### Step 3: SAST (if semgrep installed)
```sh
semgrep --config=auto --error --metrics=off .
```

**On critical/high finding:** Create a bug issue. Use judgment on whether to block (block for: SQL injection, hardcoded secrets, path traversal, XSS; allow with note for: style issues, minor warnings).

### Post-scan sprint comment:
```
## Security Scan — [Sprint Name] — [Date]

- Secret scan: ✅ No secrets found / ❌ [finding summary — NO secret values]
- Dependency audit: ✅ Clean / ⚠️ [N] medium vulns (issues created: SPL-XXXX)
- SAST: ✅ No critical findings / ⚠️ [N] findings (issues created: SPL-XXXX)

Deploy decision: PROCEEDING / BLOCKED — [reason]
```

---

## 3. Staging Deploy Execution

> ⚠️ **If this deploy PROVISIONS a site with a login (a store, a CMS, an admin panel), record
> the admin credentials into the project's scoped env vars the moment the account exists** —
> before installing anything, before screenshots, before reporting progress. See
> `provisioned-site-credentials`. The fleet stood up `nopcommerce.splatdev.tech`, never recorded
> its admin login, and locked itself out of the store it built for plugin validation.

The default staging environment is a Docker container on the same host as production, on a different port. Environment details are in project settings → environments → staging.

```sh
# Read staging environment from project settings first
# Then run the project's configured deploy script, or the default:

DEPLOY_HOST_PASSWORD="<staging_pw>" DEPLOY_PORT="<staging_port>" bash scripts/deploy-staging.sh

# If no staging script exists, use the production script with a staging override:
PAPERCLIP_ENV=staging DEPLOY_HOST_PASSWORD="<pw>" bash scripts/deploy-prod.sh
```

After the deploy script completes, verify the container is running:
```sh
ssh root@<staging-host> "docker ps | grep paperclip-staging"
```

---

## 4. Health Check Polling

After every deploy (staging or production), poll the health endpoint:

```sh
HEALTH_URL="https://<app-host>/api/health"  # or http:// for staging
CONSECUTIVE_FAILURES=0

for i in $(seq 1 10); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
  echo "[$i/10] Health check: HTTP $STATUS"
  
  if [ "$STATUS" = "200" ]; then
    CONSECUTIVE_FAILURES=0
    echo "✅ Health check passed"
  else
    CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
    echo "⚠️ Health check failed ($CONSECUTIVE_FAILURES consecutive)"
    
    if [ $CONSECUTIVE_FAILURES -ge 2 ]; then
      echo "❌ 2+ consecutive failures — triggering rollback protocol"
      break
    fi
  fi
  
  sleep 60
done
```

**On 2+ consecutive health check failures:**
1. Create a `critical` bug issue: `[Bug] Post-deploy health check failure — [environment]`
2. If auto-rollback is enabled (project settings): run the rollback script.
3. Post sprint comment: deploy failed, rollback triggered (or manual action needed).
4. Notify PM.

---

## 5. Staging → Production Promotion

Production deploys are a **manual gate**. Do not promote to production automatically.

When the operator clicks "Promote to Production" (or creates a production deploy issue):
1. Re-run the security scan (§2) on the same commit that was deployed to staging.
2. Confirm staging health checks are all passing.
3. Run the production deploy script.
4. Run the post-deploy health check (§4) against production.
5. Post a deploy summary comment on the sprint.

---

## 6. Feature Flag Sequencing

When enabling a new feature flag:

1. **Enable on staging first**: confirm the feature works as expected.
2. **Operator approval**: post a comment on the feature flag issue requesting operator approval to enable on production. Set status to `awaiting_approval`.
3. **Enable on production**: only after operator approval.
4. **Monitor**: watch error rate for 30 minutes after enabling on production.

If a feature flag enable causes errors:
- Disable the flag immediately (no deploy needed — instant toggle).
- Create a bug issue with the error details.
- Do not re-enable until the bug is resolved.

---

## 7. Rollback Procedure

If a deploy causes a regression or critical error:

1. **Immediate disable** (if feature-flagged): disable the flag. No redeploy needed.
2. **Container rollback** (if not feature-flagged):
   ```sh
   # On the production host:
   docker pull <registry>/<image>:<previous-version-tag>
   docker compose -p paperclip-pro-plus down
   docker compose -p paperclip-pro-plus up -d
   ```
3. **Post a critical incident comment** on the sprint summarizing: what failed, what version was rolled back to, next steps.
4. **Create a `critical` bug issue** for the regression. Do not re-deploy until it is fixed.

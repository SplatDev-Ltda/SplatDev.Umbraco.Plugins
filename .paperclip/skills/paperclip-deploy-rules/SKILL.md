---
name: paperclip-deploy-rules
description: Mandatory deploy checklist for agents managing Paperclip deployments. Covers version bumping, Docker image build + push, post-deploy cleanup, GitHub milestone creation, PR review gate, documentation requirements, and version-match enforcement.
---

# Paperclip Deploy Rules

You are an agent responsible for deploying Paperclip. These rules apply **every
time** a deploy is executed. Do not skip any step.

---

## Mandatory Deploy Checklist

### 1 — Bump the patch version before building

```sh
PAPERCLIP_DEPLOY=1 node scripts/bump-version.mjs
```

Commit and push the version bump **before** building or deploying the image.
`bump-version.mjs` updates both `server/package.json` and `ui/package.json`
to keep back-end and front-end versions in sync.

### 2 — Build and push the image to production

```sh
DEPLOY_HOST_PASSWORD="<root_password>" bash scripts/deploy-prod.sh
```

The script builds the Docker image in WSL, pipes it to the production host over
SSH, and restarts the container. Confirm the container is running after the
script completes.

### 3 — Prune old Docker images on the host

```sh
ssh root@<production-host> "docker image prune -f"
```

Run immediately after every deploy to prevent disk exhaustion on the host.

### 4 — Create a GitHub milestone for the version tag

```sh
gh api repos/<owner>/<repo>/milestones \
  --method POST \
  -f title="v<version>" \
  -f state="open"
```

Replace `<version>` with the version from `server/package.json`.

### 5 — PR review gate (5+ PRs)

Before merging **5 or more** open PRs into master in a single deploy cycle:

```sh
gh pr list -R <owner>/<repo> --state open
gh pr view <num> -R <owner>/<repo> --comments
```

Read all reviewer comments and apply suggestions/recommendations before merging.

### 6 — Keep documentation updated

Every branch and PR that ships a feature or fix must update the active roadmap
document on that same branch. Mark completed items ✅ in the same commit.

### 7 — Keep back-end and front-end version matched

Both `server/package.json` and `ui/package.json` must carry the same version.
Running `bump-version.mjs` with `PAPERCLIP_DEPLOY=1` handles this automatically.
If you see a version mismatch, run the bump script before building.

---

## Pre-Deploy Security Gate

Before every staging deploy, run the full security scan sequence (see `devops-staging-deploy` skill for the complete protocol):

1. **Secret scan** (`gitleaks` or `trufflehog`) — any finding blocks deploy
2. **Dependency audit** (`pnpm audit --audit-level=high`) — critical/high findings block deploy
3. **SAST** (`semgrep --config=auto --error .`) — critical findings require judgment call

Post a security scan summary comment on the sprint before running the deploy script.

## Staging vs Production

**Staging** (automatic on sprint close):
- Triggered by PM when sprint is closed and all issues are `done`
- DevOps runs security scan + staging deploy + health check automatically
- PM notified of result

**Production** (manual operator gate):
- Never deploy to production automatically
- Operator must explicitly approve (click "Promote to Production" or create a production deploy issue)
- Re-run security scan on the same commit before production deploy

## Deploy Verification

After every deploy, confirm:

```sh
# Check container is running
ssh root@<production-host> "docker ps | grep paperclip"

# Tail logs for startup errors
ssh root@<production-host> "docker compose -p paperclip-pro-plus logs --tail=50 server"
```

Look for the startup recovery sweep completing without errors. If the server
crashes on startup, read the logs before attempting a re-deploy.

---

## Post-Deploy Health Check

After every deploy (staging AND production), poll the health endpoint for 10 minutes:

```sh
HEALTH_URL="https://<app>/api/health"
CONSECUTIVE_FAILURES=0

for i in $(seq 1 10); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
  echo "[$i/10] Health: $STATUS"
  if [ "$STATUS" = "200" ]; then
    CONSECUTIVE_FAILURES=0
  else
    CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
    echo "⚠️ Health check failed ($CONSECUTIVE_FAILURES consecutive)"
    if [ $CONSECUTIVE_FAILURES -ge 2 ]; then
      echo "❌ 2+ consecutive failures — create critical bug issue"
      break
    fi
  fi
  sleep 60
done
```

If 2+ consecutive failures: create a critical bug issue and notify PM immediately. Do not wait for the loop to complete.

## Quick Reference

| Step | Command |
|---|---|
| Version bump | `PAPERCLIP_DEPLOY=1 node scripts/bump-version.mjs` |
| Deploy | `DEPLOY_HOST_PASSWORD="<pw>" bash scripts/deploy-prod.sh` |
| Prune images | `ssh root@<host> "docker image prune -f"` |
| Create milestone | `gh api repos/<owner>/<repo>/milestones --method POST -f title="v<ver>"` |
| View PR comments | `gh pr view <num> -R <owner>/<repo> --comments` |
| Check container | `ssh root@<host> "docker ps \| grep paperclip"` |

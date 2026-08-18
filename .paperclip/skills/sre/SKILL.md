---
name: sre
description: Keep the fleet's production reliable — monitor health, respond to incidents, run safe deploys and rollbacks, protect backups/DR, and prevent recurring failure modes. Use for uptime/health checks, when prod is degraded or an alert fires, before/after a deploy, when a run is failing/hanging, or when asked to "check prod / investigate an outage / make it more reliable / set up monitoring". Complements the `finops` skill (cost) — this one is uptime & correctness.
---

# SRE — keep production reliable

Your job: know when prod is unhealthy, respond to incidents methodically, deploy without breaking things,
and turn every incident into a durable fix so it doesn't recur. **Reliability first, then speed.** Never
make a risky change to a healthy prod without a rollback path. Measure, don't guess.

## The reliability surfaces

1. **Prod app health.** The server (`mybusiness.splatdev.tech` / Unraid `:3100`) — `/api/health` reports
   the running version. Degraded = wrong version, 5xx, slow, or a restart loop.
2. **The host (Unraid 192.168.68.230).** Docker stack health, disk/RAM/CPU, the array/parity state,
   docker.img + nvme-cache pressure.
3. **Deploys.** `scripts/deploy-prod.sh` (builds in WSL → pipes the image to Unraid → recreates the
   server → health-checks → prunes → milestone). This is the highest-risk routine operation.
4. **Data durability.** DB backups (retention + restorability), the persistent volume, git integrity.
5. **The agent fleet.** Run failures/hangs/no-op ticks, budget hard-stops, heartbeat health, stuck
   agents. (SysMon is the in-fleet health/balance agent.)
6. **Alerting/observability.** The messaging notification bridge (Telegram/WhatsApp/push) for
   run_failure / run_hang / issue_blocked / approval_needed; container logs.
7. **The VPS** (hosting.splatdev.tech) — the sites/services hosted there.

## Health check (read-only, do this first)

- **App:** `curl -sS http://192.168.68.230:3100/api/health` → confirm `version` matches the intended
  release; hit it through the public URL too. A version mismatch after a deploy = the recreate/health
  step failed.
- **Containers:** `docker ps --format '{{.Names}}\t{{.Status}}'` — anything `Restarting`/`Exited`/
  unhealthy? `docker logs <name> --tail 100` for the offender.
- **Host:** `df -h` (disk), `free -h` / `cat /proc/loadavg`, and **parity state**
  (`grep -iE 'resync|check' /proc/mdstat`, `mdcmd status | grep mdResync`) — an active parity check +
  heavy I/O is the known **meltdown risk**; never run a deploy or heavy prune during one.
- **DB:** reachable, recent backup present, size/growth sane.

## Deploy safety (the biggest lever)

- **Pre-deploy gate:** (a) no other deploy running (`pgrep -f 'deploy-prod|docker build'` — two concurrent
  deploys race the prune + prod restart); (b) no active parity check / heavy host I/O; (c) working tree
  is the intended commit. Deploys auto-bump+commit+push the version and self-prune WSL Docker.
- **During:** the build is long (~30–60 min: build → pipe ~10GB → recreate → health-check → prune). A
  deploy interrupted mid-run can leave prod on the OLD version AND corrupt local git (empty objects /
  bad HEAD). Don't kill a deploy unless you must.
- **Rollback:** re-deploy the previous good version (`DEPLOY_SKIP_BUMP=1` on the prior tag/commit) or
  recreate the server from the previous image tag on the host (`docker tag/compose up -d server`). The
  DB migrations are additive-forward — plan any schema rollback deliberately.
- **After:** confirm `/api/health` shows the new version AND spot-check the changed feature. A green
  build ≠ a healthy prod.

## Incident response (methodical, not reflexive)

1. **Assess:** what's the actual symptom + blast radius? (one agent vs. all, one company vs. all.)
   Check `/api/health`, `docker ps`, the relevant logs. Don't fix before you understand.
2. **Stabilize:** restore service first (rollback/redeploy/restart the failing container), then diagnose
   root cause — but capture evidence (logs, versions) before restarting away the state.
3. **Root-cause:** reproduce or trace it; distinguish symptom from cause (a restart loop is a symptom).
4. **Durable fix:** land a code/config fix + a regression guard so it can't recur. A one-time restart is
   not a fix.
5. **Recurring fleet failures:** run_failure / run_hang / no-op ticks / stuck agents — check the run
   events, the heartbeat, and budgets; a no-op tick that still spends tokens is both a reliability AND a
   cost bug (hand the cost side to `finops`).

## Known recovery playbooks (this fleet)

- **Interrupted deploy → prod stuck on old version:** the version was likely already bumped/pushed;
  re-run the deploy with `DEPLOY_SKIP_BUMP=1` (cached layers make it faster) after repairing anything
  the interruption broke.
- **Corrupted local git** (empty `.git/objects/*` files, `bad object HEAD`, bad refs — a
  process/deploy killed mid-write): remove the empty objects (`find .git/objects -type f -empty -delete`),
  remove any zero-sha refs, point HEAD at a valid branch, `git fetch origin`, then
  `git reset --hard origin/master` (origin holds the truth). `git fsck --full` to confirm clean.
- **Storage pressure:** prune dangling images/build-cache (NOT during a deploy), clear leaked temp/build
  files, tighten backup retention — see `finops`/nvme-cache notes; never delete data without a check.

## Security findings — hand them over by FAMILY, never one per rule

A Checkov scan produces hundreds of findings, and one issue per finding is the
wrong unit of work. On 2026-08-13 a single scan had become **119 issues, 116 of
them in one project and every one assigned to the same agent** — each an agent
run that re-sends its whole context to change a line of Terraform. `CKV_AZURE_6`
and `CKV_AZURE_165` are the same file, the same review and the same deploy.

Group by rule family (`CKV_AZURE_*`, `CKV_K8S_*`, `CKV_AWS_*`, …) and hand each
family over once:

```http
POST /api/companies/{companyId}/security/findings/assign-batch
Authorization: Bearer $PAPERCLIP_API_KEY
Content-Type: application/json

{ "assigneeAgentId": "<agent>", "severities": ["CRITICAL", "HIGH"] }
```

One issue per (project, family), carrying every rule's meaning, fix and waiver
guidance, and every affected file. It reuses an **open** family issue rather
than minting a second, so a later scan joins work already in flight — but never
attaches to a closed one.

Use the single-finding `POST /security/findings/{id}/assign` only when you are
handing over **one** alert deliberately.

**Closing a family issue:** every rule in it is either fixed or waived with a
stated justification. Saying "done" having fixed one rule of twelve is the
failure this grouping makes easy — name which are fixed and which are waived.

## Guardrails

- **Reliability > speed:** never push a risky change to a healthy prod without a rollback path.
- **Capture before you restart** — a restart destroys the state you need to root-cause.
- **One change at a time** during an incident, so you know what fixed (or worsened) it.
- **Never** run heavy I/O during a parity check; **never** run two deploys at once.
- **Escalate** to the operator for anything that risks data loss, a prolonged outage, or an
  irreversible action — with the symptom, the blast radius, and the options.

## Definition of done

An SRE action produces: prod verified healthy (correct version + the affected flow works), the incident
root-caused (not just papered over) with a durable fix or a filed follow-up, evidence captured (logs/
versions/what changed), and — for anything recurring — a guard so it can't silently return. If you
stabilized but couldn't root-cause, say so explicitly and hand off the open thread.

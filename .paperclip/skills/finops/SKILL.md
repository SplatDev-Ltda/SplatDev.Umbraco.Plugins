---
name: finops
description: Review the fleet's infrastructure and resources for cost efficiency and eliminate financial waste. Use for periodic (weekly/monthly) cost reviews, before/after a deploy, when a bill spikes, or when asked to "reduce spend / find waste / right-size / audit costs". Covers the Unraid host + Docker stack, the VPS, storage, the database, external SaaS/API spend, LLM/model spend, and agent budgets — with concrete commands and a report format.
---

# FinOps — minimize financial waste across the fleet

Your job: find money the fleet is burning that it doesn't need to, quantify it, and either fix it
(cheap, reversible cleanups) or recommend it with a clear $/effort/risk tradeoff. **Never** delete
data, drop a container, or cancel a paid service without explicit operator approval — FinOps proposes
and reversibly cleans; it does not destroy. Provenance and reversibility on every recommendation.

## The cost surfaces (where money leaks here)

1. **LLM / model spend (usually the biggest lever).** Agents run on paid model APIs (OpenRouter,
   opencode/deepseek, etc.). Waste = over-powered models for trivial tasks, no-op runs that still spend
   tokens, runaway loops, agents with no budget cap, prompt bloat (huge context on every tick).
2. **External SaaS / API subscriptions.** CRM/enrichment (Apollo), messaging (Telegram/WhatsApp/Telnyx),
   voice (Deepgram/ElevenLabs), analytics (Ahrefs), payment sandboxes, etc. Waste = paid seats/plans
   nobody uses, duplicate tools doing the same job, plans over-sized for actual usage.
3. **Compute — Unraid host + Docker stack.** Many containers (server, db, joinly, cloudflared, coturn,
   livekit, jambonz-*, dograh-*, code-server, browser-broker, …). Waste = idle/never-used services left
   running, over-allocated CPU/RAM, images built every deploy but never run.
4. **The VPS** (hosting.splatdev.tech / 169.197.183.25). Waste = an over-sized droplet, dead sites,
   services that could fold back onto the Unraid host.
5. **Storage.** Waste = leaked temp files, oversized DB backups, docker.img bloat, orphaned volumes,
   old images, the nvme-cache filling up. (See the `nvme-cache-cleanup` notes.)
6. **Database.** Waste = unbounded table growth (activity logs, run events, heartbeat runs), no
   retention, missing indexes causing expensive scans, a second store kept alive after a migration.
7. **Agent budgets & activity.** Waste = agents with no monthly budget, agents that no-op every
   heartbeat, terminated agents still scheduled, over-frequent heartbeats.

## How to review (concrete, read-only first)

Do a **read-only pass** and quantify before proposing anything.

- **Docker footprint (Unraid):** `docker ps -a --format '{{.Names}}\t{{.Status}}\t{{.Image}}'` (find
  stopped/idle), `docker stats --no-stream` (live CPU/RAM per container — spot over-allocation & idle),
  `docker system df` (images/containers/volumes/build-cache reclaimable), `docker images` (dangling/old
  tags). Cross-check each running container against "does the fleet actually use it?" — the jambonz-*,
  dograh-*, coturn, livekit, joinly stacks are heavy; if a capability is dormant, that's spend.
- **Storage:** `df -h` + `du -sh` the big dirs; DB backups (`PAPERCLIP_DB_BACKUP_DIR`, check retention is
  bounded — GFS: keep few hourly/daily); `/tmp`, server `tmp` leaked `.so`/build files; docker.img size.
- **Database growth:** query the biggest tables and their growth — `activity_log`, `run_events`,
  `heartbeat_runs`, embeddings/vectors. Ask: is there retention? Are old rows ever pruned?
  `SELECT relname, n_live_tup, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(relid) DESC LIMIT 20;`
- **LLM spend:** review agent `adapter_type`/model vs. task difficulty (a CEO/secretary agent doesn't
  need a frontier model); look for no-op runs (runs that spend tokens but change nothing — see the
  no-op-run notes); confirm every active agent has a **budget** (`agents.budget` / budget hard-stop).
  Prefer the cheapest model that passes the task's quality bar; reserve expensive models for the hard
  agents only.
- **SaaS/API:** list every paid integration + its plan + last-used date. Flag: paid-but-idle, duplicate
  capability (two tools for the same job), plan over-sized vs. metered usage. (This fleet has history
  here: HubSpot was canceled for Apollo Basic $49; Anthropic keys are empty by design; Chroma was
  retired for pgvector. Keep pruning in that spirit.)
- **VPS:** `ssh` in, `docker ps`/`systemctl`/`df -h`; identify dead sites and services that could move
  to Unraid or be dropped; check the droplet size vs. actual load.

## What to fix vs. recommend

- **Fix now (cheap, reversible, no data loss):** prune dangling images / stopped containers /
  build-cache (`docker image prune`, `docker builder prune` — but NEVER during an active deploy, which
  self-prunes); delete leaked temp/build files; tighten backup retention; add a missing budget cap; add
  a missing index. Log exactly what you reclaimed.
- **Recommend (needs approval):** stopping/removing a service, cancelling a subscription, downsizing the
  VPS, downgrading an agent's model, deleting historical data. For each: **$ saved / month, effort,
  risk, and how to reverse it.** Rank by $/effort.

## Guardrails (do not skip)

- **Read before you cut.** Confirm a container/service/table is truly unused (no recent activity, no
  dependents) before proposing removal. "I don't recognize it" ≠ "it's waste."
- **Never delete data or cancel paid services without explicit operator approval.**
- **Don't fight an active deploy** — `deploy-prod.sh` self-prunes WSL Docker on every ship; pruning
  mid-deploy races it. Check `pgrep -f 'deploy-prod|docker build'` first.
- **Watch the Unraid meltdown risk** — never run heavy I/O (big prunes, `du -sh /`, balance) during a
  parity check.
- **Measure twice.** Quantify current spend and projected savings before recommending; a guess isn't a
  FinOps finding.

## Definition of done

A FinOps review produces: (1) a quantified inventory of the cost surfaces above; (2) reversible
cleanups already applied, each with what was reclaimed; (3) a ranked list of approval-needed
recommendations with $/month saved · effort · risk · how-to-reverse; (4) no data deleted and no service
cancelled without approval. Recurring waste (e.g. unbounded log growth) gets a durable fix
(retention/cron), not a one-time sweep.

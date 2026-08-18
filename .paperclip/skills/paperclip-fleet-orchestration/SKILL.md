---
name: "paperclip-fleet-orchestration"
description: "Drive a Paperclip-tracked, Azure DevOps-hosted project to completion with an agent fleet: poll the board, delegate issues with specs, verify branches on staging BEFORE merging, run the Azure merge gate (vote->complete; handles drafts/conflicts/CI-too-old/auto-complete), deploy, and reschedule the monitor loop."
domain: "orchestration"
confidence: "high"
source: "extracted from the Studio Wellness build session — operator loop: poll -> delegate -> verify-before-merge -> merge gate -> deploy -> reschedule"
---


# Paperclip Fleet Orchestration

Drive a project to completion by looping: **poll → delegate → verify-before-merge → request-approval → (after approval) merge gate → deploy**. The fleet (other Paperclip agents) writes code; **you are the DevOps agent acting as the fleet's delivery operator** — you review, verify on a live (staging) environment, request human sign-off for the irreversible steps, then merge/deploy and re-delegate gaps.

**You are an agent, not a human at a terminal.** You run this loop **once per server heartbeat** — there is no `ScheduleWakeup`, no busy-loop, no "monitor until done in one sitting". Each heartbeat does one useful pass and leaves the board in a state the *next* heartbeat resumes (see **Loop continuation** below).

## Setup (once per repo)

Each repo needs `.claude/paperclip-orchestration.json` (see `paperclip-orchestration.example.json` next to this file). It holds IDs and deploy commands — **never secrets**, only *paths + line numbers* to the existing credential files.

**Agent-runtime paths, not operator-laptop paths.** Because this runs inside the agent's runtime/instance (not an operator's WSL home), the config and every credential file it points to must live under the **agent's instance** — e.g. `/paperclip/instances/default/...` — **not** `~/.claude/...` or any operator-laptop path.

**The board token is your own agent API key.** `paperclip.tokenFile` must point at *your* agent key file (you act as yourself on the board), **not** a shared operator token. Provisioning these credential files (your API key, the git PAT, the deploy creds) is an **operator setup step** — the scripts read the files, they do not mint the key.

**Provider switch.** Top-level `"provider": "azure" | "github"` (default `azure`, back-compat) selects which git backend the board/merge/rebase scripts drive:
- `azure` — uses the `"azure"` block (org/project/repoId/operatorId + PAT file) and the Azure REST merge gate.
- `github` — uses a `"github"` block (`repo` = `owner/name`, `patFile`, `patLine`) and the `gh` CLI. **Requires the `gh` CLI installed**; the scripts authenticate it with the config's token (passed via `GH_TOKEN`, never argv) so you do not need a separate `gh auth login`.

Validate it:

```bash
PCO="$(dirname "$0")/scripts"   # the scripts/ dir next to this skill in your instance
bash "$PCO/board.sh" poll       # lists open issues + active PRs → confirms config + auth work
```

All scripts read the config via `_config.sh`; run them from the repo root.

## The loop

```
1. board.sh poll              → open issues (+ statuses) and active PRs (+ mergeStatus)
2. for each CI-green PR:
     deploy_verify.sh <branch> → deploy the BRANCH to staging, run live checks   (always run by the agent)
       PASS  + mode=approval-gated → post verify evidence to the tracking issue,
                                     move it to awaiting_approval (assigned to the human
                                     operator), STOP on this PR. Do NOT merge or prod-deploy.
       PASS  + already-approved    → merge_gate.sh <pr#>      (human signed off on a prior heartbeat)
       PASS  + mode=auto           → merge_gate.sh <pr#>      (only on an operator-granted trusted project)
       CONFLICTS                   → rebase_pr.sh <branch> [--ours/--theirs ...], re-verify
       FAIL                        → board.sh update <id> <status> <gapSpecFile>   (re-delegate the specific gap)
3. after an APPROVED merge: deploy_verify.sh main   → publish to prod/staging, re-confirm
4. new/failed work: board.sh create <backend|frontend> <status> "<title>" <specFile>
5. one useful pass done → leave the board resumable and stop (see Loop continuation).
```

## Modes

**`approval-gated` (default).** Poll, delegate, and `deploy_verify.sh <branch>` (staging verify) run **automatically**. The **irreversible steps are NOT run by the agent**:

- **merge to main** (`merge_gate.sh`), and
- **prod deploy** (`deploy_verify.sh main`).

When a PR passes staging verify, you **post the verification evidence to the tracking issue**, move it to **`awaiting_approval`** (assigned to the human operator), and **stop on that PR**. Only after a human **approves** — the issue is advanced past `awaiting_approval`, or an "approved" decision is recorded on it — does a **later heartbeat** run `merge_gate.sh` and the main deploy. This maps directly onto Paperclip's existing `awaiting_approval` flow (no new API): `awaiting_approval` means *"work is ready, a human must sign off, leave it assigned and stop"*.

**`auto` (opt-in).** The original behavior: verify → merge → deploy in one pass. Use **only when the operator explicitly grants it** for a trusted project.

> **The rule, plainly: an agent never merges to main or deploys to prod on its own in approval-gated mode.** The merge gate and prod deploy only run on a heartbeat *after* a recorded human approval.

## Non-negotiable rules (hard-won)

- **Verify on the LIVE site before merging.** CI-green is not enough. Deploy the branch and check the rendered result (`deploy_verify.sh`). Never merge structure-without-content or a template-without-a-view. `minClassEls` / `contains` checks catch "it built but renders nothing".
- **Merge-gate gotchas** (all handled by `merge_gate.sh`, but know them):
  - *Draft PRs can't complete* → un-draft first (azure un-drafts via PATCH; github via `gh pr ready`).
  - *"Build must pass / build too old"* → don't fight CI; let it re-run. Azure sets auto-complete; **github uses `gh pr merge --auto`** (CI gate handled natively — arms merge-when-checks-pass, or merges immediately if already green).
  - *Conflicts* → rebase. The pattern when PRs branch off each other: **take main's version of the predecessor's files, re-apply only this PR's unique additions** (`rebase_pr.sh --theirs <predecessor files> --ours <this PR's new files>`), then build-verify.
- **CMS vs code.** Some fixes can't ship in a PR — e.g. assigning a template to a document type, or content/field values. Those are CMS/API operations (do them via the platform's API), and the matching view/asset files still need to be committed so deploys don't regress. If a "wired" page 404s, check: (1) the node has a template selected, (2) the `.cshtml` is in the repo, (3) the doc type allows it.
- **Secrets** live only in the credential files referenced by the config. Resolve them at run time; never paste, echo, or commit them.
- **Cloning Azure DevOps repos: use the PLAIN repo URL.** `git clone https://dev.azure.com/<org>/<project>/_git/<repo>` — the runtime's git credential helper authenticates from the `AZURE_DEVOPS_PAT` env var automatically. **Never** embed the PAT in a URL or remote (`https://oauth2:$PAT@…`, `:$PAT@…`, `git remote set-url …$PAT…`) — that writes the secret in plaintext into `.git/config`. Same for fetch/push: plain URLs only.
- **Browser** (if verifying visually): close tabs at the tab level; never kill the MCP's browser process.
- **No silent truncation.** If you cap coverage (top-N PRs, skip a check), say so.

## Delegating well

A delegated issue must carry a **precise spec + live acceptance criteria**. Bad: "fix the home page." Good: "the home renders ~125 vs the wireframe's ~235 elements; add svc-ic/bigstat/cap/3rd line-mask; **acceptance: curl the live site, class-tagged element count must equal ~235**." Write the spec to a temp file and pass it to `board.sh create`/`update` so multi-line markdown survives.

When the same agent delivers partial work twice, stop re-delegating and finish it yourself — especially CMS-side or one-file fixes the fleet structurally can't do.

## Scripts

| Script | Does |
|---|---|
| `board.sh poll\|prs\|create\|update` | board issues + active PRs; create/update issues |
| `deploy_verify.sh <branch> [--no-deploy]` | deploy a branch to staging + run the config's live checks (the pre-merge gate) |
| `merge_gate.sh <pr#>` | vote→complete with all gotcha handling; exit 3 = needs rebase |
| `rebase_pr.sh <branch> [--ours …] [--theirs …]` | merge main into a branch, apply per-file strategy, push |
| `_config.sh` | loads `.claude/paperclip-orchestration.json`, resolves secrets from files (source it) |

## Loop continuation (per heartbeat)

**You run once per heartbeat — don't busy-loop.** Do **one useful pass**: advance the furthest-along PR/issue. Then leave **every touched item** in a board state the *next* heartbeat resumes:

- **delegated work** → assigned to the specialist, status `in_progress` (work handed off) or `in_review` (delivered, awaiting your verify);
- **a merge/deploy awaiting sign-off** → `awaiting_approval`, assigned to the human operator, with the verify evidence posted;
- **nothing left** (board and PR queue clear) → post a completion comment and **stop**.

There is **no `ScheduleWakeup`** — the **server heartbeat re-enters this skill automatically** on the next wake. Don't try to drive the whole project to completion in one turn; each wake picks up where the last left off from the board state.

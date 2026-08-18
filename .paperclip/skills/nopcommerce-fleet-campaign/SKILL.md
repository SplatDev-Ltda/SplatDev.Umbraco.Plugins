---
name: nopcommerce-fleet-campaign
description: Orchestrate the nopCommerce plugin-hardening campaign with an agent fleet — the deterministic once-per-heartbeat loop that drives open harden/<plugin> PRs on splatdevtech/SplatDev.NopCommerce.Plugins from "implementer opened it" to "merged to master": poll the board + PRs, run Gate-1 verification (build + xUnit + changed-path guard), do the reviewer confirmation (scope/PII/checklist), run the GitHub merge gate, refill the wave to the concurrency cap, and reschedule. Also carries the per-plugin hardening-issue delegation-brief template. Use when driving/monitoring the nopCommerce fleet campaign, dispatching plugin-hardening issues, or running the merge loop. Not for the plugin code itself (that's the `nopcommerce` skill) or marketplace submission (that's `nopcommerce-marketplace-deploy`, Gate 2).
---

# nopCommerce Fleet Campaign — orchestration

Drive the nopCommerce plugin-hardening campaign to completion by looping, **once per server heartbeat**:
**poll → verify (Gate 1) → reviewer confirmation → merge gate → close out → refill → reschedule**. This
adapts the [`paperclip-fleet-orchestration`] skill's poll→verify→merge-gate→reschedule loop to THIS
project's control plane: **Paperclip issues** for coordination/status, **GitHub PRs** on
`splatdevtech/SplatDev.NopCommerce.Plugins` (branch **`master`**) for the actual code review and merge.
There is **no Azure DevOps** here — every "merge gate" step is a GitHub PR operation, not an `az repos pr`
vote/complete call.

**You are an agent, not a human at a terminal.** Run this loop **once per heartbeat** — one useful pass,
leaving the board in a state the next heartbeat resumes. No busy-loop, no "monitor until done in one sitting".

**Scope: Gate 1 only.** This loop carries a plugin through **Gate 1** (build + xUnit + changed-path guard +
review) and the merge to `master`. The capture pass + marketplace submission is **Gate 2** — a separate,
operator-gated procedure (the `nopcommerce-marketplace-deploy` skill / the repo's
`docs/superpowers/runbooks/gate2-marketplace-submission.md`). A plugin out of this loop is merged and
hardened; it is **not yet listed**.

## Roles

- **Implementer** — one isolated agent per plugin (worktree), dispatched from the hardening-issue brief
  (below). Owns exactly one `harden/<plugin-short>` branch + one PR. Makes its own PR Gate-1-clean
  (build, tests, guard) **before** asking for review. Does not merge its own PR.
- **Reviewer** — runs Gate 1 mechanically, then does the three manual confirmations no script can do (diff
  scope, PII-masking presence, checklist coverage). The **only** role that approves a PR for merge.
- **Orchestrator** — drives the loop: polls, dispatches implementers, invokes the reviewer step, executes
  the merge gate, updates issue status, refills the wave, reschedules. Orchestrator and reviewer are often
  the same agent in two capacities; the **reviewer judgment** (scope/PII/checklist) is the part that must
  never be skipped or auto-approved.

## Preconditions

- The wave's Paperclip issues exist (one per plugin, from the template below), each linked to a
  `harden/<plugin-short>` branch.
- `scripts/verify-plugin-gate1.sh` is present + executable in the checkout (see the `nopcommerce` skill).
- GitHub access to `splatdevtech/SplatDev.NopCommerce.Plugins` (list PRs, read diffs, merge, update branch)
  and Paperclip board access (read/update issue status).

## Wave selection (context)

Waves are **category-batched, lowest-maturity-first**, drawn from the repo's
`docs/superpowers/audit/gap-matrix.md`: **1. Payments · 2. Shipping · 3. Misc · 4. ExchangeRate/Widgets.**
Within a category, order by ascending total score (`logging + unhappy + tests + marketplace`) — least
hardened first. Size a wave to keep **~6–8 plugins in flight**; a large category may span waves.

## The loop (one pass)

Each numbered step is one pass through *all* of the wave's open PRs — batch the mechanical parts (poll,
Gate 1) across the whole wave before the slower manual review step.

```
1. POLL       list this wave's Paperclip issues + linked GitHub PRs
              (list_pull_requests / pull_request_read on splatdevtech/SplatDev.NopCommerce.Plugins)
2. VERIFY     for each PR whose issue is in-review:
                CHANGED_FILES="$(gh pr diff <pr#> --name-only)"
                CHANGED_FILES="$CHANGED_FILES" scripts/verify-plugin-gate1.sh --plugin <ProjectName>
                FAIL -> bounce (Non-pass outcomes)
                PASS -> reviewer confirmation (scope + PII + checklist)
3. MERGE GATE reviewer-approved + Gate-1-green + CI-green -> merge to master (see table)
              draft / conflict / CI-stale / CI-red -> handle per table, do NOT merge
4. CLOSE OUT  merged -> mark issue done; record merge commit/PR#; delete branch
5. REFILL     in-flight < 6-8 -> open next plugin's issue + dispatch its implementer
6. RESCHEDULE wave not drained -> reschedule this loop; drained -> next category, or stop if all done
```

### Step 2 — Verify (Gate 1)

For every PR whose issue is `in-review`:
1. `CHANGED_FILES="$(gh pr diff <pr#> --name-only)"` — the file-path list. `<ProjectName>` is the folder
   under `Plugins/`, e.g. `SplatDev.Nop.Plugin.Payments.PagBank`.
2. `verify-plugin-gate1.sh` runs three things in order, stopping at the first failure:
   - **Changed-path guard** — rejects (exit 2) if the diff touches any stock `Plugins/Nop.Plugin.*` path,
     or anything outside `Plugins/SplatDev.*`, `Tests/*`, `marketplace/*`, `docs/*`, `scripts/*`, or a root
     `*.slnx`/`*.sln`. An empty/unset `CHANGED_FILES` is itself a guard failure (never passes vacuously).
   - **Build** — `dotnet build` of the plugin `.csproj`.
   - **Test** — `dotnet test` of `Tests/<ProjectName>.Tests`.
3. **Confirm the `gh pr diff --name-only` call actually succeeded + returned a non-empty list** before
   trusting any guard result. A `gh` failure (auth/rate-limit/network) yielding an empty `CHANGED_FILES` is
   a **gate failure** (bounce), never a pass.
4. On `GATE1 PASS: <plugin>`, proceed to reviewer confirmation.

### Reviewer confirmation (manual, after Gate-1 PASS)

Gate 1 can't judge intent. The reviewer reads the diff and confirms all three, stopping at the first fail:
1. **Diff scope.** Every changed path is under `Plugins/SplatDev.*`, `Tests/*`, `marketplace/*`, `docs/*`,
   `scripts/*`, or a root `*.slnx`/`*.sln` — AND is in scope *for this plugin's issue* (a PagBank PR that
   also edits another plugin's files, an unrelated `PLUGIN_MAP` line, or unrelated `docs/` passes the guard
   but fails scope). Reject if the diff reaches outside what this plugin's issue asked for.
2. **PII masking present.** No raw CPF, CNPJ, card PAN/CVV, or access token in any log call, exception
   message, or interpolation — every such value routes through `PiiMask` (`Cpf`/`Cnpj`/`Card`/`Token`) per
   the repo's `docs/superpowers/conventions/logging-and-pii.md`. A grep-assisted read of the diff's log
   lines. Reject if any raw PII reaches a log sink.
3. **Trimmed checklist fully covered.** Re-open the plugin's trimmed `HARDENING-CHECKLIST.md` subset (per
   its `gap-matrix.md` row) and confirm every bullet is addressed — not just that tests pass.

All three pass → merge-eligible. Any fail → bounce (below); do not merge.

**"Reviewer-approved" = an actual approving GitHub PR review** (`pull_request_review_write` `method: approve`
/ `gh pr review --approve`), not a Paperclip comment. If `master` branch protection requires a review,
GitHub blocks the merge until that formal approval exists. Record the PR#/URL + review timestamp on the
Paperclip issue for traceability — but the GitHub review is the source of truth.

### Merge gate

| PR state | Action |
| --- | --- |
| **Draft** | Skip. Leave the issue at `in-progress`; note the implementer must mark it "Ready for review". Do not un-draft on its behalf unless the brief is fully satisfied and it's purely a bookkeeping oversight. |
| **Merge conflict** (`CONFLICTING`) | Bounce: comment on the PR + set issue `in-progress`, ask the implementer to rebase/merge `master` and resolve, then re-request review. Do **not** resolve plugin-implementation conflicts on the fleet's behalf. Re-run full Verify after it pushes. |
| **CI-stale / out-of-date branch** | `gh pr update-branch <pr#>` to merge current `master`, then **re-run Gate 1** against the updated diff before merging — a stale branch may have passed against an older `master`. |
| **CI checks failing (red, not stale)** — the GitHub Actions run (`.github/workflows/ci-cd.yml` `typecheck`/`test`) completed and reported failure | Do **not** merge. Treat like a Gate-1 failure: comment the failing check, set issue `in-progress`, bounce. Re-run full Verify once CI is green. A local Gate-1 pass does not override a red CI check. |
| **Green** (not draft, no conflicts, Gate-1 pass, reviewer-approved, **and all required GitHub Actions checks passing**) | Merge to `master` (normal merge, preserve history; delete the branch after). |

**CI is a required, independent gate.** `ci-cd.yml` builds the **entire** `NopCommerce.slnx` (Release) and
tests **every** `Tests/SplatDev.*` project — a superset of local Gate-1's single-plugin scope. CI can fail
red for reasons Gate 1 can't see (solution-wide compile break, cross-plugin type collision, a regression in
a *different* SplatDev test project). `GATE1 PASS` locally + red CI on GitHub = **not mergeable**; CI red
always wins.

### Non-pass outcomes

- **Gate-1 failure (guard/build/test).** Comment the exact `verify-plugin-gate1.sh` output on the PR, set
  the issue `in-progress`, leave the implementer to fix + re-push. Don't patch the PR directly unless the
  same agent has failed the same issue twice (then orchestrator fixes it rather than re-delegating a third).
- **Reviewer-confirmation failure (scope/PII/checklist).** Same bounce: comment specifics (which file out of
  scope, which line logs raw PII, which checklist bullet unaddressed), set `in-progress`, wait for re-push,
  **re-run the full Verify from scratch** (a fix for one finding can regress another).

### Step 4 — Close out

Merged PR → mark the issue `done`, record the merge commit/PR# on it, confirm the branch was deleted. If the
plugin's `marketplace < 2` deliverable still has `TODO(capture-pass)` markers, attach a follow-up note
pointing at Gate 2 (`nopcommerce-marketplace-deploy`) — hardening done, listing not.

### Step 5 — Refill (concurrency cap)

**Keep ~6–8 plugins in flight per wave.** "In flight" = an issue open with an active implementer OR a PR
awaiting/undergoing review — any issue not yet `done`. When one closes out and in-flight drops below 6, open
the next plugin's issue (lowest-maturity-first) and dispatch its implementer immediately so the fleet
doesn't idle. Don't exceed 8. Don't pull from the *next* category early to pad the count.

### Step 6 — Reschedule

- Wave has any issue not `done` → reschedule this loop for a later pass (don't end the session). Pick the
  delay by what the pass is waiting on: CI/build turnaround (~minutes) if most PRs are mid-review; a longer
  idle interval if most plugins are still with implementers who haven't pushed.
- Wave **complete** (every issue `done` = merged, no PR open/conflict/draft/awaiting-re-review, no issue at
  `in-progress`/`in-review`) → advance to the next category's wave, refilling to the same 6–8 cap.
- No next wave → the fleet run is complete: stop rescheduling and report. Anything still
  `TODO(capture-pass)` across merged issues is the input list for Gate 2 (operator-gated, run separately).

---

# Per-plugin hardening-issue + delegation-brief template

Fill this in **once per plugin** to (a) open the Paperclip issue and (b) hand the identical brief to the
isolated implementer (worktree). One instantiation = one plugin = one `harden/<plugin-short>` branch = one
PR. **Ground truth for the bar is the repo's `docs/superpowers/HARDENING-CHECKLIST.md`** — if this template
and the checklist ever disagree, the checklist wins.

**Placeholders** (substitute every `{{...}}` before dispatching):
- `{{plugin}}` — project/folder name, `SplatDev.Nop.Plugin.` + the short name from `gap-matrix.md` (e.g. `SplatDev.Nop.Plugin.Payments.PagBank`).
- `{{plugin-short}}` — the segment after the category (e.g. `PagBank`; branch `harden/PagBank`).
- `{{category}}` — `Payments` / `Shipping` / `Misc` / `Widgets` / `ExchangeRate`.
- `{{gap-row}}` — **both** the plugin's numbered `## Matrix` scores row AND its full `### <short-name>` block from "Detailed findings per plugin" in `gap-matrix.md`, pasted verbatim (scores tell *how much* is missing; the block tells *what* — concrete file:line gaps).
- `{{customerFacing}}` / `{{brandPlugin}}` — the plugin's flags from its gap-matrix row.
- `{{trimmedChecklist}}` — only the `HARDENING-CHECKLIST.md` bullets for the deliverable(s) this plugin scored **`< 2`** on (`logging`/`unhappy`/`tests`/`marketplace`). Omit deliverables already at `2` — don't re-litigate met work.

## Issue body

> ## Harden `{{plugin}}`
> **Category:** {{category}} · **Customer-facing:** {{customerFacing}} · **Brand plugin:** {{brandPlugin}}
> **Branch:** `harden/{{plugin-short}}` · **Definition of Done:** `docs/superpowers/HARDENING-CHECKLIST.md`
>
> ### Gap-matrix entry (source of truth for what's missing)
> ```
> {{gap-row}}
> ```
>
> ### Global Constraints (apply on top of everything)
> - **Touch only `SplatDev.Nop.Plugin.*`** (plus `scripts/`, `Tests/`, `marketplace/`, `docs/`, and the root `NopCommerce.slnx`/`*.sln` when required — e.g. the `PLUGIN_MAP` line in `scripts/build-marketplace-zips.sh`, or registering a `Tests/<plugin>.Tests` project). **Never** touch stock `Nop.Plugin.*` — a diff touching a stock path is auto-rejected at the gate.
> - **Target `net9.0` / nopCommerce 4.90.5.** Inherit `Directory.Build.props`; don't pin a different TFM.
> - **Logging = `Nop.Services.Logging.ILogger`** (nopCommerce's), never `Microsoft.Extensions.Logging.ILogger`.
> - **PII masking (mandatory, reviewed):** never log full CPF/CNPJ, card PAN/CVV, or access tokens — always mask (`123.***.***-**`, `****1234`).
> - **Test stack (verbatim):** xUnit `2.9.2`, xunit.runner.visualstudio `2.8.2`, Moq `4.20.72`, RichardSzalay.MockHttp `7.0.0`, Microsoft.NET.Test.Sdk `17.12.0`; `IsPackable=false`; `ProjectReference` to the plugin under test.
> - **Marketplace name pattern:** `<Brand> (Brazil)` — no vendor ("SplatDev"), no category word, no version/price in the title.
> - **Marketplace desc limits:** short ≤250 chars (no HTML); full ≥700 chars (HTML, no `<h1>`/`<script>`). **Images:** screenshots min 600px wide, ≤500 KB each, ≤3 total, first = thumbnail. **`uploadedItems.json` at ZIP root** for every ready-to-deploy package.
> - **Secrets** referenced by env/secret name only, never committed. **Commits:** frequent, conventional-commit style.
>
> ### Trimmed checklist — only what `{{plugin}}` is missing
> ```
> {{trimmedChecklist}}
> ```
> (Full rationale: `docs/superpowers/HARDENING-CHECKLIST.md`; `.../conventions/logging-and-pii.md` if `logging < 2`; `.../conventions/test-project-template.md` if `tests < 2`.)
>
> ### Branch
> Work on `harden/{{plugin-short}}`. One branch, one plugin, one PR. Do not batch plugins.
>
> ### Agent-doable (in scope for this PR)
> 1. **`PiiMask.cs`** — copy verbatim from `logging-and-pii.md`'s canonical snippet into `Plugins/{{plugin}}/Services/PiiMask.cs`, adjusting only the `namespace`. Don't rename the `Cpf`/`Cnpj`/`Card`/`Token` signatures.
> 2. **Logging remediation** (if `logging < 2`) — switch to `Nop.Services.Logging.ILogger`; add request/response/webhook/config-failure/exception logging with correlation ids; route every CPF/CNPJ/PAN/token through `PiiMask` before `ILogger`.
> 3. **Unhappy-path remediation** (if `unhappy < 2`) — typed failure result + merchant/customer-facing message for each applicable-but-unhandled case; never an unhandled exception, bare 500, or NRE.
> 4. **Tests** (if `tests < 2`) — add/repair `Tests/{{plugin}}.Tests/` per `test-project-template.md` (canonical `.csproj`, pinned versions, `IsPackable=false`, `ProjectReference` to `{{plugin}}`). Cover every applicable unhappy path (non-2xx, timeout, malformed body via `RichardSzalay.MockHttp`) + all pure logic (parsers, HMAC/signature validation, mapping). Mock nopCommerce services with Moq — no live DB/web-host/endpoint. Migrate + delete any stale `Tests/SplatDev.Nop.Plugin.Pagamentos.*` or `Tests/SplatDev.Plugin.Tests` section for this plugin.
> 5. **Marketplace packaging metadata** (if `marketplace < 2`, text/packaging only): add/fix `{{plugin}}`'s `PLUGIN_MAP` line in `scripts/build-marketplace-zips.sh` (`["{{plugin}}"]="{{category}}.{{plugin-short}}|<zip>.zip"`); write/fix short (≤250, no HTML) + full (≥700, HTML) descriptions + the registry entry in `marketplace/marketplace-listings.json` (name `<Brand> (Brazil)`, correct leaf `category`, `supportedVersions`). **Check first** for an existing entry (by `short`/`name`) — fix in place, never duplicate.
> 6. Open the PR from `harden/{{plugin-short}}` → `master`; description references this issue + lists which of the four deliverables it addresses.
>
> ### Capture pass (OUT of scope — do NOT attempt)
> The implementer runs headless (no browser, no live admin). Do **not** attempt logo generation (140×140 / 512×512), the Admin Configure screenshot / storefront screenshot, or any marketplace/seller-portal submission — these need a running store and/or image generation and are handled later, operator-gated, via `nopcommerce-marketplace-deploy` (Gate 2). If a deliverable needs an image or live instance, leave a `TODO(capture-pass)` note in the registry entry / PR description — **never fabricate a placeholder asset**.
>
> ### Gate-1 exit criteria (all must be clean before opening the PR for review)
> 1. `dotnet build` of `{{plugin}}` — no errors.
> 2. `dotnet test` of `Tests/{{plugin}}.Tests/` — green.
> 3. Local smoke: the plugin loads/installs without throwing (by inspection/build if no live instance).
> 4. `scripts/verify-plugin-gate1.sh --plugin {{plugin}}` passes (build + xUnit + changed-path guard).

Now that the fleet has a live integration environment, the QA agent can additionally request a real
integration-test run (live nopCommerce+MSSQL + sandbox creds + Configure-page screenshot) via the
integration-test runner before final sign-off — see the `nopcommerce-plugin-testing` skill.

## Related skills
- **`nopcommerce`** — building/testing plugins + the Gate-1 workflow (`verify-plugin-gate1.sh`).
- **`nopcommerce-plugin-testing`** — the live-sandbox-integration-test convention + the integration-test runner.
- **`nopcommerce-marketplace-deploy`** — Gate 2 (packaging + the co-driven-browser marketplace submit).
- **`paperclip-fleet-orchestration`** — the generic poll→verify→merge-gate→reschedule loop this specialises.

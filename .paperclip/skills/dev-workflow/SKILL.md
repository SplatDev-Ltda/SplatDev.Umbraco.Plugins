---
name: dev-workflow
description: Development workflow standards for any project. Use whenever starting a feature, branching, opening PRs, deploying, managing credentials, or setting up documentation and wireframes. Invoke even if the user just says "let's build X" — the workflow rules must be established before any code is written. Source of truth for session discipline, branching, deploy cadence, documentation structure, and prompt hygiene.
---

# Development Workflow Standards

## Session Management

**One session per project.** Never open a second Claude Code session for the same project simultaneously. Concurrent sessions cause conflicting edits and broken commits.

If you must hand off mid-task, document the exact state in `docs/pending/SESSION_STATE.md` before closing, including: current branch, what's done, what's next, and any blockers.

## Credential Management

**Never put credentials in prompts or hardcoded in source files.**

- Store all secrets in a credentials file (`.env`, `.credentials/local.env`, or similar) that is listed in `.gitignore`
- Reference the credential file at the start of any session that needs auth: *"Credentials are in `.credentials/local.env`"*
- For demo and test use, generate `docs/credentials/DEMO_CREDENTIALS.md` (demo/test values only — never real credentials)
- Production secrets live in environment variables or a secrets manager

## Prompt Discipline

- Keep prompts **concise and to the point** — one concern per message
- Break complex tasks into sequential, focused messages rather than one long prompt
- Avoid repeating context already established earlier in the session

## Documentation Structure

All docs live in `docs/` organized by type. Update docs on the same branch as the feature — they land in master on merge.

| Folder | Contents |
|--------|----------|
| `docs/pending/` | Upcoming tasks, features, backlog items |
| `docs/done/` | Completed features, changelogs |
| `docs/bugs/` | Bug reports and known issues |
| `docs/investigations/` | Research spikes, tech evaluations |
| `docs/adjustments/` | Config changes, tuning notes |
| `docs/specs/` | Feature specs and design documents |
| `docs/wireframes/` | UI mockups and interaction sketches |
| `docs/credentials/` | Demo/test credentials (never real) |
| `docs/manuals/` | User and administrator guides |
| `docs/technical/` | Technical reference for future developers |

`README.md` and the project roadmap must always reflect the current state of the project.

## Wireframes for UI Changes

Any UI change requires a wireframe **before writing code**:

- Use ASCII art, Mermaid diagrams, or an HTML mock file
- Save to `docs/wireframes/YYYY-MM-DD-feature-name.md`
- Show layout, key interactions, and data displayed — clarity over polish

## Feature Spec Documents

For every feature, create `docs/specs/FEATURE_NAME.md` before implementation. See `references/documentation-templates.md` for the template. Include:

- Goal / user story
- Acceptance criteria
- Data model changes
- API changes
- UI wireframe reference
- Testing approach

## Branching Strategy

```
git checkout master && git pull
git checkout -b feature/<group-name>
# implement
# open PR
# apply all review recommendations
# merge into master
```

- Branch per **feature group** — related changes go together on one branch
- Branch **always from the latest master** — never from another feature branch
- Never commit feature work directly to master
- Every branch inherits the latest docs from master automatically; update docs alongside feature work

## PR Workflow

1. Open a PR with a clear description referencing the spec in `docs/specs/`
2. Review **all** PR comments
3. Apply recommendations before merging
4. Merge into master

## Deploy Workflow

Deploy triggers after **every 5 PRs merged**:

```bash
DEPLOY_HOST_PASSWORD=<host_root_pw> bash scripts/deploy-prod.sh
```

The deploy script handles automatically:
- Patch version bump (never bump manually)
- Docker image build and ship to host
- Old image pruning
- GitHub milestone creation
- Host git workspace sync

**After deploy:**
1. Prune Docker images on the host: `docker image prune -af`
2. Confirm health: `curl http://<host_ip>/api/health`
3. Push any doc/roadmap updates to master so the main branch stays current

**Back-end and front-end versions must stay matched.**

## Comprehensive Manuals

Every project must maintain:

- **User Guide** (`docs/manuals/USER_GUIDE.md`) — how end users operate the system
- **Admin Guide** (`docs/manuals/ADMIN_GUIDE.md`) — configuration, user management, all admin features
- **Technical Reference** (`docs/technical/TECHNICAL_REFERENCE.md`) — architecture, data model, maintenance, deployment, for future developers

Keep these updated as features ship.

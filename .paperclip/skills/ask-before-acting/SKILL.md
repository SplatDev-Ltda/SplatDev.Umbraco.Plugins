---
name: ask-before-acting
description: When an agent has a blocker, missing credential, or ambiguous task — ask the operator via issue comment, then block the issue. The system auto-emails and auto-reassigns.
domain: agent-conduct
confidence: high
---

# Ask Before Acting

## When to Use This

Before guessing, inventing credentials, creating unnecessary sub-issues, or silently failing — **ask the operator**.

Trigger this protocol whenever:
- A credential, secret, or configuration value is missing or unresolved (`<secret:...>` placeholders not set)
- The task description is ambiguous about the target (e.g., "deploy to server" but no server is specified)
- Two instructions contradict each other
- You need a human decision before taking a potentially destructive action (deletes, overwrites, production deploys)
- You are blocked and cannot proceed without external input

## The Protocol

### Step 1 — Post your question as a comment on the issue

```bash
curl -s -X POST "$PAPERCLIP_BASE_URL/issues/$PAPERCLIP_ISSUE_ID/comments" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"body": "## ❓ Question before proceeding\n\n[YOUR SPECIFIC QUESTION HERE]\n\n**Context:** [brief description of what you were trying to do and what is missing]"}'
```

### Step 2 — Block the issue

```bash
curl -s -X PATCH "$PAPERCLIP_BASE_URL/issues/$PAPERCLIP_ISSUE_ID" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "blocked"}'
```

When the issue goes to `blocked`, Paperclip automatically:
- Re-assigns the issue to the person who created it (the operator)
- Sends an email notification to the operator
- Shows the issue in the operator's inbox as blocked

## What NOT to Do

- ❌ Do not invent or guess passwords, hostnames, or API keys
- ❌ Do not create a sub-issue just to avoid doing the work yourself
- ❌ Do not mark an issue done when you only partially completed it
- ❌ Do not deploy to a server if you are uncertain which server or branch to use
- ❌ Do not proceed with destructive actions (data deletion, production deploys) without confirmation

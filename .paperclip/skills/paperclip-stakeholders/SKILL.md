---
name: paperclip-stakeholders
description: Manage issue stakeholders — external contacts who receive issue status change and comment notifications via email. Use when you need to add, remove, or review stakeholders on an issue, or when an issue mentions "stakeholder feedback" or "client review."
---

# Stakeholder Management

Stakeholders are external contacts added to an issue who receive email
notifications when the issue status changes or new comments are posted.
They are not board users — just a name and email address.

## When to Use Stakeholders

- Client or external reviewer needs to follow issue progress
- Approver who must sign off before an issue can close
- External stakeholder feedback mentioned in issue comments
- Regulatory or compliance contact needs visibility

## API

### List stakeholders
GET /api/issues/{issueId}/stakeholders

### Add a stakeholder
POST /api/issues/{issueId}/stakeholders
Body: { "name": "...", "email": "..." }

### Remove a stakeholder
DELETE /api/issues/{issueId}/stakeholders/{stakeholderId}

## Notifications

1. Status change → email to all stakeholders
2. New comment → email with 300-char preview
3. Email replies → posted as issue comments (via IMAP)

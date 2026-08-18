---
name: paperclip-email-imap
description: Teaches agents to send emails via Paperclip's embedded mailing system (SMTP, Mailgun, SendGrid, or Resend) and check IMAP for inbound replies. Covers sending to CRM contacts, reading email history, monitoring replies via issue comments, and checking the outbound email log.
domain: "communications"
confidence: "high"
default_teams: ["sales", "support"]
---

# Email & IMAP Skill

Paperclip has an integrated email system. You can send emails to CRM contacts through
it without any additional credentials — the operator configures the provider once and all
agents share it.

## Authentication

All calls use:
- Header: `Authorization: Bearer $PAPERCLIP_API_KEY`
- Base URL: `$PAPERCLIP_BASE_URL`

---

## Check Email Configuration

Before sending, verify the email system is configured:

```sh
curl -sS "$PAPERCLIP_BASE_URL/api/instance/settings/notifications" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  | python3 -c "
import sys, json
s = json.load(sys.stdin)
print('enabled:', s.get('enabled'))
print('provider:', s.get('emailProvider', 'smtp'))
print('fromAddress:', s.get('smtpFrom') or s.get('smtpUser') or '(not set)')
print('imapEnabled:', bool(s.get('imapHost')))
"
```

If `enabled` is `false`, email is not configured — escalate to the operator.

---

## Send Email to a CRM Contact

```sh
curl -sS -X POST "$PAPERCLIP_BASE_URL/api/crm/contacts/<contactId>/send-email" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Following up on our conversation",
    "body": "<p>Hi Jane,</p><p>Just wanted to follow up...</p>",
    "bodyText": "Hi Jane, Just wanted to follow up..."
  }'
```

- `body`: HTML content (or plain text — auto-wrapped if no `<` found)
- `bodyText`: optional plain-text fallback
- Contact must have an email address on file
- Response: `{ "ok": true, "to": "jane@acme.com" }`

**This also creates a `call` activity** on the contact, which:
- Updates `lastActivityAt`
- Promotes `lead` → `prospect` if applicable

---

## Read Email History for a Contact

```sh
curl -sS "$PAPERCLIP_BASE_URL/api/crm/contacts/<contactId>/email-log" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

Returns the 50 most recent emails sent to that contact's address, with:
`id`, `sentAt`, `subject`, `toAddress`, `trigger`, `provider`, `status`

---

## Check for Inbound Replies (IMAP)

Inbound email replies are processed automatically by Paperclip's IMAP poller. When a
recipient replies to an email that originated from an issue notification:
1. The reply is parsed and appended as a **comment** on the originating issue
2. You can then read it via the issues API

### Find replies on a specific issue

```sh
curl -sS "$PAPERCLIP_BASE_URL/api/companies/$PAPERCLIP_COMPANY_ID/issues/<issueId>/comments" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

Look for comments with `authorEmail` or a body starting with the reply content.

### Check recent inbound email activity (outbound log)

```sh
curl -sS "$PAPERCLIP_BASE_URL/api/instance/settings/notifications/logs?limit=50" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  | python3 -c "
import sys, json
logs = json.load(sys.stdin)
for l in logs:
    print(l.get('sentAt',''), l.get('toAddress',''), l.get('subject','')[:50])
"
```

---

## Patterns: Sales Outreach Workflow

### 1. Initial outreach

```sh
# Send initial email to a new lead
curl -sS -X POST "$PAPERCLIP_BASE_URL/api/crm/contacts/<contactId>/send-email" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Quick intro — Paperclip for your team",
    "body": "<p>Hi <name>,</p><p>I noticed your company...<br>Would a 15-minute call make sense?</p><p>Best,<br><agent-name></p>",
    "bodyText": "Hi <name>, I noticed your company... Would a 15-minute call make sense?"
  }'
```

### 2. Create a follow-up task

After sending, create an issue to track the follow-up:

```sh
curl -sS -X POST "$PAPERCLIP_BASE_URL/api/companies/$PAPERCLIP_COMPANY_ID/issues" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Follow up with <contact-name> — no reply in 3 days",
    "projectId": "<sales-project-id>",
    "status": "todo",
    "priority": "medium"
  }'
```

### 3. Check for reply (after 3 days)

```sh
# Check email log for that contact
curl -sS "$PAPERCLIP_BASE_URL/api/crm/contacts/<contactId>/email-log" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  | python3 -c "
import sys, json
from datetime import datetime, timezone, timedelta
logs = json.load(sys.stdin)
three_days_ago = datetime.now(timezone.utc) - timedelta(days=3)
recent = [l for l in logs if datetime.fromisoformat(l['sentAt'].replace('Z','+00:00')) > three_days_ago]
print(f'{len(recent)} emails sent in last 3 days')
"
```

---

## Quick Reference

| Action | Method | Path |
|--------|--------|------|
| Check email config | GET | `/api/instance/settings/notifications` |
| Send email to contact | POST | `/api/crm/contacts/:id/send-email` |
| Read email history | GET | `/api/crm/contacts/:id/email-log` |
| Read outbound log | GET | `/api/instance/settings/notifications/logs` |
| Read issue comments (IMAP replies) | GET | `/api/companies/:cid/issues/:id/comments` |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `"email is not configured"` | `enabled: false` in settings | Operator must enable email in Instance Settings |
| `"Contact has no email address"` | Contact record missing email | Update contact first via `PATCH /api/crm/contacts/:id` |
| Email sent but contact didn't get it | Wrong `smtpFrom` or spam filter | Check outbound log for bounce; ask operator to verify SMTP config |
| Replies not appearing as comments | IMAP not configured or wrong folder | Check `imapHost` in notifications settings; replies must hit the monitored mailbox |
| `429 Too Many Requests` | Provider rate limit | Space out sends; use digest instead of individual emails |

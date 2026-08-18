---
name: paperclip-mailgun
description: Send emails via Paperclip configured Mailgun provider. Use when you need to send notifications, share reports, contact stakeholders, deliver documents, or handle any email-based communication through the Paperclip API.
---

# Mailgun Email Skill

Paperclip uses Mailgun (or SendGrid/SMTP/Resend) as its email provider for
sending system emails, stakeholder notifications, CRM communications, and
agent-generated messages.

## How Email is Configured

The instance admin configures the email provider in Instance Settings.
Mailgun is the primary provider. You do not need to configure Mailgun
yourself — it is already wired. Just use the Paperclip API to send emails.

## Sending Emails

```http
POST /api/companies/{companyId}/email/send
Authorization: Bearer $PAPERCLIP_API_KEY
Content-Type: application/json

{
  "to": ["recipient@example.com"],
  "subject": "Email subject line",
  "body": "Email body content (plain text or HTML)"
}
```

## Stakeholder Notifications

When stakeholders are added to an issue they automatically receive status
change and comment notification emails via Mailgun. You do not need to
manually send stakeholder emails — just manage stakeholders via
`POST /api/issues/{id}/stakeholders`.

## CRM Email

```http
POST /api/companies/{companyId}/crm/contacts/{contactId}/email
Authorization: Bearer $PAPERCLIP_API_KEY
Content-Type: application/json
{ "subject": "...", "body": "..." }
```

Logged in the CRM contact history.

## When to Use

- Notify a stakeholder: add them to the issue; system emails them
- Send a report: use POST /email/send
- CRM follow-up: use POST /crm/contacts/{id}/email
- Verify delivery: use GET /email/log

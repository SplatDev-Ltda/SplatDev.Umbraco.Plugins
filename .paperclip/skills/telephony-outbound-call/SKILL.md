---
name: telephony-outbound-call
description: Teaches agents to initiate outbound phone calls via the Paperclip voice API. Activates when the calling integration is enabled. The Paperclip API handles Jambonz auth internally — no JWT management needed. Use PAPERCLIP_API_URL, PAPERCLIP_API_KEY, PAPERCLIP_COMPANY_ID, and PAPERCLIP_AGENT_ID env vars.
domain: "sales-telephony"
confidence: "high"
default_teams: ["sales"]
requires_integration: "jambonz"
---

# Outbound Phone Call Skill

When a task requires a phone call, use the Paperclip voice API. You do **not**
need to interact with Jambonz directly — the API handles all telephony auth
and routing for you.

## Placing a Call

```sh
curl -sS -X POST "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/voice/calls" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "'"$PAPERCLIP_AGENT_ID"'",
    "toNumber": "+5515988183480",
    "greetingMessage": "Hello, this is an AI assistant calling on behalf of the team.",
    "callSubject": "Project status update",
    "language": "pt-BR"
  }' | python3 -c "import sys,json; r=json.load(sys.stdin); print('Call SID:', r.get('callSid') or r.get('id') or r)"
```

### Required fields

| Field | Description |
|-------|-------------|
| `toNumber` | Destination in E.164 format (`+` + country code + number, no spaces) |
| `agentId` | Your agent ID — always pass `$PAPERCLIP_AGENT_ID` |

### Optional fields

| Field | Description |
|-------|-------------|
| `greetingMessage` | First thing the AI says when the call connects |
| `callSubject` | Subject shown in the voice session dashboard |
| `language` | BCP-47 code (`pt-BR`, `en-US`, etc.). Defaults to `pt-BR`. |
| `contactId` | UUID of a CRM contact to link the call to |
| `notesEnabled` | `true` to auto-generate call notes |

### Phone number format

Always use E.164: `+` followed by country code and number, no spaces or dashes.

| Country | Example |
|---------|---------|
| Brazil | `+5515988183480` |
| US | `+15551234567` |
| Portugal | `+351912345678` |

---

## After the Call

Once the call fires successfully, comment on the issue to confirm:

```
Called [contact] at [number]. Call SID: [sid]. The AI will handle the conversation.
```

The voice session is tracked in the Paperclip dashboard under **Calling → Sessions**.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `403 Forbidden` | Check `PAPERCLIP_API_KEY` is set and valid |
| `404 Not Found` | Check `PAPERCLIP_COMPANY_ID` is correct |
| `"calling plugin not enabled"` | Ask the board operator to enable calling in Agent settings |
| `"toNumber is required"` | Ensure the phone number is in E.164 format |
| Call fires but rings busy | Verify Jambonz is running (`http://192.168.68.230:3008`) |

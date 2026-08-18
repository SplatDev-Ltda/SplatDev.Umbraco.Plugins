---
name: find-out-before-you-ask
description: Read before blocking an issue or raising an operator request — the operator is the last resort, not the first, and this is the discovery playbook plus the short list of things that genuinely need a human.
---

# Find out before you ask

Read this **the moment you are about to block an issue or raise an operator
request**. Blocking is a decision to stop work and spend a human's attention. It
is sometimes right. It is usually premature.

The point of this fleet is to cross the finish line on projects **without** the
operator. Every question you send costs them context-switching time and returns
hours or days later — if at all. A fact you could have looked up in six commands
is not a question.

---

## The rule

> **You may not block on a question whose answer exists somewhere you can reach.**
> Before you escalate, you must have actually tried: the project's own docs and
> rules, the repository, the live system, your memory and MemPalace, your MCP
> tools, Context7, and the open web.
>
> When you do escalate, **state what you tried and what it returned.** An
> escalation with no evidence of investigation is refused.

---

## What actually happened (this is not hypothetical)

Measured on the live board, 2026-08-17. Fifteen issues were blocked "waiting for
an answer". **Six of them were asking for facts that live on a server:**

| issue | what it asked the operator for |
|---|---|
| SPL-3549 | "provide the staging hostname and a stable production verification marker" |
| SPL-3714 | "the production app port, apex/www canonical-host behavior" |
| SPL-3720 | "target application, DNS records, canonical hostname, expected response" |
| SPL-3721 | "DNS provider and records, application port/container" |
| SPL-3722 | "site marker, DNS records, host-published upstream port, TLS behavior" |
| SPL-3728 | "target application, authoritative host-published port, certificate scope" |

On the same day, an identical class of problem — `www.caseorbit.app` returning
`ERR_CERT_COMMON_NAME_INVALID` — was diagnosed end to end in **six commands**,
with no operator involvement, down to the exact root cause (the web container was
started under a different compose project, so it could not resolve
`identity-service`, and had crash-looped 575 times).

The information those six issues asked for was sitting in a vhost file, a DNS
record, a certificate, and `docker ps`. Nobody needed to be asked.

---

## The discovery playbook

### A public site is wrong (404, 500, wrong content, TLS error)

```sh
# 1. What does it actually serve, and under what certificate?
#    NEVER use -k. A cert whose CN is a different domain is exactly the bug you
#    are hunting, and -k hides it. licensetree.io served another client's site
#    for four weeks because every check used -k.
curl -sS -o /dev/null -w '%{http_code}\n' https://<host>/
echo | openssl s_client -servername <host> -connect <host>:443 2>/dev/null \
  | openssl x509 -noout -subject -dates -ext subjectAltName

# 2. Where does DNS point?
getent hosts <host>

# 3. On the host: which vhost claims it, and where does it proxy?
grep -l '<host>' /www/server/panel/vhost/nginx/*.conf
grep -hE 'server_name|proxy_pass|ssl_certificate ' /www/server/panel/vhost/nginx/<file>.conf

# 4. Is anything listening on that upstream port?
ss -ltnp | grep ':<port>'

# 5. What containers exist, and are they healthy?
docker ps -a --format '{{.Names}}\t{{.Status}}' | grep -i <project>
docker inspect <container> --format 'restarts={{.RestartCount}} health={{.State.Health.Status}}'

# 6. Why is it failing?
docker logs --tail 40 <container>
tail -20 /www/wwwlogs/<host>.error.log
```

Six commands, and you know the port, the hostname, the certificate scope, the
canonical-host behaviour and the actual fault. **Those are four of the six
questions above, answered without asking.**

### A container is unhealthy or restarting

`RestartCount` climbing is a crash loop, not a slow start. Read the logs and look
for the FIRST error, not the last. Check `com.docker.compose.project` on the
broken container and on a healthy sibling — if they differ, they are on different
networks and cannot resolve each other by service name, which looks like a DNS or
credential fault and is neither.

### A build or pipeline is failing

Query the forge for the terminal state before believing an issue that says it is
queued. A note written when an agent gave up is a claim about the past:

```sh
curl -s -u ":$PAT" "https://dev.azure.com/<org>/<project>/_apis/build/builds/<id>?api-version=7.0"
```
Use the build **id**, not `buildNumber` — `buildNumber` is a display string like
`20260814.4` and querying it returns nothing.

### A library, framework or API is unfamiliar

Use **Context7** before guessing or asking. It exists precisely so you do not
have to. Also check `doc/`, the project's `CLAUDE.md`/`AGENTS.md`, and your own
memory and MemPalace — the answer to "how do we deploy this" is usually written
down already.

---

## Before you block: is this someone ELSE's job, not the operator's?

Ask this before every block, because it is the commonest wrong turn on this
fleet. If you cannot do the work because **another agent has the credential, the
tool or the specialism**, that is not a blocker — it is a routing decision, and
it is yours to make.

A PM once held four Umbraco/DevOps issues and escalated each one asking the
operator for admin credentials. The right answer was never to grant them: it was
to hand the work to the DevOps agent who already had them. Every one of those
escalations cost the operator a notification and the issue several days.

**You may hand off an issue you currently hold**, directly, without any special
permission:

```
PATCH /issues/<id>  { "assigneeAgentId": "<the right agent>",
                      "handoffReason": "why it is not yours and why it IS theirs" }
```

Three things it will refuse, and each refusal is the point:

| refused when | because |
|---|---|
| the issue is not currently yours | you may give away your own work, never take or move someone else's |
| the reason is missing or thin | the next agent must be able to tell whether it is genuinely the right owner |
| it has already bounced 3 times | at that point the disagreement is the problem, not the routing — block for the operator and state **both** opinions |

Name the capability, not the vibe. *"Umbraco backoffice work — Peter P. holds the
CMS credentials and I do not"* routes correctly. *"Not my area"* does not.

And do not ask the operator to **widen your access** instead. Least privilege
outlives your ticket; the credential exists where it does on purpose.

## What genuinely needs the operator

Escalate without hesitation for these. They are short, and they have one thing in
common: **no amount of investigation produces the answer.**

1. **A secret you do not have and cannot derive.** But first check the project's
   `scoped_env_vars` — the credential is often already provisioned. If it is
   genuinely missing, ask for *that specific credential*, not for the answer it
   would have told you.
2. **A human-only interaction.** CAPTCHAs, Cloudflare human verification, an
   OAuth consent screen, 2FA. A person must physically act.
3. **A business decision with no correct answer.** Which of two features ships
   first, what the acceptance criteria should be, whether to spend money, what a
   client actually wants. These are preferences, not facts.
4. **Authorisation for something irreversible or externally visible.** Publishing,
   emailing a client, deleting data, changing production DNS.

Everything else is research.

---

## How to escalate properly

If you have genuinely exhausted the above, say so explicitly:

```
## What I tried
- `curl`/`openssl` against staging.example.com → HTTP 200, cert CN=example.com,
  SAN lacks staging.*
- vhost `staging.example.com.conf` proxies to 127.0.0.1:5200
- `ss -ltnp` shows nothing listening on 5200
- `docker ps -a` shows no container for this project
- Searched doc/ and the project rules for the intended upstream — not recorded

## What I need
The container image/compose file for this app, or confirmation it was never
deployed. I cannot derive this: no artifact for it exists on the host or in the
repo.
```

That escalation is answerable in one line. Compare it with *"awaiting the
application port, DNS intent and canonical hostname"*, which asks the operator to
do the investigation you were assigned.

**A request that names a specific missing thing gets answered in hours. A request
that asks someone else to work it out gets answered in days, or never.**

---

## Why this matters more than it looks

Of 2,678 operator requests raised on this fleet, **2,574 were cancelled and 94
answered.** Requests that carry a real, specific question are answered in about
five hours; auto-raised ones average 130. The queue is not ignored — most of it
simply should never have been sent, and the volume buries the few that must be.

Every question you do not send makes the ones you do send arrive faster.

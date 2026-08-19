# Newsletter Studio — spec and plan

Status: **draft for approval.** Two decisions below are the user's to make and block the build.

---

## 1. The name is not available

"Newsletter Studio" is a mature commercial Umbraco product by Enkel Media, currently
**v18.0.0**:

| Package | Downloads |
|---|---|
| `NewsletterStudio.Core` | 176,992 |
| `NewsletterStudio.Web` | 127,257 |
| `NewsletterStudio` | 91,241 |
| `NewsletterStudio.CssInline` | 73,196 |
| `NewsletterStudio.Plugins.Mailjet` | 2,858 |

Shipping `SplatDev.Umbraco.Plugins.NewsletterStudio` would collide with an established
trademark on the same marketplace, in the same category, against the same buyers. It would
also be confusing rather than competitive: their `.Plugins.Mailjet` naming means a search
for "newsletter studio mailgun" would surface ours as if it were their add-on.

**Decided: `SplatDev.Umbraco.Plugins.NewsletterStudio`.** The collision is accepted; the
`SplatDev.` prefix is mandatory in this repo anyway and does identify the publisher. Noted
once here so the risk is on record, and not raised again.

---

## 2. Composition, not consolidation

**Decided: every existing plugin stays as it is.** Newsletter Studio references them as
NuGet packages and builds on top. No code is copied and nothing is deprecated.

That is viable — every one of them exposes a public interface and registers it in DI:

| Package | Public interface | Registered |
|---|---|---|
| `…Newsletter` | `INewsletterService` | ✅ |
| `…Newsletters` | `INewslettersService` | ✅ |
| `…EmailNotifications` | `IMailProvider`, `IEmailTemplateService`, `INewsletterService`, `INotificationService` | ✅ |
| `…EmailTemplates` | `IEmailTemplateService`, `IEmailStyleService` | ✅ |
| `…Smtp` | `ISmtpService` | ✅ |
| `…Mailer` | `IEmailService` | ❌ **not registered** |

Newsletter Studio becomes a thin orchestration layer plus the parts nobody owns. The gap
report below is what it has to supply.

---

## 3. What already exists and must be reused

`SplatDev.Messaging` is the provider abstraction, and eight providers already implement
against it:

```
SplatDev.Messaging               IMessagingController<T,U>, IBulkMessagingController<T,U>,
                                 IAddress, IBulkAddress, IBulkMessageData,
                                 ICannedMessageTemplate, CannedMessagePlaceholder
SplatDev.Messaging.SendGrid      SplatDev.Messaging.Mailgun      SplatDev.Messaging.Smtp
SplatDev.Messaging.SocketLabs    SplatDev.Messaging.ClickSend    SplatDev.Messaging.Twilio
SplatDev.Messaging.SMSTools      SplatDev.Messaging.Newsletter
```

`IBulkMessagingController` already models exactly what a campaign send is: a set of
recipients each carrying their own placeholder data. **The sending layer is done.** Campaign
Suite consumes it and adds no transport code of its own.

### Gap: providers we do not have

The ask names MailerSend. Missing against the current market: **MailerSend, Amazon SES,
Postmark, Brevo (ex-Sendinblue), Resend, Mailjet**. Each is a new
`SplatDev.Messaging.<Name>` sibling implementing the existing interface — a small, well-
bounded project apiece, not part of Newsletter Studio itself.

### Gap: the abstraction has no delivery feedback

`IBulkMessagingController` sends and returns a result. It has no concept of **bounce,
complaint, open, click, or unsubscribe-from-provider**, and every provider posts those as
webhooks in its own shape. Campaign statistics are meaningless without them, and
suppression is a legal obligation rather than a feature — continuing to mail an address
that hard-bounced or complained is how a sending domain gets blocked.

This is the single largest piece of genuinely new backend work.

---

## 3a. Findlay, and the transactional/marketing split

`customers/findlay-auto` does have email functionality, and it is worth being precise about
why it is **not** an early version of this and must not be folded in.

Findlay is **transactional and event-driven**. `SplatDev.Umbraco.Workflow` defines:

```csharp
IActionMessage             // a named notification intent on a step transition
IActionMessageDispatcher   // host-supplied transport (email, Slack, …)
ActionMessageAudience      // Submitter | AssignedGroup | Custom
```

`FindlayAutoActionMessageDispatcher` turns a `WorkflowEvent` into a `FindlayNotification`
and hands it to `IFindlayNotificationService`.

The differences are structural, not cosmetic:

| | Findlay (workflow) | Newsletter Studio (marketing) |
|---|---|---|
| Trigger | a step transition | a schedule, or manual send |
| Audience | derived from context — the submitter, the assigned group | a list or a segment |
| Volume | one recipient set per event | thousands per send |
| Unsubscribe | **must not apply** — "your application advanced a stage" is not marketing | mandatory, RFC 8058 |
| Tracking | none | opens, clicks, bounces |
| Consent | not required (legitimate interest / contract) | required and provable |

Conflating them would be an actual compliance error: attaching an unsubscribe link to a
recruitment status notification, or requiring marketing consent before telling a candidate
their application moved, are both wrong.

### What *is* reusable, and is currently being rebuilt per customer

`IFindlayNotificationService` is **declared in the customer folder and implemented in the
Findlay solution**, outside this repository. `FindlayNotification` carries `PayloadJson`,
`ActionKey`, `FromStepKey` and `ToStepKey` — the raw event, not a rendered message. So
whoever implements `SendAsync` has to build subject and body, resolve placeholders from the
payload, and pick a transport. Every future customer integration repeats that.

Newsletter Studio should own the rendering half and expose it:

```
SplatDev.Umbraco.Plugins.NewsletterStudio.Workflow     NEW, small
    an IActionMessageDispatcher that resolves a Newsletter Studio *template* by the action
    alias, binds placeholders from WorkflowEvent.PayloadJson, resolves the audience from
    ActionMessageAudience, and sends through IBulkMessagingController.
```

A customer integration then becomes a template plus an audience mapping — editable in the
backoffice by a non-developer — instead of a bespoke `IFindlayNotificationService` per
client. Findlay keeps its Hireology data provider, which is genuinely customer-specific.

This also gives the template editor a second consumer, which is a good pressure test:
templates that only ever render marketing HTML tend to grow assumptions (unsubscribe
footer, tracking pixel, list context) that a transactional message must be able to omit.
Phase 4 must therefore treat those three as **per-template switches**, not fixtures.

---

## 3b. Gap report across the related plugins

Measured, not assumed. What follows is what Newsletter Studio must supply because no
referenced package provides it.

### Blocking — composition cannot proceed without these

**G1. `Mailer.IEmailService` is public but never registered.**
`MailerComposer` registers the concrete `MailerService` and `MicrosoftGraphMailerService`
as transients; the interface is not bound. A consumer referencing the package cannot
resolve `IEmailService` from DI at all. One line in Mailer fixes it, and it must be fixed
in Mailer rather than worked around here.

**G2. Two interface names appear in two packages each.**
`INewsletterService` exists in both `…Newsletter` and `…EmailNotifications`;
`IEmailTemplateService` in both `…EmailTemplates` and `…EmailNotifications`. Referencing
both packages makes the bare name ambiguous (CS0104). This is a compile error rather than
silent shadowing — the container sees distinct types — so it is a developer-experience
cost, not a correctness risk. Newsletter Studio should alias them explicitly at the using
site and never re-export either name.

### Functional gaps — the reason Newsletter Studio exists

**G3. No shared contact model.** Three separate subscriber types
(`Newsletter.Subscriber`, `Newsletters.NewsletterSubscriber`,
`EmailNotifications.Subscriber`) with no common identity. A contact subscribed in one is
invisible to the others. Newsletter Studio owns the canonical contact and maps outward;
it must not try to unify their storage.

**G4. Delivery feedback is collected two incompatible ways, and only for one provider.**
`Newsletter` **pulls** counters from the provider's stats API
(`result.Stats.Opened.Total`, `Failed.Permanent.Total`) at read time.
`EmailNotifications` **receives** them by webhook — `MailgunWebhookController`, Mailgun
only. Neither newsletter plugin has a webhook receiver at all.

Consequences: no per-recipient events (only campaign totals), nothing for SendGrid,
SocketLabs or SMTP, and no suppression anywhere. Continuing to mail an address that hard-
bounced or complained is how a sending domain gets blocked, so this is an obligation
rather than a feature. `SplatDev.Messaging.Webhooks` — normalising every provider's
callback into one `DeliveryEvent` stream — is the single largest piece of new backend work
and phase 2 of the plan.

**G5. No suppression list.** Follows from G4. Nothing anywhere records "never mail this
address again".

**G6. No unsubscribe standard.** No `List-Unsubscribe` or `List-Unsubscribe-Post`
(RFC 8058), required of bulk senders by Gmail and Yahoo since 2024.

**G7. `Newsletters` cannot send.** 542 lines, no transport of any kind — it records
campaigns and subscribers with no dispatch path. Newsletter Studio must not assume a
referenced package can deliver just because it models campaigns.

**G8. No email-safe rendering.** `EmailTemplates` stores an `EmailTemplate` and an
`EmailStyle` and does no inlining, no client-compatibility work, no MJML. Nothing in the
estate turns authored content into markup Outlook will render. This is phase 4 and the
approved MJML pipeline.

**G9. No batching or resumability.** No queue, no batch state. A 50,000-recipient campaign
cannot be one request, and a failed batch must not re-send the ones that already went.

**G10. No consent linkage.** `…Plugins.Lgpd` already models provable, append-only consent
(art. 8 §1). None of the email plugins reference it, so a subscriber's consent is not
demonstrable. Newsletter Studio should bind them rather than add a fourth consent store.

**G11. Provider coverage.** Present: SendGrid, Mailgun, SMTP, SocketLabs. Missing:
**MailerSend** (named in the ask), Amazon SES, Postmark, Brevo, Resend, Mailjet.

**G12. Umbraco 13 reach.** `Newsletter`, `EmailNotifications` and `EmailTemplates` ship a
v17 manifest only. Newsletter Studio on v13 would surface features whose underlying
plugins have no v13 UI — acceptable, since Newsletter Studio supplies its own, but it means
it cannot deep-link into theirs on v13.


---

## 4. Scope

### 4.1 Contacts and lists
- Contact: email, name, custom fields, status (`subscribed`, `unsubscribed`, `bounced`, `complained`, `cleaned`)
- Lists, and segments defined by a saved filter over contacts
- Import from CSV with a column mapper; export
- Double opt-in with a confirmation token, and the consent record kept — LGPD art. 8 §1 puts the burden of proof on the controller, and this estate already has that model in `…Plugins.Lgpd`. **Reuse it rather than inventing a second consent store.**
- One-click unsubscribe honouring `List-Unsubscribe` and `List-Unsubscribe-Post` (RFC 8058), which Gmail and Yahoo have required of bulk senders since 2024

### 4.2 Campaigns
- Draft → scheduled → sending → sent, with pause and cancel
- Audience = lists minus suppressions, previewed as a count before send
- A/B on subject line, split by percentage, winner by open or click
- Send-time: immediate, scheduled, or per-recipient timezone
- Test send to a named seed list
- Sending is a queued background job with resumable batches. A campaign to 50,000 contacts cannot be one HTTP request, and a failed batch must not re-send the batches that already went

### 4.3 Content and the editor
This is the part the ask cares most about, and the hard part.

**Email HTML is not web HTML.** Outlook renders with Word's engine; Gmail strips `<style>`
blocks in some clients; flexbox and grid are unusable; layout is tables. A general-purpose
WYSIWYG produces markup that looks correct in the editor and breaks in the inbox — which is
precisely the failure mode to avoid.

Proposed: **author in blocks, compile to MJML, render to email-safe HTML, then inline the
CSS.** MJML is the de-facto standard for exactly this problem and its output is tested
against the major clients. The editor is therefore a block editor over a constrained
component set — section, column, text, image, button, divider, spacer, social, HTML escape
hatch — not a free-form rich text field.

- Rich text inside a text block only, restricted to what email supports
- Placeholders (`{{firstName}}`, fallbacks, conditional blocks) resolved at send
- Content pulled from Umbraco: a block that embeds a content node or a blog post, rendered through a template so a campaign can be assembled from existing pages
- Reusable templates and saved blocks, per-brand
- Live preview: desktop, mobile, and plain-text auto-generated from the HTML
- CSS inlining at render — note the competitor ships `NewsletterStudio.CssInline` as a separate 73k-download package, which is a fair signal of how much this matters

*Open question for the user: is MJML acceptable as a dependency? It is Node tooling. The
alternatives are a .NET MJML port (less complete) or hand-rolled table layout (cheaper
initially, then an unbounded client-compatibility tail). **My recommendation is MJML**,
compiled at save time and stored as HTML so the runtime has no Node dependency.*

### 4.4 Deliverability
- Per-domain sender identities with SPF/DKIM/DMARC status surfaced from the provider
- Suppression list, global and per-list, fed by webhooks
- Bounce classification: hard bounces suppress immediately, soft bounces after a threshold
- Complaint handling suppresses on first report
- Spam scoring before send where the provider exposes it

### 4.5 Reporting
Sends, deliveries, opens, clicks by link, bounces, complaints, unsubscribes; per campaign
and per contact; export. Open tracking is a pixel and must be declarable in the LGPD/GDPR
record of processing — this estate has `…Plugins.Lgpd` for art. 37 and should register it
there rather than tracking silently.

---

## 5. Architecture

```
SplatDev.Umbraco.Plugins.NewsletterStudio        Umbraco section, dashboards, editor UI,
                                              campaign/contact/list domain, scheduler
        │  consumes
        ▼
SplatDev.Messaging                            IBulkMessagingController — unchanged
        │  implemented by
        ▼
SplatDev.Messaging.{SendGrid,Mailgun,Smtp,SocketLabs,…}          existing
SplatDev.Messaging.{MailerSend,SES,Postmark,Brevo,Resend,Mailjet} new siblings

SplatDev.Messaging.Webhooks                   NEW — normalises provider callbacks into one
                                              DeliveryEvent stream
```

A dedicated Umbraco **section**, not a dashboard. Campaigns, contacts, lists, templates and
reports are five trees; bolting that onto Content would be the navigation regression the
estate has been correcting all week.

Note the estate rule: a custom section is *available* but not *visible* until its alias is
added to a user group. The installer must say so, or the plugin appears to do nothing.

---

## 6. Plan

Each phase ships independently and is useful on its own.

| Phase | Delivers | Notes |
|---|---|---|
| **0** | Decisions: name, MJML, and what happens to the five existing packages | Blocking |
| **1** | Contacts, lists, segments, import/export, double opt-in, unsubscribe | No sending yet. Consent via the existing Lgpd model |
| **2** | `SplatDev.Messaging.Webhooks` + suppression | The missing abstraction. Do before sending, so bounces are honoured from day one |
| **3** | Campaign domain + queued batch sender over `IBulkMessagingController` | Plain-HTML campaigns, resumable |
| **4** | Block editor → MJML → inlined HTML, preview, placeholders, Umbraco content blocks | The largest phase |
| **5** | Reporting and A/B | Needs phase 2's event stream |
| **6** | New providers: MailerSend, SES, Postmark, Brevo, Resend, Mailjet | Parallelisable, independent |
| **7** | Migration from Newsletter / Newsletters / EmailNotifications, deprecation shims | Ship before unlisting anything |
| **8** | `NewsletterStudio.Workflow` — the shared `IActionMessageDispatcher` | Retires the per-customer notification service. Needs phase 4's templates |

---

## 7. Decisions required

1. **Name.** `NewsletterStudio`, or one of the alternatives, or something else — but not
   "Newsletter Studio".
2. **The five overlapping packages.** Consolidate into Newsletter Studio with a migration and
   deprecation shims (as SPL-3532 specified for the Analytics rename), or leave them
   published alongside? Leaving them means five products competing with our own sixth.
3. **MJML.** Acceptable as a build-time dependency?

4. **Findlay.** Should phase 8 replace `IFindlayNotificationService` on the live site, or
   ship alongside it and let Findlay migrate when convenient? Replacing touches a customer
   deployment outside this repository, so it is not mine to schedule.

## 8. Explicitly out of scope

Transactional email as a *product* — that remains `Mailer` and `EmailNotifications`; phase 8 only supplies rendering to the workflow engine — SMS campaigns (the
`Messaging` SMS providers exist but the audience model differs), and CRM features beyond
contact custom fields.

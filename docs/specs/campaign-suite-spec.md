# Campaign Suite — spec and plan

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

**Working name used throughout this document: `SplatDev.Umbraco.Plugins.CampaignSuite`.**
Alternatives if that is not liked: `Broadcast`, `MailRoom`, `Dispatch`, `CampaignDesk`.
*Decision required before any code is written, because the package id, the `App_Plugins`
folder, the section alias and the database schema all derive from it and none of them are
cheap to rename after publication.*

---

## 2. This is not a new plugin — it is a consolidation

The estate already contains **three implementations of newsletter campaigns and two of
email templates**, all published, all overlapping:

| Package | Version | Owns | Route |
|---|---|---|---|
| `…Plugins.Newsletter` | 1.2.0 | Campaign, CampaignStats, Subscriber, SubscriberList | `management/api/v1/newsletter` |
| `…Plugins.Newsletters` | 2.2.0 | NewsletterCampaign, NewsletterSend, NewsletterSubscriber | `api/newsletters` |
| `…Plugins.EmailNotifications` | 1.2.0 | Campaign, EmailEvent, EmailTemplate, Notification, Subscriber | `api/newsletter`, `api/email-templates`, `api/mailgun` |
| `…Plugins.EmailTemplates` | 1.2.0 | EmailStyle, EmailTemplate | `management/api/v1/email-templates` |
| `…Plugins.Mailer` | 2.1.4 | EmailModel, TemplateSource | Microsoft Graph sender |

`Newsletter` and `Newsletters` differ by a trailing **s**, ship different APIs, and have
**identical download counts (568 each)** — which suggests nobody is choosing between them
deliberately. `EmailNotifications` independently reimplements both newsletters *and* email
templates, and carries its own Mailgun webhook.

Building a sixth would make the problem worse. Campaign Suite must **subsume** these, and
the migration path for existing installs is part of the deliverable, not an afterthought.

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
bounded project apiece, not part of Campaign Suite itself.

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

| | Findlay (workflow) | Campaign Suite (marketing) |
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

Campaign Suite should own the rendering half and expose it:

```
SplatDev.Umbraco.Plugins.CampaignSuite.Workflow     NEW, small
    an IActionMessageDispatcher that resolves a Campaign Suite *template* by the action
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
SplatDev.Umbraco.Plugins.CampaignSuite        Umbraco section, dashboards, editor UI,
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
| **8** | `CampaignSuite.Workflow` — the shared `IActionMessageDispatcher` | Retires the per-customer notification service. Needs phase 4's templates |

---

## 7. Decisions required

1. **Name.** `CampaignSuite`, or one of the alternatives, or something else — but not
   "Newsletter Studio".
2. **The five overlapping packages.** Consolidate into Campaign Suite with a migration and
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

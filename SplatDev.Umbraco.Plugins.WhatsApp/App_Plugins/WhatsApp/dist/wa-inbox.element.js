import { LitElement as U, nothing as p, html as i, css as q, state as h, customElement as B } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as j } from "@umbraco-cms/backoffice/element-api";
import { W as F, s as G } from "./chunks/shared-styles-DntHce3s.js";
import { b as C, d as z, c as Z, a as H, f as D, e as N } from "./chunks/types-BWOc9hyT.js";
var K = Object.defineProperty, Y = Object.getOwnPropertyDescriptor, I = (t) => {
  throw TypeError(t);
}, d = (t, e, a, o) => {
  for (var n = o > 1 ? void 0 : o ? Y(e, a) : e, f = t.length - 1, _; f >= 0; f--)
    (_ = t[f]) && (n = (o ? _(e, a, n) : _(n)) || n);
  return o && n && K(e, a, n), n;
}, x = (t, e, a) => e.has(t) || I("Cannot " + a), c = (t, e, a) => (x(t, e, "read from private field"), a ? a.call(t) : e.get(t)), g = (t, e, a) => e.has(t) ? I("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), k = (t, e, a, o) => (x(t, e, "write to private field"), e.set(t, a), a), r = (t, e, a) => (x(t, e, "access private method"), a), u, v, m, s, b, y, S, T, $, E, W, M, A, L, P, w, O, R;
let l = class extends j(U) {
  constructor() {
    super(...arguments), g(this, s), g(this, u, new F(this)), this._conversations = [], this._messages = [], this._draft = "", this._error = "", this._loadingList = !0, this._loadingThread = !1, this._sending = !1, this._contact = null, this._contactDraft = null, this._savingContact = !1, g(this, v), g(this, m);
  }
  connectedCallback() {
    super.connectedCallback(), r(this, s, b).call(this), c(this, u).heartbeat(), k(this, v, window.setInterval(() => void c(this, u).heartbeat(), 6e4)), k(this, m, window.setInterval(() => {
      document.visibilityState === "visible" && r(this, s, b).call(this, { quiet: !0 });
    }, 2e4));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), c(this, v) && window.clearInterval(c(this, v)), c(this, m) && window.clearInterval(c(this, m));
  }
  render() {
    return i`
      <div class="head">
        <h1>Inbox</h1>
        <p>Conversations with your WhatsApp Business number.</p>
      </div>

      ${this._error ? i`<div class="error">${this._error}</div>` : p}

      <div class="row" style="margin-bottom:12px">
        <uui-button
          look="secondary"
          label="Refresh conversations"
          ?disabled=${this._loadingList}
          @click=${() => void r(this, s, b).call(this)}
        >Refresh</uui-button>
      </div>

      <div class="layout">
        <div class="list">
          ${this._loadingList ? i`<uui-loader></uui-loader>` : this._conversations.length === 0 ? i`<div class="empty">
                  No conversations yet. They appear here once the webhook is registered
                  and someone messages your number.
                </div>` : this._conversations.map((t) => r(this, s, T).call(this, t))}
        </div>
        ${r(this, s, R).call(this)}
      </div>
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
b = async function(t = {}) {
  t.quiet || (this._loadingList = !0, this._error = "");
  try {
    if (this._conversations = await c(this, u).getConversations(), this._selected) {
      const e = this._conversations.find((a) => a.id === this._selected.id);
      e && (this._selected = e);
    }
  } catch (e) {
    t.quiet || (this._error = e instanceof Error ? e.message : String(e));
  } finally {
    t.quiet || (this._loadingList = !1);
  }
};
y = async function(t) {
  this._selected = t, this._loadingThread = !0, this._error = "", this._messages = [], this._contact = null, this._contactDraft = null;
  try {
    const e = await c(this, u).getThread(t.id);
    this._messages = e.messages, this._selected = e.conversation, c(this, u).getContactByWaId(e.conversation.waId).then((a) => {
      this._contact = a;
    }).catch(() => {
      this._contact = null;
    }), t.unreadCount > 0 && (await c(this, u).markRead(t.id), this._conversations = this._conversations.map(
      (a) => a.id === t.id ? { ...a, unreadCount: 0 } : a
    ));
  } catch (e) {
    this._error = e instanceof Error ? e.message : String(e);
  } finally {
    this._loadingThread = !1;
  }
};
S = async function() {
  const t = this._selected, e = this._draft.trim();
  if (!(!t || !e || this._sending)) {
    this._sending = !0, this._error = "";
    try {
      await c(this, u).sendText(t.waId, e), this._draft = "", await r(this, s, y).call(this, t), await r(this, s, b).call(this);
    } catch (a) {
      this._error = a instanceof Error ? a.message : String(a);
    } finally {
      this._sending = !1;
    }
  }
};
T = function(t) {
  var a;
  const e = ((a = this._selected) == null ? void 0 : a.id) === t.id;
  return i`
      <button
        class="thread"
        aria-current=${e ? "true" : "false"}
        @click=${() => void r(this, s, y).call(this, t)}
      >
        <span class="thread-row">
          ${r(this, s, $).call(this, t)}
          <span class="thread-text">
            <span class="top">
              <span class="name">
                ${C(t.profileName, t.waId, t.contactName)}
              </span>
              <span class="when">${z(t.lastMessageUtc)}</span>
            </span>
            <span class="preview">${t.lastMessagePreview || "—"}</span>
          </span>
        </span>
        ${t.unreadCount > 0 ? i`<span class="unread">${t.unreadCount}</span>` : p}
      </button>
    `;
};
$ = function(t, e = !1) {
  const a = Z(t.waId);
  return i`
      <span
        class=${e ? "avatar lg" : "avatar"}
        style="background: hsl(${a} 45% 45%)"
        aria-hidden="true"
      >${H(t.profileName, t.waId, t.contactName)}</span>
    `;
};
E = function(t) {
  const e = (t || "").toLowerCase();
  if (e === "failed") return i` · failed`;
  const a = e === "delivered" || e === "read", o = e === "read" ? "ticks read" : "ticks", n = i`
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 8.5 5.5 12 14 3.5" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  return i` ·
      <span class=${o} role="img" aria-label=${e || "sent"}>
        ${n}${a ? n : p}
      </span>
    `;
};
W = function(t) {
  const e = t.status === "failed", a = `bubble ${t.inbound ? "in" : "out"}${e ? " failed" : ""}`;
  return i`
      <div class=${a}>
        <span class="body">${t.body || i`<em>[${t.messageType}]</em>`}</span>
        <span class="meta">
          ${z(t.timestampUtc)}
          ${t.inbound ? p : r(this, s, E).call(this, t.status)}
          ${t.templateName ? i` · template: ${t.templateName}` : p}
          ${t.errorMessage ? i` · ${t.errorMessage}` : p}
        </span>
      </div>
    `;
};
M = function(t) {
  let e = "";
  return t.map((a) => {
    const o = new Date(
      /[Zz]|[+-]\d{2}:?\d{2}$/.test(a.timestampUtc) ? a.timestampUtc : `${a.timestampUtc}Z`
    ), n = Number.isNaN(o.getTime()) ? "" : o.toDateString(), f = n !== "" && n !== e;
    return f && (e = n), i`
        ${f ? i`<span class="day-sep">
              ${o.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
            </span>` : p}
        ${r(this, s, W).call(this, a)}
      `;
  });
};
A = function(t) {
  return t.windowOpen ? i`
      <div class="reply">
        <div class="reply-row">
          <uui-textarea
            label="Reply"
            placeholder="Write a reply…"
            .value=${this._draft}
            ?disabled=${this._sending}
            @input=${(e) => {
    this._draft = e.target.value;
  }}
          ></uui-textarea>
          <uui-button
            look="primary"
            color="positive"
            label="Send reply"
            ?disabled=${this._sending || !this._draft.trim()}
            @click=${() => void r(this, s, S).call(this)}
          >${this._sending ? "Sending…" : "Send"}</uui-button>
        </div>
        <p class="hint">${N(t.windowMinutesRemaining)} in this window.</p>
      </div>
    ` : i`
        <div class="reply">
          <div class="warn">
            <span>
              The 24-hour customer-service window has closed, so WhatsApp will not deliver a
              free-form reply. Use the <strong>Send</strong> view to send an approved template
              instead — that reopens the window once they reply.
            </span>
          </div>
        </div>
      `;
};
L = function(t) {
  var e, a, o, n;
  if (this._contactDraft) {
    this._contactDraft = null;
    return;
  }
  this._contactDraft = {
    waId: t.waId,
    // Seed a new contact with WhatsApp's profile name so the common case is one click.
    displayName: ((e = this._contact) == null ? void 0 : e.displayName) ?? t.profileName ?? "",
    company: ((a = this._contact) == null ? void 0 : a.company) ?? "",
    email: ((o = this._contact) == null ? void 0 : o.email) ?? "",
    notes: ((n = this._contact) == null ? void 0 : n.notes) ?? ""
  };
};
P = async function() {
  var t;
  if (this._contactDraft) {
    this._savingContact = !0, this._error = "";
    try {
      const e = await c(this, u).saveContact(this._contactDraft);
      this._contact = e, this._contactDraft = null, this._conversations = this._conversations.map(
        (a) => a.waId === e.waId ? { ...a, contactName: e.displayName } : a
      ), ((t = this._selected) == null ? void 0 : t.waId) === e.waId && (this._selected = { ...this._selected, contactName: e.displayName });
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      this._savingContact = !1;
    }
  }
};
w = function(t, e, a = "") {
  var o;
  return i`
      <div>
        <label>${t}</label>
        <uui-input
          .value=${((o = this._contactDraft) == null ? void 0 : o[e]) ?? ""}
          placeholder=${a}
          @input=${(n) => {
    this._contactDraft && (this._contactDraft = {
      ...this._contactDraft,
      [e]: n.target.value
    });
  }}
        ></uui-input>
      </div>
    `;
};
O = function(t) {
  if (!this._contactDraft) {
    if (!this._contact) return p;
    const e = [this._contact.company, this._contact.email].filter(Boolean);
    return e.length === 0 && !this._contact.notes ? p : i`
        <div class="contact-panel">
          <span class="contact-meta">
            ${e.join(" · ")}
            ${this._contact.notes ? i`<div>${this._contact.notes}</div>` : p}
          </span>
        </div>
      `;
  }
  return i`
      <div class="contact-panel">
        <strong>${this._contact ? "Edit contact" : "Add contact"}</strong>
        <div class="contact-meta">${D(t.waId)}</div>

        <div class="contact-grid">
          ${r(this, s, w).call(this, "Name", "displayName", "Maria Silva")}
          ${r(this, s, w).call(this, "Company", "company")}
          ${r(this, s, w).call(this, "Email", "email", "maria@example.com")}
        </div>

        <div>
          <label>Notes</label>
          <uui-textarea
            .value=${this._contactDraft.notes ?? ""}
            rows="2"
            @input=${(e) => {
    this._contactDraft && (this._contactDraft = {
      ...this._contactDraft,
      notes: e.target.value
    });
  }}
          ></uui-textarea>
        </div>

        <div class="contact-actions">
          <uui-button label="Cancel" @click=${() => {
    this._contactDraft = null;
  }}></uui-button>
          <uui-button
            look="primary"
            color="positive"
            label=${this._savingContact ? "Saving…" : "Save contact"}
            ?disabled=${this._savingContact}
            @click=${() => void r(this, s, P).call(this)}
          ></uui-button>
        </div>
      </div>
    `;
};
R = function() {
  const t = this._selected;
  return t ? i`
      <div class="pane">
        <div class="pane-head">
          <div class="head-id">
            ${r(this, s, $).call(this, t, !0)}
            <div>
              <div class="head-name">
                ${C(t.profileName, t.waId, t.contactName)}
              </div>
              <div class="head-number">${D(t.waId)}</div>
            </div>
          </div>
          <span class="head-actions">
            <uui-button
              look="secondary"
              compact
              label=${this._contact ? "Edit contact" : "Add contact"}
              title=${this._contact ? "Edit this contact" : "Give this number a name your team controls"}
              @click=${() => r(this, s, L).call(this, t)}
            ></uui-button>
            <span class="window-pill ${t.windowOpen ? "open" : "closed"}">
              ${t.windowOpen ? N(t.windowMinutesRemaining) : "window closed"}
            </span>
          </span>
        </div>

        ${r(this, s, O).call(this, t)}

        <div class="transcript">
          ${this._loadingThread ? i`<uui-loader></uui-loader>` : this._messages.length === 0 ? i`<div class="empty">No messages in this conversation yet.</div>` : r(this, s, M).call(this, this._messages)}
        </div>

        ${r(this, s, A).call(this, t)}
      </div>
    ` : i`
        <div class="pane">
          <div class="empty">Select a conversation on the left to read it.</div>
        </div>
      `;
};
l.styles = [
  G,
  q`
      .layout {
        display: grid;
        grid-template-columns: minmax(240px, 320px) 1fr;
        gap: var(--uui-size-space-5, 16px);
        align-items: start;
      }

      /* Single column once there is no room for a side-by-side reading pane. */
      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }

      .list {
        border: 1px solid var(--wa-hairline);
        border-radius: var(--wa-radius);
        background: var(--uui-color-surface);
        box-shadow: var(--wa-shadow);
        max-height: 70vh;
        overflow-y: auto;
        /* Keeps the first/last row corners inside the rounded container. */
        overflow-x: hidden;
      }

      .thread {
        display: block;
        width: 100%;
        text-align: left;
        border: 0;
        border-bottom: 1px solid var(--wa-hairline);
        background: transparent;
        color: inherit;
        font: inherit;
        padding: var(--uui-size-space-4, 12px);
        cursor: pointer;
        /* Comfortably above the 44px touch target minimum. */
        min-height: 56px;
        transition: background 140ms var(--wa-ease);
      }

      .thread:last-child {
        border-bottom: 0;
      }

      .thread:hover {
        background: color-mix(in srgb, var(--uui-color-surface-alt) 70%, transparent);
      }

      .thread[aria-current="true"] {
        background: var(--uui-color-surface-alt);
        box-shadow: inset 3px 0 0 var(--uui-color-selected);
      }

      .thread:focus-visible {
        outline: 2px solid var(--uui-color-focus);
        outline-offset: -2px;
      }

      .thread .top {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: baseline;
      }

      .thread .name {
        font-weight: 600;
        font-size: 0.9rem;
      }

      .thread .when {
        font-size: 0.7rem;
        color: var(--uui-color-text-alt);
        white-space: nowrap;
      }

      .thread .preview {
        font-size: 0.8rem;
        color: var(--uui-color-text-alt);
        margin-top: 2px;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .unread {
        display: inline-block;
        min-width: 18px;
        padding: 0 5px;
        border-radius: 9999px;
        background: var(--uui-color-selected);
        color: var(--uui-color-selected-contrast, #fff);
        font-size: 0.7rem;
        font-weight: 700;
        text-align: center;
      }

      .pane {
        border: 1px solid var(--wa-hairline);
        border-radius: var(--wa-radius);
        background: var(--uui-color-surface);
        box-shadow: var(--wa-shadow);
        display: flex;
        flex-direction: column;
        min-height: 400px;
        max-height: 70vh;
        overflow: hidden;
      }

      .pane-head {
        padding: var(--uui-size-space-4, 12px);
        border-bottom: 1px solid var(--wa-hairline);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        /* Subtle lift so the header reads as fixed while the transcript scrolls. */
        background: color-mix(in srgb, var(--uui-color-surface-alt) 35%, var(--uui-color-surface));
      }

      .transcript {
        flex: 1;
        overflow-y: auto;
        padding: var(--uui-size-space-4, 12px);
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-3, 8px);
        /* Anchor the conversation to the bottom like every chat client, so a short
           thread sits above the reply box instead of floating at the top of a tall pane.
           justify-content does this without the bubbles themselves having to grow --
           previously a single message stretched to fill the pane. */
        justify-content: flex-end;
      }

      /* Never let a bubble absorb the transcript's spare height. */
      .bubble {
        flex: 0 0 auto;
      }

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: #fff;
        flex: 0 0 auto;
        user-select: none;
      }

      .avatar.lg {
        width: 40px;
        height: 40px;
        font-size: 0.85rem;
      }

      .thread-row {
        display: flex;
        gap: var(--uui-size-space-3, 8px);
        align-items: center;
      }

      .thread-text {
        min-width: 0;
        flex: 1;
      }

      .head-id {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-3, 8px);
        min-width: 0;
      }

      .head-name {
        font-weight: 700;
        line-height: 1.25;
      }

      .head-actions {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-3, 8px);
        flex-wrap: wrap;
      }

      .head-number {
        font-size: 0.78rem;
        opacity: 0.7;
        font-variant-numeric: tabular-nums;
      }

      /* Delivery state. Ticks carry the WhatsApp idiom (one sent, two delivered,
         blue read); the label beside them keeps it accessible rather than colour-only. */
      .ticks {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        vertical-align: -1px;
      }

      .ticks svg {
        width: 14px;
        height: 14px;
      }

      .ticks.read {
        color: #53bdeb;
      }

      .contact-panel {
        padding: var(--uui-size-space-4, 12px);
        border-bottom: 1px solid var(--wa-hairline);
        background: var(--uui-color-surface-alt);
        display: grid;
        gap: var(--uui-size-space-3, 8px);
      }

      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--uui-size-space-3, 8px);
      }

      @media (max-width: 720px) {
        .contact-grid {
          grid-template-columns: 1fr;
        }
      }

      .contact-panel label {
        display: block;
        font-size: 0.74rem;
        font-weight: 600;
        opacity: 0.85;
        margin-bottom: 3px;
      }

      .contact-actions {
        display: flex;
        gap: var(--uui-size-space-3, 8px);
        justify-content: flex-end;
      }

      .contact-meta {
        font-size: 0.78rem;
        opacity: 0.8;
      }

      .day-sep {
        align-self: center;
        margin: 4px 0;
        padding: 2px 10px;
        border-radius: 9999px;
        background: var(--uui-color-surface-alt);
        border: 1px solid var(--wa-hairline);
        font-size: 0.68rem;
        opacity: 0.85;
      }

      .bubble {
        max-width: min(78%, 62ch);
        padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
        /* Asymmetric radius: the corner nearest the speaker is squared, which is the
           familiar chat idiom and makes direction readable without colour alone. */
        border-radius: 12px;
        font-size: 0.875rem;
        line-height: 1.5;
        overflow-wrap: anywhere;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.04);
        animation: bubble-in 200ms var(--wa-ease) both;
      }

      @keyframes bubble-in {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
      }

      .bubble.in {
        align-self: flex-start;
        border-bottom-left-radius: 4px;
        background: var(--uui-color-surface-alt);
        border: 1px solid var(--wa-hairline);
      }

      /* WhatsApp brand green, with an explicit dark foreground so it stays
         readable in both light and dark backoffice themes. Fixed rather than tokenised
         on purpose: operators read direction by this colour, and it must not invert. */
      .bubble.out {
        align-self: flex-end;
        border-bottom-right-radius: 4px;
        background: #d9fdd3;
        color: #111b21;
        border: 1px solid #b9e7b0;
      }

      .bubble.failed {
        background: var(--uui-color-danger);
        color: var(--uui-color-selected-contrast, #fff);
        border-color: var(--uui-color-danger-emphasis);
      }

      .bubble .body {
        display: block;
        white-space: pre-wrap;
      }

      .meta {
        display: block;
        margin-top: 4px;
        font-size: 0.68rem;
        opacity: 0.75;
      }

      .reply {
        border-top: 1px solid var(--uui-color-border);
        padding: var(--uui-size-space-4, 12px);
      }

      .reply-row {
        display: flex;
        gap: var(--uui-size-space-3, 8px);
        align-items: flex-end;
      }

      .reply-row uui-textarea {
        flex: 1;
      }

      .window-pill {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        padding: 1px 8px;
        border-radius: 9999px;
        white-space: nowrap;
      }

      .window-pill.open {
        background: var(--uui-color-positive);
        color: var(--uui-color-selected-contrast, #fff);
      }

      .window-pill.closed {
        background: var(--uui-color-warning);
        color: var(--uui-color-warning-contrast, #000);
      }
    `
];
d([
  h()
], l.prototype, "_conversations", 2);
d([
  h()
], l.prototype, "_selected", 2);
d([
  h()
], l.prototype, "_messages", 2);
d([
  h()
], l.prototype, "_draft", 2);
d([
  h()
], l.prototype, "_error", 2);
d([
  h()
], l.prototype, "_loadingList", 2);
d([
  h()
], l.prototype, "_loadingThread", 2);
d([
  h()
], l.prototype, "_sending", 2);
d([
  h()
], l.prototype, "_contact", 2);
d([
  h()
], l.prototype, "_contactDraft", 2);
d([
  h()
], l.prototype, "_savingContact", 2);
l = d([
  B("wa-inbox")
], l);
const tt = l;
export {
  l as WaInboxElement,
  tt as default
};
//# sourceMappingURL=wa-inbox.element.js.map

import { LitElement as Z, nothing as f, html as r, css as K, state as u, customElement as Y } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as J } from "@umbraco-cms/backoffice/element-api";
import { W as Q, s as V } from "./chunks/shared-styles-DntHce3s.js";
import { b as N, d as T, c as X, a as tt, f as S, e as I } from "./chunks/types-BWOc9hyT.js";
var et = Object.defineProperty, at = Object.getOwnPropertyDescriptor, E = (t) => {
  throw TypeError(t);
}, p = (t, e, a, o) => {
  for (var n = o > 1 ? void 0 : o ? at(e, a) : e, d = t.length - 1, w; d >= 0; d--)
    (w = t[d]) && (n = (o ? w(e, a, n) : w(n)) || n);
  return o && n && et(e, a, n), n;
}, $ = (t, e, a) => e.has(t) || E("Cannot " + a), c = (t, e, a) => ($(t, e, "read from private field"), a ? a.call(t) : e.get(t)), _ = (t, e, a) => e.has(t) ? E("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), D = (t, e, a, o) => ($(t, e, "write to private field"), e.set(t, a), a), s = (t, e, a) => ($(t, e, "access private method"), a), h, m, g, i, b, W, y, M, k, A, R, C, L, O, P, q, U, B, x, j, H;
let l = class extends J(Z) {
  constructor() {
    super(...arguments), _(this, i), _(this, h, new Q(this)), this._conversations = [], this._messages = [], this._draft = "", this._error = "", this._loadingList = !0, this._loadingThread = !1, this._sending = !1, this._contact = null, this._contactDraft = null, this._savingContact = !1, _(this, m), _(this, g);
  }
  connectedCallback() {
    super.connectedCallback(), s(this, i, b).call(this), c(this, h).heartbeat(), D(this, m, window.setInterval(() => void c(this, h).heartbeat(), 6e4)), D(this, g, window.setInterval(() => {
      document.visibilityState === "visible" && (s(this, i, b).call(this, { quiet: !0 }), s(this, i, M).call(this));
    }, 1e4));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), c(this, m) && window.clearInterval(c(this, m)), c(this, g) && window.clearInterval(c(this, g));
  }
  render() {
    return r`
      <div class="head">
        <h1>Inbox</h1>
        <p>Conversations with your WhatsApp Business number.</p>
      </div>

      ${this._error ? r`<div class="error">${this._error}</div>` : f}

      <div class="row" style="margin-bottom:12px">
        <uui-button
          look="secondary"
          label="Refresh conversations"
          ?disabled=${this._loadingList}
          @click=${() => void s(this, i, b).call(this)}
        >Refresh</uui-button>
      </div>

      <div class="layout">
        <div class="list">
          ${this._loadingList ? r`<uui-loader></uui-loader>` : this._conversations.length === 0 ? r`<div class="empty">
                  No conversations yet. They appear here once the webhook is registered
                  and someone messages your number.
                </div>` : this._conversations.map((t) => s(this, i, R).call(this, t))}
        </div>
        ${s(this, i, H).call(this)}
      </div>
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
b = async function(t = {}) {
  t.quiet || (this._loadingList = !0, this._error = "");
  try {
    if (this._conversations = await c(this, h).getConversations(), this._selected) {
      const e = this._conversations.find((a) => a.id === this._selected.id);
      e && (this._selected = e);
    }
  } catch (e) {
    t.quiet || (this._error = e instanceof Error ? e.message : String(e));
  } finally {
    t.quiet || (this._loadingList = !1);
  }
};
W = function() {
  const t = this.renderRoot.querySelector(".transcript");
  return t ? t.scrollHeight - t.scrollTop - t.clientHeight < 80 : !0;
};
y = function() {
  const t = this.renderRoot.querySelector(".transcript");
  t && (t.scrollTop = t.scrollHeight);
};
M = async function() {
  var e, a, o;
  const t = this._selected;
  if (!(!t || this._loadingThread || this._sending))
    try {
      const n = await c(this, h).getThread(t.id);
      if (((e = this._selected) == null ? void 0 : e.id) !== t.id) return;
      const d = n.messages;
      if (!(d.length !== this._messages.length || ((a = d[d.length - 1]) == null ? void 0 : a.id) !== ((o = this._messages[this._messages.length - 1]) == null ? void 0 : o.id) || d.some((v, G) => {
        var z;
        return v.status !== ((z = this._messages[G]) == null ? void 0 : z.status);
      }))) {
        this._selected = n.conversation;
        return;
      }
      const F = s(this, i, W).call(this);
      this._messages = d, this._selected = n.conversation, F && (await this.updateComplete, s(this, i, y).call(this)), n.conversation.unreadCount > 0 && (await c(this, h).markRead(t.id), this._conversations = this._conversations.map(
        (v) => v.id === t.id ? { ...v, unreadCount: 0 } : v
      ));
    } catch {
    }
};
k = async function(t) {
  this._selected = t, this._loadingThread = !0, this._error = "", this._messages = [], this._contact = null, this._contactDraft = null;
  try {
    const e = await c(this, h).getThread(t.id);
    this._messages = e.messages, this._selected = e.conversation, this.updateComplete.then(() => s(this, i, y).call(this)), c(this, h).getContactByWaId(e.conversation.waId).then((a) => {
      this._contact = a;
    }).catch(() => {
      this._contact = null;
    }), t.unreadCount > 0 && (await c(this, h).markRead(t.id), this._conversations = this._conversations.map(
      (a) => a.id === t.id ? { ...a, unreadCount: 0 } : a
    ));
  } catch (e) {
    this._error = e instanceof Error ? e.message : String(e);
  } finally {
    this._loadingThread = !1;
  }
};
A = async function() {
  const t = this._selected, e = this._draft.trim();
  if (!(!t || !e || this._sending)) {
    this._sending = !0, this._error = "";
    try {
      await c(this, h).sendText(t.waId, e), this._draft = "", await s(this, i, k).call(this, t), await s(this, i, b).call(this), await this.updateComplete, s(this, i, y).call(this);
    } catch (a) {
      this._error = a instanceof Error ? a.message : String(a);
    } finally {
      this._sending = !1;
    }
  }
};
R = function(t) {
  var a;
  const e = ((a = this._selected) == null ? void 0 : a.id) === t.id;
  return r`
      <button
        class="thread"
        aria-current=${e ? "true" : "false"}
        @click=${() => void s(this, i, k).call(this, t)}
      >
        <span class="thread-row">
          ${s(this, i, C).call(this, t)}
          <span class="thread-text">
            <span class="top">
              <span class="name">
                ${N(t.profileName, t.waId, t.contactName)}
              </span>
              <span class="when">${T(t.lastMessageUtc)}</span>
            </span>
            <span class="preview">${t.lastMessagePreview || "—"}</span>
          </span>
        </span>
        ${t.unreadCount > 0 ? r`<span class="unread">${t.unreadCount}</span>` : f}
      </button>
    `;
};
C = function(t, e = !1) {
  const a = X(t.waId);
  return r`
      <span
        class=${e ? "avatar lg" : "avatar"}
        style="background: hsl(${a} 45% 45%)"
        aria-hidden="true"
      >${tt(t.profileName, t.waId, t.contactName)}</span>
    `;
};
L = function(t) {
  const e = (t || "").toLowerCase();
  if (e === "failed") return r` · failed`;
  const a = e === "delivered" || e === "read", o = e === "read" ? "ticks read" : "ticks", n = r`
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 8.5 5.5 12 14 3.5" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  return r` ·
      <span class=${o} role="img" aria-label=${e || "sent"}>
        ${n}${a ? n : f}
      </span>
    `;
};
O = function(t) {
  const e = t.status === "failed", a = `bubble ${t.inbound ? "in" : "out"}${e ? " failed" : ""}`;
  return r`
      <div class=${a}>
        <span class="body">${t.body || r`<em>[${t.messageType}]</em>`}</span>
        <span class="meta">
          ${T(t.timestampUtc)}
          ${t.inbound ? f : s(this, i, L).call(this, t.status)}
          ${t.templateName ? r` · template: ${t.templateName}` : f}
          ${t.errorMessage ? r` · ${t.errorMessage}` : f}
        </span>
      </div>
    `;
};
P = function(t) {
  let e = "";
  return t.map((a) => {
    const o = new Date(
      /[Zz]|[+-]\d{2}:?\d{2}$/.test(a.timestampUtc) ? a.timestampUtc : `${a.timestampUtc}Z`
    ), n = Number.isNaN(o.getTime()) ? "" : o.toDateString(), d = n !== "" && n !== e;
    return d && (e = n), r`
        ${d ? r`<span class="day-sep">
              ${o.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
            </span>` : f}
        ${s(this, i, O).call(this, a)}
      `;
  });
};
q = function(t) {
  return t.windowOpen ? r`
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
            @click=${() => void s(this, i, A).call(this)}
          >${this._sending ? "Sending…" : "Send"}</uui-button>
        </div>
        <p class="hint">${I(t.windowMinutesRemaining)} in this window.</p>
      </div>
    ` : r`
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
U = function(t) {
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
B = async function() {
  var t;
  if (this._contactDraft) {
    this._savingContact = !0, this._error = "";
    try {
      const e = await c(this, h).saveContact(this._contactDraft);
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
x = function(t, e, a = "") {
  var o;
  return r`
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
j = function(t) {
  if (!this._contactDraft) {
    if (!this._contact) return f;
    const e = [this._contact.company, this._contact.email].filter(Boolean);
    return e.length === 0 && !this._contact.notes ? f : r`
        <div class="contact-panel">
          <span class="contact-meta">
            ${e.join(" · ")}
            ${this._contact.notes ? r`<div>${this._contact.notes}</div>` : f}
          </span>
        </div>
      `;
  }
  return r`
      <div class="contact-panel">
        <strong>${this._contact ? "Edit contact" : "Add contact"}</strong>
        <div class="contact-meta">${S(t.waId)}</div>

        <div class="contact-grid">
          ${s(this, i, x).call(this, "Name", "displayName", "Maria Silva")}
          ${s(this, i, x).call(this, "Company", "company")}
          ${s(this, i, x).call(this, "Email", "email", "maria@example.com")}
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
            @click=${() => void s(this, i, B).call(this)}
          ></uui-button>
        </div>
      </div>
    `;
};
H = function() {
  const t = this._selected;
  return t ? r`
      <div class="pane">
        <div class="pane-head">
          <div class="head-id">
            ${s(this, i, C).call(this, t, !0)}
            <div>
              <div class="head-name">
                ${N(t.profileName, t.waId, t.contactName)}
              </div>
              <div class="head-number">${S(t.waId)}</div>
            </div>
          </div>
          <span class="head-actions">
            <uui-button
              look="secondary"
              compact
              label=${this._contact ? "Edit contact" : "Add contact"}
              title=${this._contact ? "Edit this contact" : "Give this number a name your team controls"}
              @click=${() => s(this, i, U).call(this, t)}
            ></uui-button>
            <span class="window-pill ${t.windowOpen ? "open" : "closed"}">
              ${t.windowOpen ? I(t.windowMinutesRemaining) : "window closed"}
            </span>
          </span>
        </div>

        ${s(this, i, j).call(this, t)}

        <div class="transcript">
          ${this._loadingThread ? r`<uui-loader></uui-loader>` : this._messages.length === 0 ? r`<div class="empty">No messages in this conversation yet.</div>` : s(this, i, P).call(this, this._messages)}
        </div>

        ${s(this, i, q).call(this, t)}
      </div>
    ` : r`
        <div class="pane">
          <div class="empty">Select a conversation on the left to read it.</div>
        </div>
      `;
};
l.styles = [
  V,
  K`
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
        /* uui-textarea renders an inline-block <textarea> in its shadow root, so the
           host's line box adds ~7px of descender space underneath it. With the row
           bottom-aligned that gap sat between the two, dropping Send below the field's
           visible edge. Making the host a flex container removes the line box, so the
           host's bottom edge is the field's bottom edge. */
        display: flex;
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
p([
  u()
], l.prototype, "_conversations", 2);
p([
  u()
], l.prototype, "_selected", 2);
p([
  u()
], l.prototype, "_messages", 2);
p([
  u()
], l.prototype, "_draft", 2);
p([
  u()
], l.prototype, "_error", 2);
p([
  u()
], l.prototype, "_loadingList", 2);
p([
  u()
], l.prototype, "_loadingThread", 2);
p([
  u()
], l.prototype, "_sending", 2);
p([
  u()
], l.prototype, "_contact", 2);
p([
  u()
], l.prototype, "_contactDraft", 2);
p([
  u()
], l.prototype, "_savingContact", 2);
l = p([
  Y("wa-inbox")
], l);
const ot = l;
export {
  l as WaInboxElement,
  ot as default
};
//# sourceMappingURL=wa-inbox.element.js.map

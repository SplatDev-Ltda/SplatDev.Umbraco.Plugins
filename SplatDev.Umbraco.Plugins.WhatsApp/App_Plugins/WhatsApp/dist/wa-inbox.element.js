import { LitElement as L, nothing as u, html as i, css as D, state as h, customElement as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as P } from "@umbraco-cms/backoffice/element-api";
import { W as R, s as U } from "./chunks/shared-styles-DntHce3s.js";
import { b as $, d as z, c as q, a as B, f as j, e as T } from "./chunks/types-BWOc9hyT.js";
var Z = Object.defineProperty, F = Object.getOwnPropertyDescriptor, C = (e) => {
  throw TypeError(e);
}, c = (e, t, a, l) => {
  for (var o = l > 1 ? void 0 : l ? F(t, a) : t, f = e.length - 1, g; f >= 0; f--)
    (g = e[f]) && (o = (l ? g(t, a, o) : g(o)) || o);
  return l && o && Z(t, a, o), o;
}, x = (e, t, a) => t.has(e) || C("Cannot " + a), d = (e, t, a) => (x(e, t, "read from private field"), a ? a.call(e) : t.get(e)), w = (e, t, a) => t.has(e) ? C("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), k = (e, t, a, l) => (x(e, t, "write to private field"), t.set(e, a), a), s = (e, t, a) => (x(e, t, "access private method"), a), p, v, b, r, m, y, S, N, _, W, I, M, E, A;
let n = class extends P(L) {
  constructor() {
    super(...arguments), w(this, r), w(this, p, new R(this)), this._conversations = [], this._messages = [], this._draft = "", this._error = "", this._loadingList = !0, this._loadingThread = !1, this._sending = !1, w(this, v), w(this, b);
  }
  connectedCallback() {
    super.connectedCallback(), s(this, r, m).call(this), d(this, p).heartbeat(), k(this, v, window.setInterval(() => void d(this, p).heartbeat(), 6e4)), k(this, b, window.setInterval(() => {
      document.visibilityState === "visible" && s(this, r, m).call(this, { quiet: !0 });
    }, 2e4));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), d(this, v) && window.clearInterval(d(this, v)), d(this, b) && window.clearInterval(d(this, b));
  }
  render() {
    return i`
      <div class="head">
        <h1>Inbox</h1>
        <p>Conversations with your WhatsApp Business number.</p>
      </div>

      ${this._error ? i`<div class="error">${this._error}</div>` : u}

      <div class="row" style="margin-bottom:12px">
        <uui-button
          look="secondary"
          label="Refresh conversations"
          ?disabled=${this._loadingList}
          @click=${() => void s(this, r, m).call(this)}
        >Refresh</uui-button>
      </div>

      <div class="layout">
        <div class="list">
          ${this._loadingList ? i`<uui-loader></uui-loader>` : this._conversations.length === 0 ? i`<div class="empty">
                  No conversations yet. They appear here once the webhook is registered
                  and someone messages your number.
                </div>` : this._conversations.map((e) => s(this, r, N).call(this, e))}
        </div>
        ${s(this, r, A).call(this)}
      </div>
    `;
  }
};
p = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
m = async function(e = {}) {
  e.quiet || (this._loadingList = !0, this._error = "");
  try {
    if (this._conversations = await d(this, p).getConversations(), this._selected) {
      const t = this._conversations.find((a) => a.id === this._selected.id);
      t && (this._selected = t);
    }
  } catch (t) {
    e.quiet || (this._error = t instanceof Error ? t.message : String(t));
  } finally {
    e.quiet || (this._loadingList = !1);
  }
};
y = async function(e) {
  this._selected = e, this._loadingThread = !0, this._error = "", this._messages = [];
  try {
    const t = await d(this, p).getThread(e.id);
    this._messages = t.messages, this._selected = t.conversation, e.unreadCount > 0 && (await d(this, p).markRead(e.id), this._conversations = this._conversations.map(
      (a) => a.id === e.id ? { ...a, unreadCount: 0 } : a
    ));
  } catch (t) {
    this._error = t instanceof Error ? t.message : String(t);
  } finally {
    this._loadingThread = !1;
  }
};
S = async function() {
  const e = this._selected, t = this._draft.trim();
  if (!(!e || !t || this._sending)) {
    this._sending = !0, this._error = "";
    try {
      await d(this, p).sendText(e.waId, t), this._draft = "", await s(this, r, y).call(this, e), await s(this, r, m).call(this);
    } catch (a) {
      this._error = a instanceof Error ? a.message : String(a);
    } finally {
      this._sending = !1;
    }
  }
};
N = function(e) {
  var a;
  const t = ((a = this._selected) == null ? void 0 : a.id) === e.id;
  return i`
      <button
        class="thread"
        aria-current=${t ? "true" : "false"}
        @click=${() => void s(this, r, y).call(this, e)}
      >
        <span class="thread-row">
          ${s(this, r, _).call(this, e)}
          <span class="thread-text">
            <span class="top">
              <span class="name">
                ${$(e.profileName, e.waId, e.contactName)}
              </span>
              <span class="when">${z(e.lastMessageUtc)}</span>
            </span>
            <span class="preview">${e.lastMessagePreview || "—"}</span>
          </span>
        </span>
        ${e.unreadCount > 0 ? i`<span class="unread">${e.unreadCount}</span>` : u}
      </button>
    `;
};
_ = function(e, t = !1) {
  const a = q(e.waId);
  return i`
      <span
        class=${t ? "avatar lg" : "avatar"}
        style="background: hsl(${a} 45% 45%)"
        aria-hidden="true"
      >${B(e.profileName, e.waId, e.contactName)}</span>
    `;
};
W = function(e) {
  const t = (e || "").toLowerCase();
  if (t === "failed") return i` · failed`;
  const a = t === "delivered" || t === "read", l = t === "read" ? "ticks read" : "ticks", o = i`
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 8.5 5.5 12 14 3.5" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  return i` ·
      <span class=${l} role="img" aria-label=${t || "sent"}>
        ${o}${a ? o : u}
      </span>
    `;
};
I = function(e) {
  const t = e.status === "failed", a = `bubble ${e.inbound ? "in" : "out"}${t ? " failed" : ""}`;
  return i`
      <div class=${a}>
        <span class="body">${e.body || i`<em>[${e.messageType}]</em>`}</span>
        <span class="meta">
          ${z(e.timestampUtc)}
          ${e.inbound ? u : s(this, r, W).call(this, e.status)}
          ${e.templateName ? i` · template: ${e.templateName}` : u}
          ${e.errorMessage ? i` · ${e.errorMessage}` : u}
        </span>
      </div>
    `;
};
M = function(e) {
  let t = "";
  return e.map((a) => {
    const l = new Date(
      /[Zz]|[+-]\d{2}:?\d{2}$/.test(a.timestampUtc) ? a.timestampUtc : `${a.timestampUtc}Z`
    ), o = Number.isNaN(l.getTime()) ? "" : l.toDateString(), f = o !== "" && o !== t;
    return f && (t = o), i`
        ${f ? i`<span class="day-sep">
              ${l.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
            </span>` : u}
        ${s(this, r, I).call(this, a)}
      `;
  });
};
E = function(e) {
  return e.windowOpen ? i`
      <div class="reply">
        <div class="reply-row">
          <uui-textarea
            label="Reply"
            placeholder="Write a reply…"
            .value=${this._draft}
            ?disabled=${this._sending}
            @input=${(t) => {
    this._draft = t.target.value;
  }}
          ></uui-textarea>
          <uui-button
            look="primary"
            color="positive"
            label="Send reply"
            ?disabled=${this._sending || !this._draft.trim()}
            @click=${() => void s(this, r, S).call(this)}
          >${this._sending ? "Sending…" : "Send"}</uui-button>
        </div>
        <p class="hint">${T(e.windowMinutesRemaining)} in this window.</p>
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
A = function() {
  const e = this._selected;
  return e ? i`
      <div class="pane">
        <div class="pane-head">
          <div class="head-id">
            ${s(this, r, _).call(this, e, !0)}
            <div>
              <div class="head-name">
                ${$(e.profileName, e.waId, e.contactName)}
              </div>
              <div class="head-number">${j(e.waId)}</div>
            </div>
          </div>
          <span class="window-pill ${e.windowOpen ? "open" : "closed"}">
            ${e.windowOpen ? T(e.windowMinutesRemaining) : "window closed"}
          </span>
        </div>

        <div class="transcript">
          ${this._loadingThread ? i`<uui-loader></uui-loader>` : this._messages.length === 0 ? i`<div class="empty">No messages in this conversation yet.</div>` : s(this, r, M).call(this, this._messages)}
        </div>

        ${s(this, r, E).call(this, e)}
      </div>
    ` : i`
        <div class="pane">
          <div class="empty">Select a conversation on the left to read it.</div>
        </div>
      `;
};
n.styles = [
  U,
  D`
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
c([
  h()
], n.prototype, "_conversations", 2);
c([
  h()
], n.prototype, "_selected", 2);
c([
  h()
], n.prototype, "_messages", 2);
c([
  h()
], n.prototype, "_draft", 2);
c([
  h()
], n.prototype, "_error", 2);
c([
  h()
], n.prototype, "_loadingList", 2);
c([
  h()
], n.prototype, "_loadingThread", 2);
c([
  h()
], n.prototype, "_sending", 2);
n = c([
  O("wa-inbox")
], n);
const J = n;
export {
  n as WaInboxElement,
  J as default
};
//# sourceMappingURL=wa-inbox.element.js.map

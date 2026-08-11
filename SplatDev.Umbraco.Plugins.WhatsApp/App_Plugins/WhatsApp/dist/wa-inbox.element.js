import { LitElement as E, nothing as f, html as r, css as U, state as p, customElement as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as P } from "@umbraco-cms/backoffice/element-api";
import { W as R, s as q } from "./chunks/shared-styles-QWL_Oc-v.js";
function k(e) {
  if (e <= 0) return "closed";
  const i = Math.floor(e / 60), a = e % 60;
  return i > 0 ? `${i}h ${a}m left` : `${a}m left`;
}
function z(e) {
  const i = (e ?? "").replace(/\D/g, "");
  if (!i) return "";
  const a = [
    // Brazil: 2-digit area code, then 9-digit mobile (99999-9999) or 8-digit landline.
    ["55", (t) => t.length === 11 ? `(${t.slice(0, 2)}) ${t.slice(2, 7)}-${t.slice(7)}` : t.length === 10 ? `(${t.slice(0, 2)}) ${t.slice(2, 6)}-${t.slice(6)}` : null],
    // NANP: (NPA) NXX-XXXX
    ["1", (t) => t.length === 10 ? `(${t.slice(0, 3)}) ${t.slice(3, 6)}-${t.slice(6)}` : null],
    // UK: 4-3-4 / 4-6 are the common readable groupings.
    ["44", (t) => t.length === 10 ? `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : t.length === 9 ? `${t.slice(0, 4)} ${t.slice(4)}` : null],
    // Portugal / Spain / France / Germany / Italy: 3-3-3 style groups read well.
    ["351", (t) => t.length === 9 ? `${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6)}` : null],
    ["34", (t) => t.length === 9 ? `${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6)}` : null],
    ["33", (t) => t.length === 9 ? `${t.slice(0, 1)} ${t.slice(1, 3)} ${t.slice(3, 5)} ${t.slice(5, 7)} ${t.slice(7)}` : null],
    ["49", (t) => t.length >= 10 ? `${t.slice(0, 3)} ${t.slice(3)}` : null],
    ["39", (t) => t.length >= 9 ? `${t.slice(0, 3)} ${t.slice(3)}` : null]
  ];
  for (const [t, s] of a) {
    if (!i.startsWith(t)) continue;
    const l = i.slice(t.length), g = s(l);
    if (g) return `+${t} ${g}`;
  }
  return `+${i}`;
}
function T(e, i) {
  return (e ?? "").trim() || z(i);
}
function B(e, i) {
  const a = (e ?? "").trim().split(/\s+/).filter(Boolean);
  if (a.length >= 2) return (a[0][0] + a[a.length - 1][0]).toUpperCase();
  if (a.length === 1) return a[0].slice(0, 2).toUpperCase();
  const t = (i ?? "").replace(/\D/g, "");
  return t ? t.slice(-2) : "?";
}
function Z(e) {
  const i = e ?? "";
  let a = 0;
  for (let t = 0; t < i.length; t++) a = a * 31 + i.charCodeAt(t) | 0;
  return Math.abs(a) % 360;
}
function C(e) {
  if (!e) return "";
  const i = /[Zz]|[+-]\d{2}:?\d{2}$/.test(e) ? e : `${e}Z`, a = new Date(i);
  if (Number.isNaN(a.getTime())) return "";
  const t = a.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), s = /* @__PURE__ */ new Date();
  s.setHours(0, 0, 0, 0);
  const l = Math.floor((s.getTime() - a.getTime()) / 864e5);
  return l < 0 ? t : l < 1 ? `Yesterday ${t}` : l < 7 ? `${a.toLocaleDateString([], { weekday: "short" })} ${t}` : a.toLocaleDateString([], { day: "2-digit", month: "short" });
}
var j = Object.defineProperty, H = Object.getOwnPropertyDescriptor, S = (e) => {
  throw TypeError(e);
}, h = (e, i, a, t) => {
  for (var s = t > 1 ? void 0 : t ? H(i, a) : i, l = e.length - 1, g; l >= 0; l--)
    (g = e[l]) && (s = (t ? g(i, a, s) : g(s)) || s);
  return t && s && j(i, a, s), s;
}, x = (e, i, a) => i.has(e) || S("Cannot " + a), c = (e, i, a) => (x(e, i, "read from private field"), a ? a.call(e) : i.get(e)), w = (e, i, a) => i.has(e) ? S("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(e) : i.set(e, a), $ = (e, i, a, t) => (x(e, i, "write to private field"), i.set(e, a), a), n = (e, i, a) => (x(e, i, "access private method"), a), u, v, m, o, b, y, W, M, _, N, I, D, L, A;
let d = class extends P(E) {
  constructor() {
    super(...arguments), w(this, o), w(this, u, new R(this)), this._conversations = [], this._messages = [], this._draft = "", this._error = "", this._loadingList = !0, this._loadingThread = !1, this._sending = !1, w(this, v), w(this, m);
  }
  connectedCallback() {
    super.connectedCallback(), n(this, o, b).call(this), c(this, u).heartbeat(), $(this, v, window.setInterval(() => void c(this, u).heartbeat(), 6e4)), $(this, m, window.setInterval(() => {
      document.visibilityState === "visible" && n(this, o, b).call(this, { quiet: !0 });
    }, 2e4));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), c(this, v) && window.clearInterval(c(this, v)), c(this, m) && window.clearInterval(c(this, m));
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
          @click=${() => void n(this, o, b).call(this)}
        >Refresh</uui-button>
      </div>

      <div class="layout">
        <div class="list">
          ${this._loadingList ? r`<uui-loader></uui-loader>` : this._conversations.length === 0 ? r`<div class="empty">
                  No conversations yet. They appear here once the webhook is registered
                  and someone messages your number.
                </div>` : this._conversations.map((e) => n(this, o, M).call(this, e))}
        </div>
        ${n(this, o, A).call(this)}
      </div>
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
b = async function(e = {}) {
  e.quiet || (this._loadingList = !0, this._error = "");
  try {
    if (this._conversations = await c(this, u).getConversations(), this._selected) {
      const i = this._conversations.find((a) => a.id === this._selected.id);
      i && (this._selected = i);
    }
  } catch (i) {
    e.quiet || (this._error = i instanceof Error ? i.message : String(i));
  } finally {
    e.quiet || (this._loadingList = !1);
  }
};
y = async function(e) {
  this._selected = e, this._loadingThread = !0, this._error = "", this._messages = [];
  try {
    const i = await c(this, u).getThread(e.id);
    this._messages = i.messages, this._selected = i.conversation, e.unreadCount > 0 && (await c(this, u).markRead(e.id), this._conversations = this._conversations.map(
      (a) => a.id === e.id ? { ...a, unreadCount: 0 } : a
    ));
  } catch (i) {
    this._error = i instanceof Error ? i.message : String(i);
  } finally {
    this._loadingThread = !1;
  }
};
W = async function() {
  const e = this._selected, i = this._draft.trim();
  if (!(!e || !i || this._sending)) {
    this._sending = !0, this._error = "";
    try {
      await c(this, u).sendText(e.waId, i), this._draft = "", await n(this, o, y).call(this, e), await n(this, o, b).call(this);
    } catch (a) {
      this._error = a instanceof Error ? a.message : String(a);
    } finally {
      this._sending = !1;
    }
  }
};
M = function(e) {
  var a;
  const i = ((a = this._selected) == null ? void 0 : a.id) === e.id;
  return r`
      <button
        class="thread"
        aria-current=${i ? "true" : "false"}
        @click=${() => void n(this, o, y).call(this, e)}
      >
        <span class="thread-row">
          ${n(this, o, _).call(this, e)}
          <span class="thread-text">
            <span class="top">
              <span class="name">
                ${T(e.profileName, e.waId)}
              </span>
              <span class="when">${C(e.lastMessageUtc)}</span>
            </span>
            <span class="preview">${e.lastMessagePreview || "—"}</span>
          </span>
        </span>
        ${e.unreadCount > 0 ? r`<span class="unread">${e.unreadCount}</span>` : f}
      </button>
    `;
};
_ = function(e, i = !1) {
  const a = Z(e.waId);
  return r`
      <span
        class=${i ? "avatar lg" : "avatar"}
        style="background: hsl(${a} 45% 45%)"
        aria-hidden="true"
      >${B(e.profileName, e.waId)}</span>
    `;
};
N = function(e) {
  const i = (e || "").toLowerCase();
  if (i === "failed") return r` · failed`;
  const a = i === "delivered" || i === "read", t = i === "read" ? "ticks read" : "ticks", s = r`
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 8.5 5.5 12 14 3.5" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  return r` ·
      <span class=${t} role="img" aria-label=${i || "sent"}>
        ${s}${a ? s : f}
      </span>
    `;
};
I = function(e) {
  const i = e.status === "failed", a = `bubble ${e.inbound ? "in" : "out"}${i ? " failed" : ""}`;
  return r`
      <div class=${a}>
        <span class="body">${e.body || r`<em>[${e.messageType}]</em>`}</span>
        <span class="meta">
          ${C(e.timestampUtc)}
          ${e.inbound ? f : n(this, o, N).call(this, e.status)}
          ${e.templateName ? r` · template: ${e.templateName}` : f}
          ${e.errorMessage ? r` · ${e.errorMessage}` : f}
        </span>
      </div>
    `;
};
D = function(e) {
  let i = "";
  return e.map((a) => {
    const t = new Date(
      /[Zz]|[+-]\d{2}:?\d{2}$/.test(a.timestampUtc) ? a.timestampUtc : `${a.timestampUtc}Z`
    ), s = Number.isNaN(t.getTime()) ? "" : t.toDateString(), l = s !== "" && s !== i;
    return l && (i = s), r`
        ${l ? r`<span class="day-sep">
              ${t.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
            </span>` : f}
        ${n(this, o, I).call(this, a)}
      `;
  });
};
L = function(e) {
  return e.windowOpen ? r`
      <div class="reply">
        <div class="reply-row">
          <uui-textarea
            label="Reply"
            placeholder="Write a reply…"
            .value=${this._draft}
            ?disabled=${this._sending}
            @input=${(i) => {
    this._draft = i.target.value;
  }}
          ></uui-textarea>
          <uui-button
            look="primary"
            color="positive"
            label="Send reply"
            ?disabled=${this._sending || !this._draft.trim()}
            @click=${() => void n(this, o, W).call(this)}
          >${this._sending ? "Sending…" : "Send"}</uui-button>
        </div>
        <p class="hint">${k(e.windowMinutesRemaining)} in this window.</p>
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
A = function() {
  const e = this._selected;
  return e ? r`
      <div class="pane">
        <div class="pane-head">
          <div class="head-id">
            ${n(this, o, _).call(this, e, !0)}
            <div>
              <div class="head-name">
                ${T(e.profileName, e.waId)}
              </div>
              <div class="head-number">${z(e.waId)}</div>
            </div>
          </div>
          <span class="window-pill ${e.windowOpen ? "open" : "closed"}">
            ${e.windowOpen ? k(e.windowMinutesRemaining) : "window closed"}
          </span>
        </div>

        <div class="transcript">
          ${this._loadingThread ? r`<uui-loader></uui-loader>` : this._messages.length === 0 ? r`<div class="empty">No messages in this conversation yet.</div>` : n(this, o, D).call(this, this._messages)}
        </div>

        ${n(this, o, L).call(this, e)}
      </div>
    ` : r`
        <div class="pane">
          <div class="empty">Select a conversation on the left to read it.</div>
        </div>
      `;
};
d.styles = [
  q,
  U`
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
h([
  p()
], d.prototype, "_conversations", 2);
h([
  p()
], d.prototype, "_selected", 2);
h([
  p()
], d.prototype, "_messages", 2);
h([
  p()
], d.prototype, "_draft", 2);
h([
  p()
], d.prototype, "_error", 2);
h([
  p()
], d.prototype, "_loadingList", 2);
h([
  p()
], d.prototype, "_loadingThread", 2);
h([
  p()
], d.prototype, "_sending", 2);
d = h([
  O("wa-inbox")
], d);
const K = d;
export {
  d as WaInboxElement,
  K as default
};
//# sourceMappingURL=wa-inbox.element.js.map

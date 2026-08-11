import { LitElement as j, nothing as g, html as a, css as q, state as f, customElement as B } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as Z } from "@umbraco-cms/backoffice/element-api";
import { W as H, s as Y } from "./chunks/shared-styles-QWL_Oc-v.js";
function z(e) {
  if (e <= 0) return "closed";
  const t = Math.floor(e / 60), r = e % 60;
  return t > 0 ? `${t}h ${r}m left` : `${r}m left`;
}
function S(e) {
  const t = (e ?? "").replace(/\D/g, "");
  if (!t) return "";
  for (const r of F) {
    if (!t.startsWith(r)) continue;
    const i = G(r, t.slice(r.length));
    if (i) return `+${r} ${i}`;
  }
  return `+${t}`;
}
const C = {
  // North America — NANP covers US, Canada, and the Caribbean (DR, PR, Jamaica...)
  1: { 10: { groups: [3, 3, 4], parens: !0 } },
  // Mexico. 10 digits national; CDMX/GDL/MTY use a 2-digit area code, the rest 3.
  // An 11-digit value is the legacy "1" mobile prefix WhatsApp used to include.
  52: {
    10: { groups: [3, 3, 4] },
    11: { groups: [3, 3, 4], mobilePrefix: "1" }
  },
  // Brazil — 2-digit area code, 9-digit mobile or 8-digit landline.
  55: {
    11: { groups: [2, 5, 4], parens: !0 },
    10: { groups: [2, 4, 4], parens: !0 }
  },
  // Argentina — mobiles carry a leading 9 that is written separately.
  54: {
    11: { groups: [2, 4, 4], hyphenTail: !0, mobilePrefix: "9" },
    10: { groups: [2, 4, 4], hyphenTail: !0 }
  },
  // Rest of South America
  56: { 9: { groups: [1, 4, 4] } },
  // Chile
  57: { 10: { groups: [3, 3, 4] } },
  // Colombia
  58: { 10: { groups: [3, 3, 4] } },
  // Venezuela
  51: { 9: { groups: [3, 3, 3] } },
  // Peru
  593: { 9: { groups: [2, 3, 4] } },
  // Ecuador
  591: { 8: { groups: [4, 4] } },
  // Bolivia
  595: { 9: { groups: [3, 3, 3] } },
  // Paraguay
  598: { 8: { groups: [4, 4] } },
  // Uruguay
  592: { 7: { groups: [3, 4] } },
  // Guyana
  597: { 7: { groups: [3, 4] } },
  // Suriname
  // Central America
  502: { 8: { groups: [4, 4] } },
  // Guatemala
  503: { 8: { groups: [4, 4] } },
  // El Salvador
  504: { 8: { groups: [4, 4] } },
  // Honduras
  505: { 8: { groups: [4, 4] } },
  // Nicaragua
  506: { 8: { groups: [4, 4] } },
  // Costa Rica
  507: { 8: { groups: [4, 4] } },
  // Panama
  509: { 8: { groups: [4, 4] } },
  // Haiti
  // Europe — where the studio already has contacts
  44: { 10: { groups: [4, 3, 3] }, 9: { groups: [4, 5] } },
  // UK
  351: { 9: { groups: [3, 3, 3] } },
  // Portugal
  34: { 9: { groups: [3, 3, 3] } },
  // Spain
  33: { 9: { groups: [1, 2, 2, 2, 2] } },
  // France
  49: { 11: { groups: [4, 7] }, 10: { groups: [3, 7] } },
  // Germany
  39: { 10: { groups: [3, 3, 4] } }
  // Italy
}, F = Object.keys(C).sort((e, t) => t.length - e.length);
function G(e, t) {
  const r = C[e];
  if (!r) return null;
  let i = t, s = "";
  const o = r[i.length];
  if (!o) return null;
  o.mobilePrefix && i.startsWith(o.mobilePrefix) && (s = `${o.mobilePrefix} `, i = i.slice(o.mobilePrefix.length));
  const p = [];
  let m = 0;
  for (const v of o.groups) {
    if (m >= i.length) break;
    p.push(i.slice(m, m + v)), m += v;
  }
  if (m < i.length && p.push(i.slice(m)), p.length > 1 && (o.parens || o.hyphenTail)) {
    const [v, ...O] = p, R = o.parens ? `(${v})` : v;
    return `${s}${R} ${O.join("-")}`;
  }
  return s + p.join(" ");
}
function N(e, t) {
  return (e ?? "").trim() || S(t);
}
function K(e, t) {
  const r = (e ?? "").trim().split(/\s+/).filter(Boolean);
  if (r.length >= 2) return (r[0][0] + r[r.length - 1][0]).toUpperCase();
  if (r.length === 1) return r[0].slice(0, 2).toUpperCase();
  const i = (t ?? "").replace(/\D/g, "");
  return i ? i.slice(-2) : "?";
}
function J(e) {
  const t = e ?? "";
  let r = 0;
  for (let i = 0; i < t.length; i++) r = r * 31 + t.charCodeAt(i) | 0;
  return Math.abs(r) % 360;
}
function W(e) {
  if (!e) return "";
  const t = /[Zz]|[+-]\d{2}:?\d{2}$/.test(e) ? e : `${e}Z`, r = new Date(t);
  if (Number.isNaN(r.getTime())) return "";
  const i = r.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), s = /* @__PURE__ */ new Date();
  s.setHours(0, 0, 0, 0);
  const o = Math.floor((s.getTime() - r.getTime()) / 864e5);
  return o < 0 ? i : o < 1 ? `Yesterday ${i}` : o < 7 ? `${r.toLocaleDateString([], { weekday: "short" })} ${i}` : r.toLocaleDateString([], { day: "2-digit", month: "short" });
}
var Q = Object.defineProperty, V = Object.getOwnPropertyDescriptor, M = (e) => {
  throw TypeError(e);
}, u = (e, t, r, i) => {
  for (var s = i > 1 ? void 0 : i ? V(t, r) : t, o = e.length - 1, p; o >= 0; o--)
    (p = e[o]) && (s = (i ? p(t, r, s) : p(s)) || s);
  return i && s && Q(t, r, s), s;
}, _ = (e, t, r) => t.has(e) || M("Cannot " + r), c = (e, t, r) => (_(e, t, "read from private field"), r ? r.call(e) : t.get(e)), y = (e, t, r) => t.has(e) ? M("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), T = (e, t, r, i) => (_(e, t, "write to private field"), t.set(e, r), r), l = (e, t, r) => (_(e, t, "access private method"), r), h, b, w, n, x, $, D, I, k, L, E, P, A, U;
let d = class extends Z(j) {
  constructor() {
    super(...arguments), y(this, n), y(this, h, new H(this)), this._conversations = [], this._messages = [], this._draft = "", this._error = "", this._loadingList = !0, this._loadingThread = !1, this._sending = !1, y(this, b), y(this, w);
  }
  connectedCallback() {
    super.connectedCallback(), l(this, n, x).call(this), c(this, h).heartbeat(), T(this, b, window.setInterval(() => void c(this, h).heartbeat(), 6e4)), T(this, w, window.setInterval(() => {
      document.visibilityState === "visible" && l(this, n, x).call(this, { quiet: !0 });
    }, 2e4));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), c(this, b) && window.clearInterval(c(this, b)), c(this, w) && window.clearInterval(c(this, w));
  }
  render() {
    return a`
      <div class="head">
        <h1>Inbox</h1>
        <p>Conversations with your WhatsApp Business number.</p>
      </div>

      ${this._error ? a`<div class="error">${this._error}</div>` : g}

      <div class="row" style="margin-bottom:12px">
        <uui-button
          look="secondary"
          label="Refresh conversations"
          ?disabled=${this._loadingList}
          @click=${() => void l(this, n, x).call(this)}
        >Refresh</uui-button>
      </div>

      <div class="layout">
        <div class="list">
          ${this._loadingList ? a`<uui-loader></uui-loader>` : this._conversations.length === 0 ? a`<div class="empty">
                  No conversations yet. They appear here once the webhook is registered
                  and someone messages your number.
                </div>` : this._conversations.map((e) => l(this, n, I).call(this, e))}
        </div>
        ${l(this, n, U).call(this)}
      </div>
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakSet();
x = async function(e = {}) {
  e.quiet || (this._loadingList = !0, this._error = "");
  try {
    if (this._conversations = await c(this, h).getConversations(), this._selected) {
      const t = this._conversations.find((r) => r.id === this._selected.id);
      t && (this._selected = t);
    }
  } catch (t) {
    e.quiet || (this._error = t instanceof Error ? t.message : String(t));
  } finally {
    e.quiet || (this._loadingList = !1);
  }
};
$ = async function(e) {
  this._selected = e, this._loadingThread = !0, this._error = "", this._messages = [];
  try {
    const t = await c(this, h).getThread(e.id);
    this._messages = t.messages, this._selected = t.conversation, e.unreadCount > 0 && (await c(this, h).markRead(e.id), this._conversations = this._conversations.map(
      (r) => r.id === e.id ? { ...r, unreadCount: 0 } : r
    ));
  } catch (t) {
    this._error = t instanceof Error ? t.message : String(t);
  } finally {
    this._loadingThread = !1;
  }
};
D = async function() {
  const e = this._selected, t = this._draft.trim();
  if (!(!e || !t || this._sending)) {
    this._sending = !0, this._error = "";
    try {
      await c(this, h).sendText(e.waId, t), this._draft = "", await l(this, n, $).call(this, e), await l(this, n, x).call(this);
    } catch (r) {
      this._error = r instanceof Error ? r.message : String(r);
    } finally {
      this._sending = !1;
    }
  }
};
I = function(e) {
  var r;
  const t = ((r = this._selected) == null ? void 0 : r.id) === e.id;
  return a`
      <button
        class="thread"
        aria-current=${t ? "true" : "false"}
        @click=${() => void l(this, n, $).call(this, e)}
      >
        <span class="thread-row">
          ${l(this, n, k).call(this, e)}
          <span class="thread-text">
            <span class="top">
              <span class="name">
                ${N(e.profileName, e.waId)}
              </span>
              <span class="when">${W(e.lastMessageUtc)}</span>
            </span>
            <span class="preview">${e.lastMessagePreview || "—"}</span>
          </span>
        </span>
        ${e.unreadCount > 0 ? a`<span class="unread">${e.unreadCount}</span>` : g}
      </button>
    `;
};
k = function(e, t = !1) {
  const r = J(e.waId);
  return a`
      <span
        class=${t ? "avatar lg" : "avatar"}
        style="background: hsl(${r} 45% 45%)"
        aria-hidden="true"
      >${K(e.profileName, e.waId)}</span>
    `;
};
L = function(e) {
  const t = (e || "").toLowerCase();
  if (t === "failed") return a` · failed`;
  const r = t === "delivered" || t === "read", i = t === "read" ? "ticks read" : "ticks", s = a`
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 8.5 5.5 12 14 3.5" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  return a` ·
      <span class=${i} role="img" aria-label=${t || "sent"}>
        ${s}${r ? s : g}
      </span>
    `;
};
E = function(e) {
  const t = e.status === "failed", r = `bubble ${e.inbound ? "in" : "out"}${t ? " failed" : ""}`;
  return a`
      <div class=${r}>
        <span class="body">${e.body || a`<em>[${e.messageType}]</em>`}</span>
        <span class="meta">
          ${W(e.timestampUtc)}
          ${e.inbound ? g : l(this, n, L).call(this, e.status)}
          ${e.templateName ? a` · template: ${e.templateName}` : g}
          ${e.errorMessage ? a` · ${e.errorMessage}` : g}
        </span>
      </div>
    `;
};
P = function(e) {
  let t = "";
  return e.map((r) => {
    const i = new Date(
      /[Zz]|[+-]\d{2}:?\d{2}$/.test(r.timestampUtc) ? r.timestampUtc : `${r.timestampUtc}Z`
    ), s = Number.isNaN(i.getTime()) ? "" : i.toDateString(), o = s !== "" && s !== t;
    return o && (t = s), a`
        ${o ? a`<span class="day-sep">
              ${i.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
            </span>` : g}
        ${l(this, n, E).call(this, r)}
      `;
  });
};
A = function(e) {
  return e.windowOpen ? a`
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
            @click=${() => void l(this, n, D).call(this)}
          >${this._sending ? "Sending…" : "Send"}</uui-button>
        </div>
        <p class="hint">${z(e.windowMinutesRemaining)} in this window.</p>
      </div>
    ` : a`
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
U = function() {
  const e = this._selected;
  return e ? a`
      <div class="pane">
        <div class="pane-head">
          <div class="head-id">
            ${l(this, n, k).call(this, e, !0)}
            <div>
              <div class="head-name">
                ${N(e.profileName, e.waId)}
              </div>
              <div class="head-number">${S(e.waId)}</div>
            </div>
          </div>
          <span class="window-pill ${e.windowOpen ? "open" : "closed"}">
            ${e.windowOpen ? z(e.windowMinutesRemaining) : "window closed"}
          </span>
        </div>

        <div class="transcript">
          ${this._loadingThread ? a`<uui-loader></uui-loader>` : this._messages.length === 0 ? a`<div class="empty">No messages in this conversation yet.</div>` : l(this, n, P).call(this, this._messages)}
        </div>

        ${l(this, n, A).call(this, e)}
      </div>
    ` : a`
        <div class="pane">
          <div class="empty">Select a conversation on the left to read it.</div>
        </div>
      `;
};
d.styles = [
  Y,
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
u([
  f()
], d.prototype, "_conversations", 2);
u([
  f()
], d.prototype, "_selected", 2);
u([
  f()
], d.prototype, "_messages", 2);
u([
  f()
], d.prototype, "_draft", 2);
u([
  f()
], d.prototype, "_error", 2);
u([
  f()
], d.prototype, "_loadingList", 2);
u([
  f()
], d.prototype, "_loadingThread", 2);
u([
  f()
], d.prototype, "_sending", 2);
d = u([
  B("wa-inbox")
], d);
const re = d;
export {
  d as WaInboxElement,
  re as default
};
//# sourceMappingURL=wa-inbox.element.js.map

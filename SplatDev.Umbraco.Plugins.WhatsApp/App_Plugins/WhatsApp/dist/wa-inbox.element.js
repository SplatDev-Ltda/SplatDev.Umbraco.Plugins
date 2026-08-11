import { LitElement as N, nothing as v, html as a, css as L, state as c, customElement as A } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as I } from "@umbraco-cms/backoffice/element-api";
import { W as O, s as R } from "./chunks/shared-styles-QWL_Oc-v.js";
function k(e) {
  if (e <= 0) return "closed";
  const t = Math.floor(e / 60), i = e % 60;
  return t > 0 ? `${t}h ${i}m left` : `${i}m left`;
}
function z(e) {
  if (!e) return "";
  const t = /[Zz]|[+-]\d{2}:?\d{2}$/.test(e) ? e : `${e}Z`, i = new Date(t);
  return Number.isNaN(i.getTime()) ? "" : i.toLocaleString();
}
function x(e) {
  return e != null && e.startsWith("+") ? e : `+${e ?? ""}`;
}
var P = Object.defineProperty, q = Object.getOwnPropertyDescriptor, W = (e) => {
  throw TypeError(e);
}, l = (e, t, i, u) => {
  for (var p = u > 1 ? void 0 : u ? q(t, i) : t, w = e.length - 1, g; w >= 0; w--)
    (g = e[w]) && (p = (u ? g(t, i, p) : g(p)) || p);
  return u && p && P(t, i, p), p;
}, _ = (e, t, i) => t.has(e) || W("Cannot " + i), n = (e, t, i) => (_(e, t, "read from private field"), i ? i.call(e) : t.get(e)), m = (e, t, i) => t.has(e) ? W("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), $ = (e, t, i, u) => (_(e, t, "write to private field"), t.set(e, i), i), o = (e, t, i) => (_(e, t, "access private method"), i), d, h, f, r, b, y, C, S, T, M, E;
let s = class extends I(N) {
  constructor() {
    super(...arguments), m(this, r), m(this, d, new O(this)), this._conversations = [], this._messages = [], this._draft = "", this._error = "", this._loadingList = !0, this._loadingThread = !1, this._sending = !1, m(this, h), m(this, f);
  }
  connectedCallback() {
    super.connectedCallback(), o(this, r, b).call(this), n(this, d).heartbeat(), $(this, h, window.setInterval(() => void n(this, d).heartbeat(), 6e4)), $(this, f, window.setInterval(() => {
      document.visibilityState === "visible" && o(this, r, b).call(this, { quiet: !0 });
    }, 2e4));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), n(this, h) && window.clearInterval(n(this, h)), n(this, f) && window.clearInterval(n(this, f));
  }
  render() {
    return a`
      <div class="head">
        <h1>Inbox</h1>
        <p>Conversations with your WhatsApp Business number.</p>
      </div>

      ${this._error ? a`<div class="error">${this._error}</div>` : v}

      <div class="row" style="margin-bottom:12px">
        <uui-button
          look="secondary"
          label="Refresh conversations"
          ?disabled=${this._loadingList}
          @click=${() => void o(this, r, b).call(this)}
        >Refresh</uui-button>
      </div>

      <div class="layout">
        <div class="list">
          ${this._loadingList ? a`<uui-loader></uui-loader>` : this._conversations.length === 0 ? a`<div class="empty">
                  No conversations yet. They appear here once the webhook is registered
                  and someone messages your number.
                </div>` : this._conversations.map((e) => o(this, r, S).call(this, e))}
        </div>
        ${o(this, r, E).call(this)}
      </div>
    `;
  }
};
d = /* @__PURE__ */ new WeakMap();
h = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
b = async function(e = {}) {
  e.quiet || (this._loadingList = !0, this._error = "");
  try {
    if (this._conversations = await n(this, d).getConversations(), this._selected) {
      const t = this._conversations.find((i) => i.id === this._selected.id);
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
    const t = await n(this, d).getThread(e.id);
    this._messages = t.messages, this._selected = t.conversation, e.unreadCount > 0 && (await n(this, d).markRead(e.id), this._conversations = this._conversations.map(
      (i) => i.id === e.id ? { ...i, unreadCount: 0 } : i
    ));
  } catch (t) {
    this._error = t instanceof Error ? t.message : String(t);
  } finally {
    this._loadingThread = !1;
  }
};
C = async function() {
  const e = this._selected, t = this._draft.trim();
  if (!(!e || !t || this._sending)) {
    this._sending = !0, this._error = "";
    try {
      await n(this, d).sendText(e.waId, t), this._draft = "", await o(this, r, y).call(this, e), await o(this, r, b).call(this);
    } catch (i) {
      this._error = i instanceof Error ? i.message : String(i);
    } finally {
      this._sending = !1;
    }
  }
};
S = function(e) {
  var i;
  const t = ((i = this._selected) == null ? void 0 : i.id) === e.id;
  return a`
      <button
        class="thread"
        aria-current=${t ? "true" : "false"}
        @click=${() => void o(this, r, y).call(this, e)}
      >
        <span class="top">
          <span class="name">
            ${e.profileName || x(e.waId)}
          </span>
          <span class="when">${z(e.lastMessageUtc)}</span>
        </span>
        <span class="preview">${e.lastMessagePreview || "—"}</span>
        ${e.unreadCount > 0 ? a`<span class="unread">${e.unreadCount}</span>` : v}
      </button>
    `;
};
T = function(e) {
  const t = e.status === "failed", i = `bubble ${e.inbound ? "in" : "out"}${t ? " failed" : ""}`;
  return a`
      <div class=${i}>
        <span class="body">${e.body || a`<em>[${e.messageType}]</em>`}</span>
        <span class="meta">
          ${z(e.timestampUtc)}
          ${e.inbound ? v : a` · ${e.status}`}
          ${e.templateName ? a` · template: ${e.templateName}` : v}
          ${e.errorMessage ? a` · ${e.errorMessage}` : v}
        </span>
      </div>
    `;
};
M = function(e) {
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
            @click=${() => void o(this, r, C).call(this)}
          >${this._sending ? "Sending…" : "Send"}</uui-button>
        </div>
        <p class="hint">${k(e.windowMinutesRemaining)} in this window.</p>
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
E = function() {
  const e = this._selected;
  return e ? a`
      <div class="pane">
        <div class="pane-head">
          <div>
            <strong>${e.profileName || x(e.waId)}</strong>
            <div class="hint">${x(e.waId)}</div>
          </div>
          <span class="window-pill ${e.windowOpen ? "open" : "closed"}">
            ${e.windowOpen ? k(e.windowMinutesRemaining) : "window closed"}
          </span>
        </div>

        <div class="transcript">
          ${this._loadingThread ? a`<uui-loader></uui-loader>` : this._messages.length === 0 ? a`<div class="empty">No messages yet.</div>` : this._messages.map((t) => o(this, r, T).call(this, t))}
        </div>

        ${o(this, r, M).call(this, e)}
      </div>
    ` : a`
        <div class="pane">
          <div class="empty">Select a conversation to read it.</div>
        </div>
      `;
};
s.styles = [
  R,
  L`
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
l([
  c()
], s.prototype, "_conversations", 2);
l([
  c()
], s.prototype, "_selected", 2);
l([
  c()
], s.prototype, "_messages", 2);
l([
  c()
], s.prototype, "_draft", 2);
l([
  c()
], s.prototype, "_error", 2);
l([
  c()
], s.prototype, "_loadingList", 2);
l([
  c()
], s.prototype, "_loadingThread", 2);
l([
  c()
], s.prototype, "_sending", 2);
s = l([
  A("wa-inbox")
], s);
const Z = s;
export {
  s as WaInboxElement,
  Z as default
};
//# sourceMappingURL=wa-inbox.element.js.map

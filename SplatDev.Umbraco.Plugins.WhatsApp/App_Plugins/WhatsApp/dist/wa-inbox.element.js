import { LitElement as S, nothing as p, html as i, css as E, state as l, customElement as M } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as N } from "@umbraco-cms/backoffice/element-api";
import { W as L, s as O } from "./chunks/shared-styles-NOSfU0-v.js";
function w(e) {
  if (e <= 0) return "closed";
  const t = Math.floor(e / 60), r = e % 60;
  return t > 0 ? `${t}h ${r}m left` : `${r}m left`;
}
function x(e) {
  if (!e) return "";
  const t = /[Zz]|[+-]\d{2}:?\d{2}$/.test(e) ? e : `${e}Z`, r = new Date(t);
  return Number.isNaN(r.getTime()) ? "" : r.toLocaleString();
}
function m(e) {
  return e != null && e.startsWith("+") ? e : `+${e ?? ""}`;
}
var R = Object.defineProperty, A = Object.getOwnPropertyDescriptor, y = (e) => {
  throw TypeError(e);
}, n = (e, t, r, u) => {
  for (var d = u > 1 ? void 0 : u ? A(t, r) : t, v = e.length - 1, g; v >= 0; v--)
    (g = e[v]) && (d = (u ? g(t, r, d) : g(d)) || d);
  return u && d && R(t, r, d), d;
}, $ = (e, t, r) => t.has(e) || y("Cannot " + r), h = (e, t, r) => ($(e, t, "read from private field"), r ? r.call(e) : t.get(e)), _ = (e, t, r) => t.has(e) ? y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), o = (e, t, r) => ($(e, t, "access private method"), r), c, a, f, b, k, z, W, T, C;
let s = class extends N(S) {
  constructor() {
    super(...arguments), _(this, a), _(this, c, new L(this)), this._conversations = [], this._messages = [], this._draft = "", this._error = "", this._loadingList = !0, this._loadingThread = !1, this._sending = !1;
  }
  connectedCallback() {
    super.connectedCallback(), o(this, a, f).call(this);
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
          @click=${() => void o(this, a, f).call(this)}
        >Refresh</uui-button>
      </div>

      <div class="layout">
        <div class="list">
          ${this._loadingList ? i`<uui-loader></uui-loader>` : this._conversations.length === 0 ? i`<div class="empty">
                  No conversations yet. They appear here once the webhook is registered
                  and someone messages your number.
                </div>` : this._conversations.map((e) => o(this, a, z).call(this, e))}
        </div>
        ${o(this, a, C).call(this)}
      </div>
    `;
  }
};
c = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
f = async function() {
  this._loadingList = !0, this._error = "";
  try {
    if (this._conversations = await h(this, c).getConversations(), this._selected) {
      const e = this._conversations.find((t) => t.id === this._selected.id);
      e && (this._selected = e);
    }
  } catch (e) {
    this._error = e instanceof Error ? e.message : String(e);
  } finally {
    this._loadingList = !1;
  }
};
b = async function(e) {
  this._selected = e, this._loadingThread = !0, this._error = "", this._messages = [];
  try {
    const t = await h(this, c).getThread(e.id);
    this._messages = t.messages, this._selected = t.conversation, e.unreadCount > 0 && (await h(this, c).markRead(e.id), this._conversations = this._conversations.map(
      (r) => r.id === e.id ? { ...r, unreadCount: 0 } : r
    ));
  } catch (t) {
    this._error = t instanceof Error ? t.message : String(t);
  } finally {
    this._loadingThread = !1;
  }
};
k = async function() {
  const e = this._selected, t = this._draft.trim();
  if (!(!e || !t || this._sending)) {
    this._sending = !0, this._error = "";
    try {
      await h(this, c).sendText(e.waId, t), this._draft = "", await o(this, a, b).call(this, e), await o(this, a, f).call(this);
    } catch (r) {
      this._error = r instanceof Error ? r.message : String(r);
    } finally {
      this._sending = !1;
    }
  }
};
z = function(e) {
  var r;
  const t = ((r = this._selected) == null ? void 0 : r.id) === e.id;
  return i`
      <button
        class="thread"
        aria-current=${t ? "true" : "false"}
        @click=${() => void o(this, a, b).call(this, e)}
      >
        <span class="top">
          <span class="name">
            ${e.profileName || m(e.waId)}
          </span>
          <span class="when">${x(e.lastMessageUtc)}</span>
        </span>
        <span class="preview">${e.lastMessagePreview || "—"}</span>
        ${e.unreadCount > 0 ? i`<span class="unread">${e.unreadCount}</span>` : p}
      </button>
    `;
};
W = function(e) {
  const t = e.status === "failed", r = `bubble ${e.inbound ? "in" : "out"}${t ? " failed" : ""}`;
  return i`
      <div class=${r}>
        ${e.body || i`<em>[${e.messageType}]</em>`}
        <span class="meta">
          ${x(e.timestampUtc)}
          ${e.inbound ? p : i` · ${e.status}`}
          ${e.templateName ? i` · template: ${e.templateName}` : p}
          ${e.errorMessage ? i` · ${e.errorMessage}` : p}
        </span>
      </div>
    `;
};
T = function(e) {
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
            @click=${() => void o(this, a, k).call(this)}
          >${this._sending ? "Sending…" : "Send"}</uui-button>
        </div>
        <p class="hint">${w(e.windowMinutesRemaining)} in this window.</p>
      </div>
    ` : i`
        <div class="reply">
          <div class="warn">
            The 24-hour customer-service window has closed, so WhatsApp will not deliver a
            free-form reply. Use the <strong>Send</strong> view to send an approved template
            instead — that reopens the window once they reply.
          </div>
        </div>
      `;
};
C = function() {
  const e = this._selected;
  return e ? i`
      <div class="pane">
        <div class="pane-head">
          <div>
            <strong>${e.profileName || m(e.waId)}</strong>
            <div class="hint">${m(e.waId)}</div>
          </div>
          <span class="window-pill ${e.windowOpen ? "open" : "closed"}">
            ${e.windowOpen ? w(e.windowMinutesRemaining) : "window closed"}
          </span>
        </div>

        <div class="transcript">
          ${this._loadingThread ? i`<uui-loader></uui-loader>` : this._messages.length === 0 ? i`<div class="empty">No messages yet.</div>` : this._messages.map((t) => o(this, a, W).call(this, t))}
        </div>

        ${o(this, a, T).call(this, e)}
      </div>
    ` : i`
        <div class="pane">
          <div class="empty">Select a conversation to read it.</div>
        </div>
      `;
};
s.styles = [
  O,
  E`
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
        border: 1px solid var(--uui-color-border);
        border-radius: var(--uui-border-radius, 3px);
        background: var(--uui-color-surface);
        max-height: 70vh;
        overflow-y: auto;
      }

      .thread {
        display: block;
        width: 100%;
        text-align: left;
        border: 0;
        border-bottom: 1px solid var(--uui-color-border);
        background: transparent;
        color: inherit;
        font: inherit;
        padding: var(--uui-size-space-4, 12px);
        cursor: pointer;
      }

      .thread:hover {
        background: var(--uui-color-surface-alt);
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
        border: 1px solid var(--uui-color-border);
        border-radius: var(--uui-border-radius, 3px);
        background: var(--uui-color-surface);
        display: flex;
        flex-direction: column;
        min-height: 400px;
        max-height: 70vh;
      }

      .pane-head {
        padding: var(--uui-size-space-4, 12px);
        border-bottom: 1px solid var(--uui-color-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
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
        max-width: 78%;
        padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
        border-radius: 10px;
        font-size: 0.875rem;
        line-height: 1.45;
        overflow-wrap: anywhere;
        white-space: pre-wrap;
      }

      .bubble.in {
        align-self: flex-start;
        background: var(--uui-color-surface-alt);
        border: 1px solid var(--uui-color-border);
      }

      /* WhatsApp brand green, with an explicit dark foreground so it stays
         readable in both light and dark backoffice themes. */
      .bubble.out {
        align-self: flex-end;
        background: #d9fdd3;
        color: #111b21;
        border: 1px solid #b9e7b0;
      }

      .bubble.failed {
        background: var(--uui-color-danger);
        color: var(--uui-color-selected-contrast, #fff);
        border-color: var(--uui-color-danger-emphasis);
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
n([
  l()
], s.prototype, "_conversations", 2);
n([
  l()
], s.prototype, "_selected", 2);
n([
  l()
], s.prototype, "_messages", 2);
n([
  l()
], s.prototype, "_draft", 2);
n([
  l()
], s.prototype, "_error", 2);
n([
  l()
], s.prototype, "_loadingList", 2);
n([
  l()
], s.prototype, "_loadingThread", 2);
n([
  l()
], s.prototype, "_sending", 2);
s = n([
  M("wa-inbox")
], s);
const I = s;
export {
  s as WaInboxElement,
  I as default
};
//# sourceMappingURL=wa-inbox.element.js.map

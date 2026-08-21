import { LitElement as T, html as u, css as k, state as h, customElement as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as A } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as I } from "@umbraco-cms/backoffice/notification";
function S(t) {
  let e = null, i = null;
  const l = t.consumeContext.bind(t), o = new Promise((a) => {
    l(E, async (s) => {
      var m;
      try {
        e = await ((m = s == null ? void 0 : s.getLatestToken) == null ? void 0 : m.call(s)) ?? null;
      } catch {
        e = null;
      }
      a();
    }), setTimeout(a, 3e3);
  });
  return l(I, (a) => {
    i = a;
  }), async (a, s = {}) => {
    await o;
    const m = new Headers(s.headers);
    e && !m.has("Authorization") && m.set("Authorization", `Bearer ${e}`);
    const d = await fetch(a, { ...s, credentials: "same-origin", headers: m });
    if (!d.ok) {
      const b = d.status === 401 || d.status === 403, $ = b ? "Not authorised" : "Could not load data", f = b ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${d.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${d.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${d.status} from ${String(a)} — ${f}`), i == null || i.peek("danger", { data: { headline: $, message: f } });
    }
    return d;
  };
}
var C = Object.defineProperty, U = Object.getOwnPropertyDescriptor, x = (t) => {
  throw TypeError(t);
}, n = (t, e, i, l) => {
  for (var o = l > 1 ? void 0 : l ? U(e, i) : e, a = t.length - 1, s; a >= 0; a--)
    (s = t[a]) && (o = (l ? s(e, i, o) : s(o)) || o);
  return l && o && C(e, i, o), o;
}, y = (t, e, i) => e.has(t) || x("Cannot " + i), _ = (t, e, i) => (y(t, e, "read from private field"), i ? i.call(t) : e.get(t)), w = (t, e, i) => e.has(t) ? x("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), v = (t, e, i) => (y(t, e, "access private method"), i), c, p, g;
let r = class extends A(T) {
  constructor() {
    super(...arguments), w(this, p), w(this, c, S(this)), this._items = [], this._settings = null, this._loading = !1, this._newText = "", this._newUrl = "", this._newSortOrder = 0, this._loadError = null, this._apiBase = "/umbraco/api/newsticker";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadItems(), this._loadSettings();
  }
  async _loadItems() {
    this._loading = !0;
    try {
      const t = await _(this, c).call(this, `${this._apiBase}/items`);
      v(this, p, g).call(this, t) && (this._items = await t.json());
    } finally {
      this._loading = !1;
    }
  }
  async _loadSettings() {
    const t = await _(this, c).call(this, `${this._apiBase}/settings`);
    v(this, p, g).call(this, t) && (this._settings = await t.json());
  }
  async _addItem() {
    if (!this._newText.trim()) return;
    const t = {
      text: this._newText,
      url: this._newUrl || null,
      isActive: !0,
      sortOrder: this._newSortOrder
    }, e = await _(this, c).call(this, `${this._apiBase}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    });
    v(this, p, g).call(this, e) && (this._newText = "", this._newUrl = "", this._newSortOrder = 0, await this._loadItems());
  }
  async _toggleItem(t) {
    const e = { ...t, isActive: !t.isActive }, i = await _(this, c).call(this, `${this._apiBase}/items/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e)
    });
    v(this, p, g).call(this, i) && await this._loadItems();
  }
  async _deleteItem(t) {
    const e = await _(this, c).call(this, `${this._apiBase}/items/${t}`, { method: "DELETE" });
    v(this, p, g).call(this, e) && await this._loadItems();
  }
  render() {
    return u`
      ${this._loadError ? u`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>News Ticker</h1>
      <p class="description">
        Manage scrolling news ticker items displayed across your Umbraco site.
      </p>

      ${this._settings ? u`
            <div class="section">
              <uui-box headline="Current Settings">
                <p>
                  Speed: <strong>${this._settings.speed}</strong> &nbsp;|&nbsp;
                  Direction: <strong>${this._settings.direction}</strong> &nbsp;|&nbsp;
                  Background: <strong>${this._settings.backgroundColor}</strong> &nbsp;|&nbsp;
                  Text: <strong>${this._settings.textColor}</strong>
                </p>
                <p style="color: var(--uui-color-text-alt);">
                  Settings are configured via <code>appsettings.json</code> under
                  <code>UmbracoCms:NewsTicker</code>.
                </p>
              </uui-box>
            </div>
          ` : ""}

      <div class="section">
        <uui-box headline="Add Ticker Item">
          <div class="add-form">
            <uui-input
              label="Text"
              placeholder="Headline text..."
              .value=${this._newText}
              @input=${(t) => this._newText = t.target.value}
            ></uui-input>
            <uui-input
              label="URL (optional)"
              placeholder="https://..."
              .value=${this._newUrl}
              @input=${(t) => this._newUrl = t.target.value}
            ></uui-input>
            <uui-input
              label="Sort Order"
              type="number"
              .value=${String(this._newSortOrder)}
              @input=${(t) => this._newSortOrder = parseInt(t.target.value, 10) || 0}
            ></uui-input>
            <div style="display:flex; align-items:flex-end;">
              <uui-button look="primary" label="Add Item" @click=${this._addItem}>
                Add Item
              </uui-button>
            </div>
          </div>
        </uui-box>
      </div>

      <div class="section">
        <uui-box headline="Active Ticker Items">
          ${this._loading ? u`<uui-loader></uui-loader>` : this._items.length === 0 ? u`<div class="empty-state">No ticker items found. Add one above.</div>` : this._items.map(
      (t) => u`
                  <div class="item-row">
                    <div>
                      <span class="${t.isActive ? "badge-active" : "badge-inactive"}">
                        ${t.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div class="item-text">
                      <div>${t.text}</div>
                      ${t.url ? u`<div class="item-url">${t.url}</div>` : ""}
                    </div>
                    <div style="font-size:0.75rem; color: var(--uui-color-text-alt);">
                      Order: ${t.sortOrder}
                    </div>
                    <uui-button
                      look="secondary"
                      compact
                      label="${t.isActive ? "Disable" : "Enable"}"
                      @click=${() => this._toggleItem(t)}
                    >
                      ${t.isActive ? "Disable" : "Enable"}
                    </uui-button>
                    <uui-button
                      look="danger"
                      compact
                      label="Delete"
                      @click=${() => this._deleteItem(t.id)}
                    >
                      Delete
                    </uui-button>
                  </div>
                `
    )}
        </uui-box>
      </div>
    `;
  }
};
c = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakSet();
g = function(t) {
  return t.ok ? (this._loadError = null, !0) : (this._loadError = t.status === 401 || t.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${t.status}${t.statusText ? ` ${t.statusText}` : ""}.`, !1);
};
r.styles = k`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 8px;
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 24px;
    }

    .section {
      margin-bottom: var(--uui-size-layout-2, 32px);
    }

    .toolbar {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .toolbar uui-input {
      flex: 1;
      min-width: 200px;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }

    .item-text {
      flex: 1;
      font-size: 0.9rem;
    }

    .item-url {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .badge-active {
      background: #16a34a;
      color: #fff;
      border-radius: 9999px;
      padding: 2px 8px;
      font-size: 0.7rem;
    }

    .badge-inactive {
      background: #d1d5db;
      color: #374151;
      border-radius: 9999px;
      padding: 2px 8px;
      font-size: 0.7rem;
    }

    .add-form {
      display: grid;
      gap: 12px;
      grid-template-columns: 1fr 1fr;
    }

    .add-form uui-input {
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--uui-color-text-alt, #6b7280);
    }
  
    .splatdev-load-error {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0 0 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem;
      border-radius: 3px;
    }
  `;
n([
  h()
], r.prototype, "_items", 2);
n([
  h()
], r.prototype, "_settings", 2);
n([
  h()
], r.prototype, "_loading", 2);
n([
  h()
], r.prototype, "_newText", 2);
n([
  h()
], r.prototype, "_newUrl", 2);
n([
  h()
], r.prototype, "_newSortOrder", 2);
n([
  h()
], r.prototype, "_loadError", 2);
r = n([
  O("news-ticker-dashboard")
], r);
export {
  r as NewsTickerDashboardElement
};

import { LitElement as w, html as p, css as f, state as h, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as y } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as $ } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as k } from "@umbraco-cms/backoffice/notification";
function T(t) {
  let e = null, i = null;
  const n = t.consumeContext.bind(t), o = new Promise((a) => {
    n($, async (s) => {
      var c;
      try {
        e = await ((c = s == null ? void 0 : s.getLatestToken) == null ? void 0 : c.call(s)) ?? null;
      } catch {
        e = null;
      }
      a();
    }), setTimeout(a, 3e3);
  });
  return n(k, (a) => {
    i = a;
  }), async (a, s = {}) => {
    await o;
    const c = new Headers(s.headers);
    e && !c.has("Authorization") && c.set("Authorization", `Bearer ${e}`);
    const l = await fetch(a, { ...s, credentials: "same-origin", headers: c });
    if (!l.ok) {
      const g = l.status === 401 || l.status === 403, b = g ? "Not authorised" : "Could not load data", _ = g ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${l.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${l.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${l.status} from ${String(a)} — ${_}`), i == null || i.peek("danger", { data: { headline: b, message: _ } });
    }
    return l;
  };
}
var A = Object.defineProperty, O = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, u = (t, e, i, n) => {
  for (var o = n > 1 ? void 0 : n ? O(e, i) : e, a = t.length - 1, s; a >= 0; a--)
    (s = t[a]) && (o = (n ? s(e, i, o) : s(o)) || o);
  return n && o && A(e, i, o), o;
}, I = (t, e, i) => e.has(t) || v("Cannot " + i), m = (t, e, i) => (I(t, e, "read from private field"), i ? i.call(t) : e.get(t)), S = (t, e, i) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), d;
let r = class extends y(w) {
  constructor() {
    super(...arguments), S(this, d, T(this)), this._items = [], this._settings = null, this._loading = !1, this._newText = "", this._newUrl = "", this._newSortOrder = 0, this._apiBase = "/umbraco/api/newsticker";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadItems(), this._loadSettings();
  }
  async _loadItems() {
    this._loading = !0;
    try {
      const t = await m(this, d).call(this, `${this._apiBase}/items`);
      t.ok && (this._items = await t.json());
    } finally {
      this._loading = !1;
    }
  }
  async _loadSettings() {
    const t = await m(this, d).call(this, `${this._apiBase}/settings`);
    t.ok && (this._settings = await t.json());
  }
  async _addItem() {
    if (!this._newText.trim()) return;
    const t = {
      text: this._newText,
      url: this._newUrl || null,
      isActive: !0,
      sortOrder: this._newSortOrder
    };
    (await m(this, d).call(this, `${this._apiBase}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    })).ok && (this._newText = "", this._newUrl = "", this._newSortOrder = 0, await this._loadItems());
  }
  async _toggleItem(t) {
    const e = { ...t, isActive: !t.isActive };
    (await m(this, d).call(this, `${this._apiBase}/items/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e)
    })).ok && await this._loadItems();
  }
  async _deleteItem(t) {
    (await m(this, d).call(this, `${this._apiBase}/items/${t}`, { method: "DELETE" })).ok && await this._loadItems();
  }
  render() {
    return p`
      <h1>News Ticker</h1>
      <p class="description">
        Manage scrolling news ticker items displayed across your Umbraco site.
      </p>

      ${this._settings ? p`
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
          ${this._loading ? p`<uui-loader></uui-loader>` : this._items.length === 0 ? p`<div class="empty-state">No ticker items found. Add one above.</div>` : this._items.map(
      (t) => p`
                  <div class="item-row">
                    <div>
                      <span class="${t.isActive ? "badge-active" : "badge-inactive"}">
                        ${t.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div class="item-text">
                      <div>${t.text}</div>
                      ${t.url ? p`<div class="item-url">${t.url}</div>` : ""}
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
d = /* @__PURE__ */ new WeakMap();
r.styles = f`
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
  `;
u([
  h()
], r.prototype, "_items", 2);
u([
  h()
], r.prototype, "_settings", 2);
u([
  h()
], r.prototype, "_loading", 2);
u([
  h()
], r.prototype, "_newText", 2);
u([
  h()
], r.prototype, "_newUrl", 2);
u([
  h()
], r.prototype, "_newSortOrder", 2);
r = u([
  x("news-ticker-dashboard")
], r);
export {
  r as NewsTickerDashboardElement
};

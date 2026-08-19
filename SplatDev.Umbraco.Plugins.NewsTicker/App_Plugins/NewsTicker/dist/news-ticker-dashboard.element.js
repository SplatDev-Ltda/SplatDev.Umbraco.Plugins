import { LitElement as m, html as c, css as g, state as u, customElement as _ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as v } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as b } from "@umbraco-cms/backoffice/auth";
function f(t) {
  let e = null;
  const s = new Promise((a) => {
    t.consumeContext(b, async (i) => {
      var r;
      try {
        e = await ((r = i == null ? void 0 : i.getLatestToken) == null ? void 0 : r.call(i)) ?? null;
      } catch {
        e = null;
      }
      a();
    }), setTimeout(a, 3e3);
  });
  return async (a, i = {}) => {
    await s;
    const r = new Headers(i.headers);
    e && !r.has("Authorization") && r.set("Authorization", `Bearer ${e}`);
    const n = await fetch(a, { ...i, credentials: "same-origin", headers: r });
    return (n.status === 401 || n.status === 403) && console.error(
      `[SplatDev] ${n.status} from ${String(a)} — the backoffice token was ${e ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), n;
  };
}
var w = Object.defineProperty, x = Object.getOwnPropertyDescriptor, h = (t) => {
  throw TypeError(t);
}, d = (t, e, s, a) => {
  for (var i = a > 1 ? void 0 : a ? x(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (i = (a ? n(e, s, i) : n(i)) || i);
  return a && i && w(e, s, i), i;
}, y = (t, e, s) => e.has(t) || h("Cannot " + s), p = (t, e, s) => (y(t, e, "read from private field"), s ? s.call(t) : e.get(t)), $ = (t, e, s) => e.has(t) ? h("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), l;
let o = class extends v(m) {
  constructor() {
    super(...arguments), $(this, l, f(this)), this._items = [], this._settings = null, this._loading = !1, this._newText = "", this._newUrl = "", this._newSortOrder = 0, this._apiBase = "/umbraco/api/newsticker";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadItems(), this._loadSettings();
  }
  async _loadItems() {
    this._loading = !0;
    try {
      const t = await p(this, l).call(this, `${this._apiBase}/items`);
      t.ok && (this._items = await t.json());
    } finally {
      this._loading = !1;
    }
  }
  async _loadSettings() {
    const t = await p(this, l).call(this, `${this._apiBase}/settings`);
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
    (await p(this, l).call(this, `${this._apiBase}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    })).ok && (this._newText = "", this._newUrl = "", this._newSortOrder = 0, await this._loadItems());
  }
  async _toggleItem(t) {
    const e = { ...t, isActive: !t.isActive };
    (await p(this, l).call(this, `${this._apiBase}/items/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e)
    })).ok && await this._loadItems();
  }
  async _deleteItem(t) {
    (await p(this, l).call(this, `${this._apiBase}/items/${t}`, { method: "DELETE" })).ok && await this._loadItems();
  }
  render() {
    return c`
      <h1>News Ticker</h1>
      <p class="description">
        Manage scrolling news ticker items displayed across your Umbraco site.
      </p>

      ${this._settings ? c`
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
          ${this._loading ? c`<uui-loader></uui-loader>` : this._items.length === 0 ? c`<div class="empty-state">No ticker items found. Add one above.</div>` : this._items.map(
      (t) => c`
                  <div class="item-row">
                    <div>
                      <span class="${t.isActive ? "badge-active" : "badge-inactive"}">
                        ${t.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div class="item-text">
                      <div>${t.text}</div>
                      ${t.url ? c`<div class="item-url">${t.url}</div>` : ""}
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
l = /* @__PURE__ */ new WeakMap();
o.styles = g`
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
d([
  u()
], o.prototype, "_items", 2);
d([
  u()
], o.prototype, "_settings", 2);
d([
  u()
], o.prototype, "_loading", 2);
d([
  u()
], o.prototype, "_newText", 2);
d([
  u()
], o.prototype, "_newUrl", 2);
d([
  u()
], o.prototype, "_newSortOrder", 2);
o = d([
  _("news-ticker-dashboard")
], o);
export {
  o as NewsTickerDashboardElement
};

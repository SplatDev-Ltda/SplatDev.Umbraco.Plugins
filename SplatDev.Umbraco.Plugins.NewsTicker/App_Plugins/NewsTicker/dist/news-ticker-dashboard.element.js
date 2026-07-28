import { LitElement as u, html as r, css as p, state as a, customElement as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, b = Object.getOwnPropertyDescriptor, o = (t, i, n, l) => {
  for (var s = l > 1 ? void 0 : l ? b(i, n) : i, d = t.length - 1, c; d >= 0; d--)
    (c = t[d]) && (s = (l ? c(i, n, s) : c(s)) || s);
  return l && s && g(i, n, s), s;
};
let e = class extends m(u) {
  constructor() {
    super(...arguments), this._items = [], this._settings = null, this._loading = !1, this._newText = "", this._newUrl = "", this._newSortOrder = 0, this._apiBase = "/umbraco/api/newsticker";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadItems(), this._loadSettings();
  }
  async _loadItems() {
    this._loading = !0;
    try {
      const t = await fetch(`${this._apiBase}/items`);
      t.ok && (this._items = await t.json());
    } finally {
      this._loading = !1;
    }
  }
  async _loadSettings() {
    const t = await fetch(`${this._apiBase}/settings`);
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
    (await fetch(`${this._apiBase}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    })).ok && (this._newText = "", this._newUrl = "", this._newSortOrder = 0, await this._loadItems());
  }
  async _toggleItem(t) {
    const i = { ...t, isActive: !t.isActive };
    (await fetch(`${this._apiBase}/items/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(i)
    })).ok && await this._loadItems();
  }
  async _deleteItem(t) {
    (await fetch(`${this._apiBase}/items/${t}`, { method: "DELETE" })).ok && await this._loadItems();
  }
  render() {
    return r`
      <h1>News Ticker</h1>
      <p class="description">
        Manage scrolling news ticker items displayed across your Umbraco site.
      </p>

      ${this._settings ? r`
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
          ${this._loading ? r`<uui-loader></uui-loader>` : this._items.length === 0 ? r`<div class="empty-state">No ticker items found. Add one above.</div>` : this._items.map(
      (t) => r`
                  <div class="item-row">
                    <div>
                      <span class="${t.isActive ? "badge-active" : "badge-inactive"}">
                        ${t.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div class="item-text">
                      <div>${t.text}</div>
                      ${t.url ? r`<div class="item-url">${t.url}</div>` : ""}
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
e.styles = p`
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
o([
  a()
], e.prototype, "_items", 2);
o([
  a()
], e.prototype, "_settings", 2);
o([
  a()
], e.prototype, "_loading", 2);
o([
  a()
], e.prototype, "_newText", 2);
o([
  a()
], e.prototype, "_newUrl", 2);
o([
  a()
], e.prototype, "_newSortOrder", 2);
e = o([
  h("news-ticker-dashboard")
], e);
export {
  e as NewsTickerDashboardElement
};

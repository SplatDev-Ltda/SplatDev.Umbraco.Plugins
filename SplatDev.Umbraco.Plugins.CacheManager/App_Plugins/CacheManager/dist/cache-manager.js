import { LitElement as p, html as i, css as v, state as b, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as y } from "@umbraco-cms/backoffice/auth";
function f(a) {
  let e = null;
  const s = new Promise((l) => {
    a.consumeContext(y, async (t) => {
      var r;
      try {
        e = await ((r = t == null ? void 0 : t.getLatestToken) == null ? void 0 : r.call(t)) ?? null;
      } catch {
        e = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return async (l, t = {}) => {
    await s;
    const r = new Headers(t.headers);
    e && !r.has("Authorization") && r.set("Authorization", `Bearer ${e}`);
    const u = await fetch(l, { ...t, credentials: "same-origin", headers: r });
    return (u.status === 401 || u.status === 403) && console.error(
      `[SplatDev] ${u.status} from ${String(l)} — the backoffice token was ${e ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), u;
  };
}
var w = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, _ = (a) => {
  throw TypeError(a);
}, h = (a, e, s, l) => {
  for (var t = l > 1 ? void 0 : l ? $(e, s) : e, r = a.length - 1, u; r >= 0; r--)
    (u = a[r]) && (t = (l ? u(e, s, t) : u(t)) || t);
  return l && t && w(e, s, t), t;
}, C = (a, e, s) => e.has(a) || _("Cannot " + s), n = (a, e, s) => (C(a, e, "read from private field"), s ? s.call(a) : e.get(a)), k = (a, e, s) => e.has(a) ? _("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(a) : e.set(a, s), c;
const d = "/umbraco/backoffice/api/CacheWarmer";
let o = class extends m(p) {
  constructor() {
    super(...arguments), k(this, c, f(this)), this._stats = null, this._history = [], this._notFound = [], this._loading = !1, this._message = "", this._activeTab = "overview";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadAll();
  }
  async _loadAll() {
    this._loading = !0, await Promise.all([
      this._loadStats(),
      this._loadHistory(),
      this._loadNotFound()
    ]), this._loading = !1;
  }
  async _loadStats() {
    try {
      const a = await n(this, c).call(this, `${d}/GetStatistics`);
      a.ok && (this._stats = await a.json());
    } catch {
    }
  }
  async _loadHistory() {
    try {
      const a = await n(this, c).call(this, `${d}/GetLastTask`);
      a.ok && (this._history = await a.json());
    } catch {
      this._history = [];
    }
  }
  async _loadNotFound() {
    try {
      const a = await n(this, c).call(this, `${d}/GetUrlNotFound`);
      a.ok && (this._notFound = await a.json());
    } catch {
      this._notFound = [];
    }
  }
  async _clearCache() {
    this._loading = !0;
    try {
      const a = await n(this, c).call(this, `${d}/ClearCache`, { method: "POST" });
      this._message = a.ok ? "Cache cleared successfully." : "Failed to clear cache.";
    } catch {
      this._message = "Error clearing cache.";
    }
    this._loading = !1;
  }
  async _refreshCache() {
    this._loading = !0, this._message = "Refreshing cache — this may take a moment...";
    try {
      const a = await n(this, c).call(this, `${d}/RefreshCache`, { method: "POST" });
      this._message = a.ok ? "Cache refreshed successfully." : "Failed to refresh cache.", a.ok && await this._loadHistory();
    } catch {
      this._message = "Error refreshing cache.";
    }
    this._loading = !1;
  }
  async _clearLog() {
    try {
      await n(this, c).call(this, `${d}/ClearLog`, { method: "POST" }), this._history = [], this._message = "Cache log cleared.";
    } catch {
      this._message = "Error clearing log.";
    }
  }
  _renderOverview() {
    var a, e;
    return i`
      <uui-box headline="Cache Actions">
        ${this._message ? i`<div class="message">${this._message}</div>` : ""}
        <div class="action-row">
          <uui-button
            look="primary"
            label="Refresh Cache"
            ?disabled=${this._loading}
            @click=${this._refreshCache}
          >
            Refresh Cache
          </uui-button>
          <uui-button
            look="danger"
            label="Clear Cache"
            ?disabled=${this._loading}
            @click=${this._clearCache}
          >
            Clear Cache
          </uui-button>
        </div>
      </uui-box>

      ${this._stats ? i`
          <uui-box headline="Cache Statistics">
            <div class="stat-grid">
              <div class="stat">
                <span class="stat-value">${this._stats.count}</span>
                <span class="stat-label">Total Keys</span>
              </div>
              <div class="stat">
                <span class="stat-value">${((a = this._stats.dbKeys) == null ? void 0 : a.length) ?? 0}</span>
                <span class="stat-label">DB Keys</span>
              </div>
              <div class="stat">
                <span class="stat-value">${((e = this._stats.methodKeys) == null ? void 0 : e.length) ?? 0}</span>
                <span class="stat-label">Method Keys</span>
              </div>
            </div>
          </uui-box>
        ` : ""}
    `;
  }
  _renderHistory() {
    return i`
      <uui-box headline="Cache Warm-up History">
        <uui-button
          slot="header-actions"
          look="secondary"
          label="Clear Log"
          @click=${this._clearLog}
        >Clear Log</uui-button>
        ${this._history.length === 0 ? i`<p class="empty">No cache history available.</p>` : i`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>URL</uui-table-head-cell>
                <uui-table-head-cell>Status</uui-table-head-cell>
                <uui-table-head-cell>Cached At</uui-table-head-cell>
              </uui-table-head>
              ${this._history.map(
      (a) => i`
                  <uui-table-row>
                    <uui-table-cell>${a.url}</uui-table-cell>
                    <uui-table-cell>${a.status}</uui-table-cell>
                    <uui-table-cell>${new Date(a.cachedAt).toLocaleString()}</uui-table-cell>
                  </uui-table-row>
                `
    )}
            </uui-table>
          `}
      </uui-box>
    `;
  }
  _renderNotFound() {
    return i`
      <uui-box headline="404 — URLs Not Found">
        ${this._notFound.length === 0 ? i`<p class="empty">No 404s recorded.</p>` : i`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>URL</uui-table-head-cell>
                <uui-table-head-cell>Referrer</uui-table-head-cell>
                <uui-table-head-cell>Date</uui-table-head-cell>
              </uui-table-head>
              ${this._notFound.map(
      (a) => i`
                  <uui-table-row>
                    <uui-table-cell>${a.url}</uui-table-cell>
                    <uui-table-cell>${a.referrer ?? "—"}</uui-table-cell>
                    <uui-table-cell>${new Date(a.date).toLocaleString()}</uui-table-cell>
                  </uui-table-row>
                `
    )}
            </uui-table>
          `}
      </uui-box>
    `;
  }
  render() {
    return i`
      <div class="dashboard">
        <div class="header">
          <h1>Cache Manager</h1>
          <p>Manage the Umbraco content cache and monitor cache warm-up activity.</p>
        </div>

        <uui-tab-group>
          <uui-tab
            label="Overview"
            ?active=${this._activeTab === "overview"}
            @click=${() => this._activeTab = "overview"}
          >Overview</uui-tab>
          <uui-tab
            label="History"
            ?active=${this._activeTab === "history"}
            @click=${() => this._activeTab = "history"}
          >History</uui-tab>
          <uui-tab
            label="404s"
            ?active=${this._activeTab === "notfound"}
            @click=${() => this._activeTab = "notfound"}
          >404s (${this._notFound.length})</uui-tab>
        </uui-tab-group>

        <div class="tab-content">
          ${this._activeTab === "overview" ? this._renderOverview() : ""}
          ${this._activeTab === "history" ? this._renderHistory() : ""}
          ${this._activeTab === "notfound" ? this._renderNotFound() : ""}
        </div>
      </div>
    `;
  }
};
c = /* @__PURE__ */ new WeakMap();
o.styles = v`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }
    .dashboard {
      max-width: 1200px;
    }
    .header {
      margin-bottom: var(--uui-size-space-5);
    }
    .header h1 {
      margin: 0 0 var(--uui-size-2) 0;
      font-size: 1.5rem;
    }
    .header p {
      margin: 0;
      color: var(--uui-color-text-alt);
    }
    .tab-content {
      margin-top: var(--uui-size-space-5);
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-5);
    }
    .action-row {
      display: flex;
      gap: var(--uui-size-space-3);
      flex-wrap: wrap;
    }
    .message {
      padding: var(--uui-size-space-3);
      background: var(--uui-color-surface-alt);
      border-radius: var(--uui-border-radius);
      margin-bottom: var(--uui-size-space-3);
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--uui-size-space-5);
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--uui-size-2);
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--uui-color-selected);
    }
    .stat-label {
      font-size: 0.85rem;
      color: var(--uui-color-text-alt);
    }
    .empty {
      color: var(--uui-color-text-alt);
      font-style: italic;
    }
    uui-table {
      width: 100%;
    }
  `;
h([
  b()
], o.prototype, "_stats", 2);
h([
  b()
], o.prototype, "_history", 2);
h([
  b()
], o.prototype, "_notFound", 2);
h([
  b()
], o.prototype, "_loading", 2);
h([
  b()
], o.prototype, "_message", 2);
h([
  b()
], o.prototype, "_activeTab", 2);
o = h([
  g("cache-manager-dashboard")
], o);
export {
  o as CacheManagerDashboardElement
};
//# sourceMappingURL=cache-manager.js.map

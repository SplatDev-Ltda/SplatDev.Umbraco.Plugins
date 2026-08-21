import { LitElement as f, html as i, css as w, state as p, customElement as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as C } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as T } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as k } from "@umbraco-cms/backoffice/notification";
function x(e) {
  let a = null, t = null;
  const c = e.consumeContext.bind(e), o = new Promise((l) => {
    c(T, async (s) => {
      var d;
      try {
        a = await ((d = s == null ? void 0 : s.getLatestToken) == null ? void 0 : d.call(s)) ?? null;
      } catch {
        a = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return c(k, (l) => {
    t = l;
  }), async (l, s = {}) => {
    await o;
    const d = new Headers(s.headers);
    a && !d.has("Authorization") && d.set("Authorization", `Bearer ${a}`);
    const n = await fetch(l, { ...s, credentials: "same-origin", headers: d });
    if (!n.ok) {
      const v = n.status === 401 || n.status === 403, y = v ? "Not authorised" : "Could not load data", m = v ? `The backoffice token was ${a ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(l)} — ${m}`), t == null || t.peek("danger", { data: { headline: y, message: m } });
    }
    return n;
  };
}
var F = Object.defineProperty, z = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, h = (e, a, t, c) => {
  for (var o = c > 1 ? void 0 : c ? z(a, t) : a, l = e.length - 1, s; l >= 0; l--)
    (s = e[l]) && (o = (c ? s(a, t, o) : s(o)) || o);
  return c && o && F(a, t, o), o;
}, A = (e, a, t) => a.has(e) || g("Cannot " + t), b = (e, a, t) => (A(e, a, "read from private field"), t ? t.call(e) : a.get(e)), O = (e, a, t) => a.has(e) ? g("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(e) : a.set(e, t), u;
const _ = "/umbraco/backoffice/api/CacheWarmer";
let r = class extends C(f) {
  constructor() {
    super(...arguments), O(this, u, x(this)), this._stats = null, this._history = [], this._notFound = [], this._loading = !1, this._message = "", this._activeTab = "overview";
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
      const e = await b(this, u).call(this, `${_}/GetStatistics`);
      e.ok && (this._stats = await e.json());
    } catch {
    }
  }
  async _loadHistory() {
    try {
      const e = await b(this, u).call(this, `${_}/GetLastTask`);
      e.ok && (this._history = await e.json());
    } catch {
      this._history = [];
    }
  }
  async _loadNotFound() {
    try {
      const e = await b(this, u).call(this, `${_}/GetUrlNotFound`);
      e.ok && (this._notFound = await e.json());
    } catch {
      this._notFound = [];
    }
  }
  async _clearCache() {
    this._loading = !0;
    try {
      const e = await b(this, u).call(this, `${_}/ClearCache`, { method: "POST" });
      this._message = e.ok ? "Cache cleared successfully." : "Failed to clear cache.";
    } catch {
      this._message = "Error clearing cache.";
    }
    this._loading = !1;
  }
  async _refreshCache() {
    this._loading = !0, this._message = "Refreshing cache — this may take a moment...";
    try {
      const e = await b(this, u).call(this, `${_}/RefreshCache`, { method: "POST" });
      this._message = e.ok ? "Cache refreshed successfully." : "Failed to refresh cache.", e.ok && await this._loadHistory();
    } catch {
      this._message = "Error refreshing cache.";
    }
    this._loading = !1;
  }
  async _clearLog() {
    try {
      await b(this, u).call(this, `${_}/ClearLog`, { method: "POST" }), this._history = [], this._message = "Cache log cleared.";
    } catch {
      this._message = "Error clearing log.";
    }
  }
  _renderOverview() {
    var e, a;
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
                <span class="stat-value">${((e = this._stats.dbKeys) == null ? void 0 : e.length) ?? 0}</span>
                <span class="stat-label">DB Keys</span>
              </div>
              <div class="stat">
                <span class="stat-value">${((a = this._stats.methodKeys) == null ? void 0 : a.length) ?? 0}</span>
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
      (e) => i`
                  <uui-table-row>
                    <uui-table-cell>${e.url}</uui-table-cell>
                    <uui-table-cell>${e.status}</uui-table-cell>
                    <uui-table-cell>${new Date(e.cachedAt).toLocaleString()}</uui-table-cell>
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
      (e) => i`
                  <uui-table-row>
                    <uui-table-cell>${e.url}</uui-table-cell>
                    <uui-table-cell>${e.referrer ?? "—"}</uui-table-cell>
                    <uui-table-cell>${new Date(e.date).toLocaleString()}</uui-table-cell>
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
u = /* @__PURE__ */ new WeakMap();
r.styles = w`
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
  p()
], r.prototype, "_stats", 2);
h([
  p()
], r.prototype, "_history", 2);
h([
  p()
], r.prototype, "_notFound", 2);
h([
  p()
], r.prototype, "_loading", 2);
h([
  p()
], r.prototype, "_message", 2);
h([
  p()
], r.prototype, "_activeTab", 2);
r = h([
  $("cache-manager-dashboard")
], r);
export {
  r as CacheManagerDashboardElement
};
//# sourceMappingURL=cache-manager.js.map

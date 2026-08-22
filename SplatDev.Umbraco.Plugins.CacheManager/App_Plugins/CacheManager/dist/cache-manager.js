import { LitElement as x, html as s, css as k, state as d, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as S } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as z } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as F } from "@umbraco-cms/backoffice/notification";
function O(e) {
  let a = null, t = null;
  const h = e.consumeContext.bind(e), o = new Promise((r) => {
    h(z, async (i) => {
      var b;
      try {
        a = await ((b = i == null ? void 0 : i.getLatestToken) == null ? void 0 : b.call(i)) ?? null;
      } catch {
        a = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return h(F, (r) => {
    t = r;
  }), async (r, i = {}) => {
    await o;
    const b = new Headers(i.headers);
    a && !b.has("Authorization") && b.set("Authorization", `Bearer ${a}`);
    const n = await fetch(r, { ...i, credentials: "same-origin", headers: b });
    if (!n.ok) {
      const m = n.status === 401 || n.status === 403, C = m ? "Not authorised" : "Could not load data", y = m ? `The backoffice token was ${a ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(r)} — ${y}`), t == null || t.peek("danger", { data: { headline: C, message: y } });
    }
    return n;
  };
}
var A = Object.defineProperty, N = Object.getOwnPropertyDescriptor, $ = (e) => {
  throw TypeError(e);
}, c = (e, a, t, h) => {
  for (var o = h > 1 ? void 0 : h ? N(a, t) : a, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (o = (h ? i(a, t, o) : i(o)) || o);
  return h && o && A(a, t, o), o;
}, T = (e, a, t) => a.has(e) || $("Cannot " + t), _ = (e, a, t) => (T(e, a, "read from private field"), t ? t.call(e) : a.get(e)), w = (e, a, t) => a.has(e) ? $("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(e) : a.set(e, t), g = (e, a, t) => (T(e, a, "access private method"), t), u, v, f;
const p = "/umbraco/api/cachewarmer";
let l = class extends S(x) {
  constructor() {
    super(...arguments), w(this, v), w(this, u, O(this)), this._stats = null, this._history = [], this._notFound = [], this._loading = !1, this._message = "", this._activeTab = "overview", this._loadError = null;
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
      const e = await _(this, u).call(this, `${p}/statistics`);
      g(this, v, f).call(this, e) && (this._stats = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details.");
    }
  }
  async _loadHistory() {
    try {
      const e = await _(this, u).call(this, `${p}/last-task`);
      g(this, v, f).call(this, e) && (this._history = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._history = [];
    }
  }
  async _loadNotFound() {
    try {
      const e = await _(this, u).call(this, `${p}/url-not-found`);
      g(this, v, f).call(this, e) && (this._notFound = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._notFound = [];
    }
  }
  async _clearCache() {
    this._loading = !0;
    try {
      const e = await _(this, u).call(this, `${p}/clear-cache`, { method: "POST" });
      this._message = e.ok ? "Cache cleared successfully." : "Failed to clear cache.";
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._message = "Error clearing cache.";
    }
    this._loading = !1;
  }
  async _refreshCache() {
    this._loading = !0, this._message = "Refreshing cache — this may take a moment...";
    try {
      const e = await _(this, u).call(this, `${p}/refresh-cache`, { method: "POST" });
      this._message = e.ok ? "Cache refreshed successfully." : "Failed to refresh cache.", g(this, v, f).call(this, e) && await this._loadHistory();
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._message = "Error refreshing cache.";
    }
    this._loading = !1;
  }
  async _clearLog() {
    try {
      await _(this, u).call(this, `${p}/clear-log`, { method: "POST" }), this._history = [], this._message = "Cache log cleared.";
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._message = "Error clearing log.";
    }
  }
  _renderOverview() {
    var e, a;
    return s`
      <uui-box headline="Cache Actions">
        ${this._message ? s`<div class="message">${this._message}</div>` : ""}
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

      ${this._stats ? s`
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
    return s`
      <uui-box headline="Cache Warm-up History">
        <uui-button
          slot="header-actions"
          look="secondary"
          label="Clear Log"
          @click=${this._clearLog}
        >Clear Log</uui-button>
        ${this._history.length === 0 ? s`<p class="empty">No cache history available.</p>` : s`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>URL</uui-table-head-cell>
                <uui-table-head-cell>Status</uui-table-head-cell>
                <uui-table-head-cell>Cached At</uui-table-head-cell>
              </uui-table-head>
              ${this._history.map(
      (e) => s`
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
    return s`
      <uui-box headline="404 — URLs Not Found">
        ${this._notFound.length === 0 ? s`<p class="empty">No 404s recorded.</p>` : s`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>URL</uui-table-head-cell>
                <uui-table-head-cell>Referrer</uui-table-head-cell>
                <uui-table-head-cell>Date</uui-table-head-cell>
              </uui-table-head>
              ${this._notFound.map(
      (e) => s`
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
    return s`
      ${this._loadError ? s`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
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
v = /* @__PURE__ */ new WeakSet();
f = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
l.styles = k`
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
c([
  d()
], l.prototype, "_stats", 2);
c([
  d()
], l.prototype, "_history", 2);
c([
  d()
], l.prototype, "_notFound", 2);
c([
  d()
], l.prototype, "_loading", 2);
c([
  d()
], l.prototype, "_message", 2);
c([
  d()
], l.prototype, "_activeTab", 2);
c([
  d()
], l.prototype, "_loadError", 2);
l = c([
  E("cache-manager-dashboard")
], l);
export {
  l as CacheManagerDashboardElement
};
//# sourceMappingURL=cache-manager.js.map

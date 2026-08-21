import { LitElement as v, html as c, css as _, state as p, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as w } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as x } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as z } from "@umbraco-cms/backoffice/notification";
function $(t) {
  let e = null, a = null;
  const u = t.consumeContext.bind(t), s = new Promise((l) => {
    u(x, async (i) => {
      var r;
      try {
        e = await ((r = i == null ? void 0 : i.getLatestToken) == null ? void 0 : r.call(i)) ?? null;
      } catch {
        e = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return u(z, (l) => {
    a = l;
  }), async (l, i = {}) => {
    await s;
    const r = new Headers(i.headers);
    e && !r.has("Authorization") && r.set("Authorization", `Bearer ${e}`);
    const o = await fetch(l, { ...i, credentials: "same-origin", headers: r });
    if (!o.ok) {
      const b = o.status === 401 || o.status === 403, m = b ? "Not authorised" : "Could not load data", f = b ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${o.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${o.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${o.status} from ${String(l)} — ${f}`), a == null || a.peek("danger", { data: { headline: m, message: f } });
    }
    return o;
  };
}
var C = Object.defineProperty, E = Object.getOwnPropertyDescriptor, g = (t) => {
  throw TypeError(t);
}, d = (t, e, a, u) => {
  for (var s = u > 1 ? void 0 : u ? E(e, a) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (u ? i(e, a, s) : i(s)) || s);
  return u && s && C(e, a, s), s;
}, T = (t, e, a) => e.has(t) || g("Cannot " + a), A = (t, e, a) => (T(t, e, "read from private field"), a ? a.call(t) : e.get(t)), I = (t, e, a) => e.has(t) ? g("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), h;
let n = class extends w(v) {
  constructor() {
    super(...arguments), I(this, h, $(this)), this._filter = "", this._loading = !1, this._exceptions = [], this._apiAvailable = !1, this._apiBase = "/umbraco/management/api/v1/exception-manager";
  }
  _handleFilterInput(t) {
    const e = t.target;
    this._filter = e.value;
  }
  async _refresh() {
    if (this._apiAvailable) {
      this._loading = !0;
      try {
        const t = this._filter ? `${this._apiBase}?filter=${encodeURIComponent(this._filter)}` : this._apiBase, e = await A(this, h).call(this, t, {
          headers: { "Content-Type": "application/json" }
        });
        if (e.ok) {
          const a = await e.json();
          this._exceptions = a;
        }
      } catch {
      } finally {
        this._loading = !1;
      }
    }
  }
  get _filteredExceptions() {
    if (!this._filter.trim()) return this._exceptions;
    const t = this._filter.toLowerCase();
    return this._exceptions.filter(
      (e) => e.url.toLowerCase().includes(t) || e.ip.includes(t) || e.message.toLowerCase().includes(t) || String(e.statusCode).includes(t)
    );
  }
  render() {
    const t = this._filteredExceptions;
    return c`
      <div class="dashboard-header">
        <h1>Exception Manager</h1>
        <p>
          View and filter exceptions logged by the application. Drill into
          individual records to inspect request details.
        </p>
      </div>

      <div class="section">
        <uui-box headline="API Status">
          <div class="pending-notice">
            <uui-icon name="alert"></uui-icon>
            <span>
              The exception log API
              (<code>/umbraco/management/api/v1/exception-manager</code>) will
              be available once the <strong>Phase 3 backend</strong> is
              deployed. The table below is currently showing a placeholder
              empty state.
            </span>
          </div>
        </uui-box>
      </div>

      <div class="section">
        <uui-box headline="Exception Log">
          <div class="toolbar">
            <uui-input
              type="search"
              placeholder="Filter by URL, IP, status code, or message…"
              label="Filter exceptions"
              .value=${this._filter}
              @input=${this._handleFilterInput}
            ></uui-input>
            <uui-button
              look="secondary"
              label="Refresh"
              ?disabled=${this._loading || !this._apiAvailable}
              @click=${this._refresh}
            >
              ${this._loading ? "Loading…" : "Refresh"}
            </uui-button>
          </div>

          ${t.length > 0 ? c`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>URL</uui-table-head-cell>
                    <uui-table-head-cell>IP</uui-table-head-cell>
                    <uui-table-head-cell>Status Code</uui-table-head-cell>
                    <uui-table-head-cell>Date</uui-table-head-cell>
                    <uui-table-head-cell>Message</uui-table-head-cell>
                  </uui-table-head>
                  ${t.map(
      (e) => c`
                      <uui-table-row>
                        <uui-table-cell>${e.url}</uui-table-cell>
                        <uui-table-cell>${e.ip}</uui-table-cell>
                        <uui-table-cell>${e.statusCode}</uui-table-cell>
                        <uui-table-cell>${e.date}</uui-table-cell>
                        <uui-table-cell>${e.message}</uui-table-cell>
                      </uui-table-row>
                    `
    )}
                </uui-table>
              ` : c`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>URL</uui-table-head-cell>
                    <uui-table-head-cell>IP</uui-table-head-cell>
                    <uui-table-head-cell>Status Code</uui-table-head-cell>
                    <uui-table-head-cell>Date</uui-table-head-cell>
                    <uui-table-head-cell>Message</uui-table-head-cell>
                  </uui-table-head>
                </uui-table>
                <div class="empty-state">
                  <uui-icon name="info"></uui-icon>
                  <p>No exceptions logged.</p>
                </div>
              `}
        </uui-box>
      </div>
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
n.styles = _`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .dashboard-header {
      margin-bottom: var(--uui-size-layout-2);
    }

    .dashboard-header h1 {
      margin: 0 0 var(--uui-size-4) 0;
      font-size: var(--uui-size-10);
      font-weight: 700;
      color: var(--uui-color-text);
    }

    .dashboard-header p {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-size-5);
    }

    .section {
      margin-bottom: var(--uui-size-layout-2);
    }

    .toolbar {
      display: flex;
      gap: var(--uui-size-4);
      align-items: center;
      margin-bottom: var(--uui-size-4);
      flex-wrap: wrap;
    }

    .toolbar uui-input {
      flex: 1;
      min-width: 240px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-layout-3) var(--uui-size-layout-1);
      color: var(--uui-color-text-alt);
      gap: var(--uui-size-4);
    }

    .empty-state uui-icon {
      font-size: 3rem;
      opacity: 0.4;
    }

    .empty-state p {
      margin: 0;
      font-size: var(--uui-size-5);
    }

    uui-table {
      width: 100%;
    }

    uui-table-head-cell {
      font-weight: 600;
    }

    .pending-notice {
      display: flex;
      align-items: flex-start;
      gap: var(--uui-size-3);
      font-size: var(--uui-size-5);
      color: var(--uui-color-text-alt);
      line-height: 1.6;
    }

    .pending-notice uui-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }
  `;
d([
  p()
], n.prototype, "_filter", 2);
d([
  p()
], n.prototype, "_loading", 2);
d([
  p()
], n.prototype, "_exceptions", 2);
n = d([
  y("exception-manager-dashboard")
], n);
const D = n;
export {
  n as ExceptionManagerDashboardElement,
  D as default
};

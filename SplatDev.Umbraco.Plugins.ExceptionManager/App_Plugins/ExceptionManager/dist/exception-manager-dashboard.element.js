import { LitElement as p, html as r, css as b, state as d, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as m } from "@umbraco-cms/backoffice/auth";
function v(t) {
  let e = null;
  const i = new Promise((l) => {
    t.consumeContext(m, async (a) => {
      var u;
      try {
        e = await ((u = a == null ? void 0 : a.getLatestToken) == null ? void 0 : u.call(a)) ?? null;
      } catch {
        e = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return async (l, a = {}) => {
    await i;
    const u = new Headers(a.headers);
    e && !u.has("Authorization") && u.set("Authorization", `Bearer ${e}`);
    const s = await fetch(l, { ...a, credentials: "same-origin", headers: u });
    return (s.status === 401 || s.status === 403) && console.error(
      `[SplatDev] ${s.status} from ${String(l)} — the backoffice token was ${e ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), s;
  };
}
var _ = Object.defineProperty, y = Object.getOwnPropertyDescriptor, h = (t) => {
  throw TypeError(t);
}, n = (t, e, i, l) => {
  for (var a = l > 1 ? void 0 : l ? y(e, i) : e, u = t.length - 1, s; u >= 0; u--)
    (s = t[u]) && (a = (l ? s(e, i, a) : s(a)) || a);
  return l && a && _(e, i, a), a;
}, w = (t, e, i) => e.has(t) || h("Cannot " + i), x = (t, e, i) => (w(t, e, "read from private field"), i ? i.call(t) : e.get(t)), z = (t, e, i) => e.has(t) ? h("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), c;
let o = class extends g(p) {
  constructor() {
    super(...arguments), z(this, c, v(this)), this._filter = "", this._loading = !1, this._exceptions = [], this._apiAvailable = !1, this._apiBase = "/umbraco/management/api/v1/exception-manager";
  }
  _handleFilterInput(t) {
    const e = t.target;
    this._filter = e.value;
  }
  async _refresh() {
    if (this._apiAvailable) {
      this._loading = !0;
      try {
        const t = this._filter ? `${this._apiBase}?filter=${encodeURIComponent(this._filter)}` : this._apiBase, e = await x(this, c).call(this, t, {
          headers: { "Content-Type": "application/json" }
        });
        if (e.ok) {
          const i = await e.json();
          this._exceptions = i;
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
    return r`
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

          ${t.length > 0 ? r`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>URL</uui-table-head-cell>
                    <uui-table-head-cell>IP</uui-table-head-cell>
                    <uui-table-head-cell>Status Code</uui-table-head-cell>
                    <uui-table-head-cell>Date</uui-table-head-cell>
                    <uui-table-head-cell>Message</uui-table-head-cell>
                  </uui-table-head>
                  ${t.map(
      (e) => r`
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
              ` : r`
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
c = /* @__PURE__ */ new WeakMap();
o.styles = b`
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
n([
  d()
], o.prototype, "_filter", 2);
n([
  d()
], o.prototype, "_loading", 2);
n([
  d()
], o.prototype, "_exceptions", 2);
o = n([
  f("exception-manager-dashboard")
], o);
const P = o;
export {
  o as ExceptionManagerDashboardElement,
  P as default
};

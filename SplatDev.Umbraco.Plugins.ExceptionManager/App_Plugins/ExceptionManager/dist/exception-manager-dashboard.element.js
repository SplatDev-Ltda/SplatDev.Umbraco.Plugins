import { LitElement as x, html as d, css as $, state as h, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as z } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as T } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as C } from "@umbraco-cms/backoffice/notification";
function k(e) {
  let t = null, a = null;
  const o = e.consumeContext.bind(e), s = new Promise((l) => {
    o(T, async (i) => {
      var n;
      try {
        t = await ((n = i == null ? void 0 : i.getLatestToken) == null ? void 0 : n.call(i)) ?? null;
      } catch {
        t = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return o(C, (l) => {
    a = l;
  }), async (l, i = {}) => {
    await s;
    const n = new Headers(i.headers);
    t && !n.has("Authorization") && n.set("Authorization", `Bearer ${t}`);
    const u = await fetch(l, { ...i, credentials: "same-origin", headers: n });
    if (!u.ok) {
      const f = u.status === 401 || u.status === 403, w = f ? "Not authorised" : "Could not load data", g = f ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${u.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${u.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${u.status} from ${String(l)} — ${g}`), a == null || a.peek("danger", { data: { headline: w, message: g } });
    }
    return u;
  };
}
var A = Object.defineProperty, I = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, c = (e, t, a, o) => {
  for (var s = o > 1 ? void 0 : o ? I(t, a) : t, l = e.length - 1, i; l >= 0; l--)
    (i = e[l]) && (s = (o ? i(t, a, s) : i(s)) || s);
  return o && s && A(t, a, s), s;
}, _ = (e, t, a) => t.has(e) || v("Cannot " + a), M = (e, t, a) => (_(e, t, "read from private field"), a ? a.call(e) : t.get(e)), m = (e, t, a) => t.has(e) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), P = (e, t, a) => (_(e, t, "access private method"), a), p, b, y;
let r = class extends z(x) {
  constructor() {
    super(...arguments), m(this, b), m(this, p, k(this)), this._filter = "", this._loading = !1, this._exceptions = [], this._loadError = null, this._apiAvailable = !1, this._apiBase = "/umbraco/management/api/v1/exception-manager";
  }
  _handleFilterInput(e) {
    const t = e.target;
    this._filter = t.value;
  }
  async _refresh() {
    if (this._apiAvailable) {
      this._loading = !0;
      try {
        const e = this._filter ? `${this._apiBase}?filter=${encodeURIComponent(this._filter)}` : this._apiBase, t = await M(this, p).call(this, e, {
          headers: { "Content-Type": "application/json" }
        });
        if (P(this, b, y).call(this, t)) {
          const a = await t.json();
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
    const e = this._filter.toLowerCase();
    return this._exceptions.filter(
      (t) => t.url.toLowerCase().includes(e) || t.ip.includes(e) || t.message.toLowerCase().includes(e) || String(t.statusCode).includes(e)
    );
  }
  render() {
    const e = this._filteredExceptions;
    return d`
      ${this._loadError ? d`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
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

          ${e.length > 0 ? d`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>URL</uui-table-head-cell>
                    <uui-table-head-cell>IP</uui-table-head-cell>
                    <uui-table-head-cell>Status Code</uui-table-head-cell>
                    <uui-table-head-cell>Date</uui-table-head-cell>
                    <uui-table-head-cell>Message</uui-table-head-cell>
                  </uui-table-head>
                  ${e.map(
      (t) => d`
                      <uui-table-row>
                        <uui-table-cell>${t.url}</uui-table-cell>
                        <uui-table-cell>${t.ip}</uui-table-cell>
                        <uui-table-cell>${t.statusCode}</uui-table-cell>
                        <uui-table-cell>${t.date}</uui-table-cell>
                        <uui-table-cell>${t.message}</uui-table-cell>
                      </uui-table-row>
                    `
    )}
                </uui-table>
              ` : d`
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
p = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakSet();
y = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
r.styles = $`
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
  h()
], r.prototype, "_filter", 2);
c([
  h()
], r.prototype, "_loading", 2);
c([
  h()
], r.prototype, "_exceptions", 2);
c([
  h()
], r.prototype, "_loadError", 2);
r = c([
  E("exception-manager-dashboard")
], r);
const U = r;
export {
  r as ExceptionManagerDashboardElement,
  U as default
};

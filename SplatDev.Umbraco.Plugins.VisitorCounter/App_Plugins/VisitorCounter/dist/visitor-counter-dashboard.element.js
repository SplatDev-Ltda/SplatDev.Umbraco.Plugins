import { LitElement as _, html as n, css as v, state as c, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as f } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as m } from "@umbraco-cms/backoffice/auth";
function g(t) {
  let a = null;
  const s = new Promise((i) => {
    t.consumeContext(m, async (e) => {
      var r;
      try {
        a = await ((r = e == null ? void 0 : e.getLatestToken) == null ? void 0 : r.call(e)) ?? null;
      } catch {
        a = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return async (i, e = {}) => {
    await s;
    const r = new Headers(e.headers);
    a && !r.has("Authorization") && r.set("Authorization", `Bearer ${a}`);
    const l = await fetch(i, { ...e, credentials: "same-origin", headers: r });
    return (l.status === 401 || l.status === 403) && console.error(
      `[SplatDev] ${l.status} from ${String(i)} — the backoffice token was ${a ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), l;
  };
}
var y = Object.defineProperty, w = Object.getOwnPropertyDescriptor, p = (t) => {
  throw TypeError(t);
}, u = (t, a, s, i) => {
  for (var e = i > 1 ? void 0 : i ? w(a, s) : a, r = t.length - 1, l; r >= 0; r--)
    (l = t[r]) && (e = (i ? l(a, s, e) : l(e)) || e);
  return i && e && y(a, s, e), e;
}, x = (t, a, s) => a.has(t) || p("Cannot " + s), h = (t, a, s) => (x(t, a, "read from private field"), s ? s.call(t) : a.get(t)), $ = (t, a, s) => a.has(t) ? p("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(t) : a.set(t, s), d;
let o = class extends f(_) {
  constructor() {
    super(...arguments), $(this, d, g(this)), this._loading = !1, this._stats = null, this._daily = [], this._error = null, this._days = 30;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0, this._error = null;
    try {
      const [t, a] = await Promise.all([
        h(this, d).call(this, `/umbraco/api/visitorcounter/GetStats?days=${this._days}`),
        h(this, d).call(this, `/umbraco/api/visitorcounter/GetDailyCounts?days=${this._days}`)
      ]);
      if (!t.ok) throw new Error(`Stats HTTP ${t.status}`);
      if (!a.ok) throw new Error(`Daily HTTP ${a.status}`);
      this._stats = await t.json();
      const s = await a.json();
      this._daily = s.slice().sort((i, e) => e.date.localeCompare(i.date));
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Unknown error";
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return n`
      <h1>Visitor Counter</h1>
      <p class="description">Site visitor statistics for the last ${this._days} days.</p>

      ${this._stats ? n`
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-value">${this._stats.totalVisits.toLocaleString()}</span>
                <span class="stat-label">Total Visits (all time)</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">${this._stats.uniqueVisits.toLocaleString()}</span>
                <span class="stat-label">Unique Visitors (${this._days}d)</span>
              </div>
            </div>
          ` : ""}

      <uui-box>
        <div class="toolbar">
          <uui-button
            look="secondary"
            label="Refresh"
            ?disabled=${this._loading}
            @click=${this._load}
          >${this._loading ? "Loading…" : "Refresh"}</uui-button>
        </div>

        ${this._error ? n`<uui-tag color="danger">${this._error}</uui-tag>` : this._loading ? n`<uui-loader></uui-loader>` : this._daily.length === 0 ? n`<div class="empty-state">No visitor data recorded yet.</div>` : n`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Date</uui-table-head-cell>
                  <uui-table-head-cell>Total Visits</uui-table-head-cell>
                  <uui-table-head-cell>Unique Visitors</uui-table-head-cell>
                </uui-table-head>
                ${this._daily.map(
      (t) => n`
                    <uui-table-row>
                      <uui-table-cell>${t.date}</uui-table-cell>
                      <uui-table-cell>${t.totalVisits.toLocaleString()}</uui-table-cell>
                      <uui-table-cell>${t.uniqueVisits.toLocaleString()}</uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
};
d = /* @__PURE__ */ new WeakMap();
o.styles = v`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 8px;
      color: var(--uui-color-text);
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 24px;
    }

    .stats-grid {
      display: flex;
      gap: var(--uui-size-4);
      flex-wrap: wrap;
      margin-bottom: var(--uui-size-layout-1);
    }

    .stat-card {
      flex: 1;
      min-width: 160px;
      padding: 20px 24px;
      background: var(--uui-color-surface-alt, #f8f9fa);
      border: 1px solid var(--uui-color-border, #dee2e6);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat-value {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--uui-color-text);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--uui-color-text-alt);
      margin-top: 6px;
    }

    .toolbar {
      display: flex;
      gap: var(--uui-size-4);
      align-items: center;
      margin-bottom: var(--uui-size-4);
    }

    .empty-state {
      padding: 32px;
      text-align: center;
      color: var(--uui-color-text-alt);
    }

    uui-table {
      width: 100%;
    }
  `;
u([
  c()
], o.prototype, "_loading", 2);
u([
  c()
], o.prototype, "_stats", 2);
u([
  c()
], o.prototype, "_daily", 2);
u([
  c()
], o.prototype, "_error", 2);
u([
  c()
], o.prototype, "_days", 2);
o = u([
  b("visitor-counter-dashboard")
], o);
export {
  o as VisitorCounterDashboardElement
};

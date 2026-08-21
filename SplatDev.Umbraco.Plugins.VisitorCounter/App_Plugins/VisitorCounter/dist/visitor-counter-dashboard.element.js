import { LitElement as v, html as u, css as y, state as h, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as x } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as T } from "@umbraco-cms/backoffice/notification";
function C(t) {
  let e = null, a = null;
  const o = t.consumeContext.bind(t), i = new Promise((r) => {
    o(x, async (s) => {
      var d;
      try {
        e = await ((d = s == null ? void 0 : s.getLatestToken) == null ? void 0 : d.call(s)) ?? null;
      } catch {
        e = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return o(T, (r) => {
    a = r;
  }), async (r, s = {}) => {
    await i;
    const d = new Headers(s.headers);
    e && !d.has("Authorization") && d.set("Authorization", `Bearer ${e}`);
    const n = await fetch(r, { ...s, credentials: "same-origin", headers: d });
    if (!n.ok) {
      const _ = n.status === 401 || n.status === 403, g = _ ? "Not authorised" : "Could not load data", b = _ ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(r)} — ${b}`), a == null || a.peek("danger", { data: { headline: g, message: b } });
    }
    return n;
  };
}
var k = Object.defineProperty, E = Object.getOwnPropertyDescriptor, f = (t) => {
  throw TypeError(t);
}, c = (t, e, a, o) => {
  for (var i = o > 1 ? void 0 : o ? E(e, a) : e, r = t.length - 1, s; r >= 0; r--)
    (s = t[r]) && (i = (o ? s(e, a, i) : s(i)) || i);
  return o && i && k(e, a, i), i;
}, z = (t, e, a) => e.has(t) || f("Cannot " + a), m = (t, e, a) => (z(t, e, "read from private field"), a ? a.call(t) : e.get(t)), S = (t, e, a) => e.has(t) ? f("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), p;
let l = class extends $(v) {
  constructor() {
    super(...arguments), S(this, p, C(this)), this._loading = !1, this._stats = null, this._daily = [], this._error = null, this._days = 30;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0, this._error = null;
    try {
      const [t, e] = await Promise.all([
        m(this, p).call(this, `/umbraco/api/visitorcounter/GetStats?days=${this._days}`),
        m(this, p).call(this, `/umbraco/api/visitorcounter/GetDailyCounts?days=${this._days}`)
      ]);
      if (!t.ok) throw new Error(`Stats HTTP ${t.status}`);
      if (!e.ok) throw new Error(`Daily HTTP ${e.status}`);
      this._stats = await t.json();
      const a = await e.json();
      this._daily = a.slice().sort((o, i) => i.date.localeCompare(o.date));
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Unknown error";
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return u`
      <h1>Visitor Counter</h1>
      <p class="description">Site visitor statistics for the last ${this._days} days.</p>

      ${this._stats ? u`
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

        ${this._error ? u`<uui-tag color="danger">${this._error}</uui-tag>` : this._loading ? u`<uui-loader></uui-loader>` : this._daily.length === 0 ? u`<div class="empty-state">No visitor data recorded yet.</div>` : u`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Date</uui-table-head-cell>
                  <uui-table-head-cell>Total Visits</uui-table-head-cell>
                  <uui-table-head-cell>Unique Visitors</uui-table-head-cell>
                </uui-table-head>
                ${this._daily.map(
      (t) => u`
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
p = /* @__PURE__ */ new WeakMap();
l.styles = y`
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
c([
  h()
], l.prototype, "_loading", 2);
c([
  h()
], l.prototype, "_stats", 2);
c([
  h()
], l.prototype, "_daily", 2);
c([
  h()
], l.prototype, "_error", 2);
c([
  h()
], l.prototype, "_days", 2);
l = c([
  w("visitor-counter-dashboard")
], l);
export {
  l as VisitorCounterDashboardElement
};

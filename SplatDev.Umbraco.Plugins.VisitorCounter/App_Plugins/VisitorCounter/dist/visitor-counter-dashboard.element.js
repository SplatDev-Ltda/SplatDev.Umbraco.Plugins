import { LitElement as d, html as s, css as p, state as u, customElement as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, r = (t, e, o, l) => {
  for (var a = l > 1 ? void 0 : l ? _(e, o) : e, n = t.length - 1, c; n >= 0; n--)
    (c = t[n]) && (a = (l ? c(e, o, a) : c(a)) || a);
  return l && a && g(e, o, a), a;
};
let i = class extends b(d) {
  constructor() {
    super(...arguments), this._loading = !1, this._stats = null, this._daily = [], this._error = null, this._days = 30;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0, this._error = null;
    try {
      const [t, e] = await Promise.all([
        fetch(`/umbraco/api/visitorcounter/GetStats?days=${this._days}`),
        fetch(`/umbraco/api/visitorcounter/GetDailyCounts?days=${this._days}`)
      ]);
      if (!t.ok) throw new Error(`Stats HTTP ${t.status}`);
      if (!e.ok) throw new Error(`Daily HTTP ${e.status}`);
      this._stats = await t.json();
      const o = await e.json();
      this._daily = o.slice().sort((l, a) => a.date.localeCompare(l.date));
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Unknown error";
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return s`
      <h1>Visitor Counter</h1>
      <p class="description">Site visitor statistics for the last ${this._days} days.</p>

      ${this._stats ? s`
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

        ${this._error ? s`<uui-tag color="danger">${this._error}</uui-tag>` : this._loading ? s`<uui-loader></uui-loader>` : this._daily.length === 0 ? s`<div class="empty-state">No visitor data recorded yet.</div>` : s`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Date</uui-table-head-cell>
                  <uui-table-head-cell>Total Visits</uui-table-head-cell>
                  <uui-table-head-cell>Unique Visitors</uui-table-head-cell>
                </uui-table-head>
                ${this._daily.map(
      (t) => s`
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
i.styles = p`
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
r([
  u()
], i.prototype, "_loading", 2);
r([
  u()
], i.prototype, "_stats", 2);
r([
  u()
], i.prototype, "_daily", 2);
r([
  u()
], i.prototype, "_error", 2);
r([
  u()
], i.prototype, "_days", 2);
i = r([
  h("visitor-counter-dashboard")
], i);
export {
  i as VisitorCounterDashboardElement
};

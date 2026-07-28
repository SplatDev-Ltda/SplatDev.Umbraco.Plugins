import { LitElement as d, html as o, css as h, state as r, customElement as p } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
var _ = Object.defineProperty, g = Object.getOwnPropertyDescriptor, i = (e, t, s, u) => {
  for (var l = u > 1 ? void 0 : u ? g(t, s) : t, n = e.length - 1, c; n >= 0; n--)
    (c = e[n]) && (l = (u ? c(t, s, l) : c(l)) || l);
  return u && l && _(t, s, l), l;
};
let a = class extends b(d) {
  constructor() {
    super(...arguments), this._loading = !1, this._pages = [], this._error = null, this._count = 10, this._days = 30;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0, this._error = null;
    try {
      const e = `/umbraco/api/mostviewed/GetMostViewed?count=${this._count}&days=${this._days}`, t = await fetch(e);
      if (!t.ok) throw new Error(`HTTP ${t.status}`);
      this._pages = await t.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return o`
      <h1>Most Viewed</h1>
      <p class="description">Top pages by view count in the last ${this._days} days.</p>

      <uui-box>
        <div class="toolbar">
          <uui-button
            look="secondary"
            label="Refresh"
            ?disabled=${this._loading}
            @click=${this._load}
          >${this._loading ? "Loading…" : "Refresh"}</uui-button>
        </div>

        ${this._error ? o`<uui-tag color="danger">${this._error}</uui-tag>` : this._loading ? o`<uui-loader></uui-loader>` : this._pages.length === 0 ? o`<div class="empty-state">No page views recorded yet.</div>` : o`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>#</uui-table-head-cell>
                  <uui-table-head-cell>Page</uui-table-head-cell>
                  <uui-table-head-cell>URL</uui-table-head-cell>
                  <uui-table-head-cell>Views</uui-table-head-cell>
                </uui-table-head>
                ${this._pages.map(
      (e, t) => o`
                    <uui-table-row>
                      <uui-table-cell><span class="rank">${t + 1}</span></uui-table-cell>
                      <uui-table-cell>${e.nodeName}</uui-table-cell>
                      <uui-table-cell>
                        <a href="${e.nodeUrl}" target="_blank" rel="noopener">${e.nodeUrl}</a>
                      </uui-table-cell>
                      <uui-table-cell>${e.viewCount.toLocaleString()}</uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
};
a.styles = h`
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

    .toolbar {
      display: flex;
      gap: var(--uui-size-4);
      align-items: center;
      margin-bottom: var(--uui-size-4);
    }

    .rank {
      font-weight: 600;
      color: var(--uui-color-text-alt);
    }

    a {
      color: var(--uui-color-interactive);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
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
i([
  r()
], a.prototype, "_loading", 2);
i([
  r()
], a.prototype, "_pages", 2);
i([
  r()
], a.prototype, "_error", 2);
i([
  r()
], a.prototype, "_count", 2);
i([
  r()
], a.prototype, "_days", 2);
a = i([
  p("most-viewed-dashboard")
], a);
export {
  a as MostViewedDashboardElement
};

import { LitElement as d, html as l, css as p, state as s, customElement as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, o = (t, e, u, i) => {
  for (var a = i > 1 ? void 0 : i ? _(e, u) : e, n = t.length - 1, c; n >= 0; n--)
    (c = t[n]) && (a = (i ? c(e, u, a) : c(a)) || a);
  return i && a && g(e, u, a), a;
};
let r = class extends b(d) {
  constructor() {
    super(...arguments), this._loading = !1, this._topRated = [], this._error = null, this._count = 10;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0, this._error = null;
    try {
      const t = await fetch(`/umbraco/api/starratings/GetTopRated?count=${this._count}`);
      if (!t.ok) throw new Error(`HTTP ${t.status}`);
      this._topRated = await t.json();
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Unknown error";
    } finally {
      this._loading = !1;
    }
  }
  _renderStars(t) {
    const e = Math.round(t);
    return "★".repeat(e) + "☆".repeat(5 - e);
  }
  render() {
    return l`
      <h1>Star Ratings</h1>
      <p class="description">Top-rated content across your Umbraco site.</p>

      <uui-box>
        <div class="toolbar">
          <uui-button
            look="secondary"
            label="Refresh"
            ?disabled=${this._loading}
            @click=${this._load}
          >${this._loading ? "Loading…" : "Refresh"}</uui-button>
        </div>

        ${this._error ? l`<uui-tag color="danger">${this._error}</uui-tag>` : this._loading ? l`<uui-loader></uui-loader>` : this._topRated.length === 0 ? l`<div class="empty-state">No ratings recorded yet.</div>` : l`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Content Key</uui-table-head-cell>
                  <uui-table-head-cell>Stars</uui-table-head-cell>
                  <uui-table-head-cell>Average</uui-table-head-cell>
                  <uui-table-head-cell>Votes</uui-table-head-cell>
                </uui-table-head>
                ${this._topRated.map(
      (t) => l`
                    <uui-table-row>
                      <uui-table-cell>${t.contentKey}</uui-table-cell>
                      <uui-table-cell>
                        <span class="stars">${this._renderStars(t.averageRating)}</span>
                      </uui-table-cell>
                      <uui-table-cell>${t.averageRating.toFixed(1)} / 5</uui-table-cell>
                      <uui-table-cell>${t.totalVotes}</uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
};
r.styles = p`
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

    .stars {
      color: #f5a623;
      letter-spacing: 1px;
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
o([
  s()
], r.prototype, "_loading", 2);
o([
  s()
], r.prototype, "_topRated", 2);
o([
  s()
], r.prototype, "_error", 2);
o([
  s()
], r.prototype, "_count", 2);
r = o([
  h("star-ratings-dashboard")
], r);
export {
  r as StarRatingsDashboardElement
};

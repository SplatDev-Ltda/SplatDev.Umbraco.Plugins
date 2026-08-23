import { LitElement as p, html as o, css as _, state as u, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
import { c as v } from "./chunks/auth-fetch-BzMCmNwW.js";
var f = Object.defineProperty, m = Object.getOwnPropertyDescriptor, h = (t) => {
  throw TypeError(t);
}, i = (t, e, a, s) => {
  for (var r = s > 1 ? void 0 : s ? m(e, a) : e, n = t.length - 1, c; n >= 0; n--)
    (c = t[n]) && (r = (s ? c(e, a, r) : c(r)) || r);
  return s && r && f(e, a, r), r;
}, y = (t, e, a) => e.has(t) || h("Cannot " + a), x = (t, e, a) => (y(t, e, "read from private field"), a ? a.call(t) : e.get(t)), w = (t, e, a) => e.has(t) ? h("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), d;
let l = class extends g(p) {
  constructor() {
    super(...arguments), w(this, d, v(this)), this._loading = !1, this._topRated = [], this._error = null, this._count = 10;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0, this._error = null;
    try {
      const t = await x(this, d).call(this, `/umbraco/api/starratings/GetTopRated?count=${this._count}`);
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
    return o`
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

        ${this._error ? o`<uui-tag color="danger">${this._error}</uui-tag>` : this._loading ? o`<uui-loader></uui-loader>` : this._topRated.length === 0 ? o`<div class="empty-state">No ratings recorded yet.</div>` : o`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Content Key</uui-table-head-cell>
                  <uui-table-head-cell>Stars</uui-table-head-cell>
                  <uui-table-head-cell>Average</uui-table-head-cell>
                  <uui-table-head-cell>Votes</uui-table-head-cell>
                </uui-table-head>
                ${this._topRated.map(
      (t) => o`
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
d = /* @__PURE__ */ new WeakMap();
l.styles = _`
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
i([
  u()
], l.prototype, "_loading", 2);
i([
  u()
], l.prototype, "_topRated", 2);
i([
  u()
], l.prototype, "_error", 2);
i([
  u()
], l.prototype, "_count", 2);
l = i([
  b("star-ratings-dashboard")
], l);
export {
  l as StarRatingsDashboardElement
};

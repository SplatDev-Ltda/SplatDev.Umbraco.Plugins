import { LitElement as p, html as n, css as _, state as c, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as f } from "@umbraco-cms/backoffice/auth";
function v(e) {
  let t = null;
  const r = new Promise((o) => {
    e.consumeContext(f, async (a) => {
      var l;
      try {
        t = await ((l = a == null ? void 0 : a.getLatestToken) == null ? void 0 : l.call(a)) ?? null;
      } catch {
        t = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return async (o, a = {}) => {
    await r;
    const l = new Headers(a.headers);
    t && !l.has("Authorization") && l.set("Authorization", `Bearer ${t}`);
    const s = await fetch(o, { ...a, credentials: "same-origin", headers: l });
    return (s.status === 401 || s.status === 403) && console.error(
      `[SplatDev] ${s.status} from ${String(o)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), s;
  };
}
var m = Object.defineProperty, y = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, u = (e, t, r, o) => {
  for (var a = o > 1 ? void 0 : o ? y(t, r) : t, l = e.length - 1, s; l >= 0; l--)
    (s = e[l]) && (a = (o ? s(t, r, a) : s(a)) || a);
  return o && a && m(t, r, a), a;
}, w = (e, t, r) => t.has(e) || h("Cannot " + r), $ = (e, t, r) => (w(e, t, "read from private field"), r ? r.call(e) : t.get(e)), R = (e, t, r) => t.has(e) ? h("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), d;
let i = class extends g(p) {
  constructor() {
    super(...arguments), R(this, d, v(this)), this._loading = !1, this._topRated = [], this._error = null, this._count = 10;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0, this._error = null;
    try {
      const e = await $(this, d).call(this, `/umbraco/api/starratings/GetTopRated?count=${this._count}`);
      if (!e.ok) throw new Error(`HTTP ${e.status}`);
      this._topRated = await e.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      this._loading = !1;
    }
  }
  _renderStars(e) {
    const t = Math.round(e);
    return "★".repeat(t) + "☆".repeat(5 - t);
  }
  render() {
    return n`
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

        ${this._error ? n`<uui-tag color="danger">${this._error}</uui-tag>` : this._loading ? n`<uui-loader></uui-loader>` : this._topRated.length === 0 ? n`<div class="empty-state">No ratings recorded yet.</div>` : n`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Content Key</uui-table-head-cell>
                  <uui-table-head-cell>Stars</uui-table-head-cell>
                  <uui-table-head-cell>Average</uui-table-head-cell>
                  <uui-table-head-cell>Votes</uui-table-head-cell>
                </uui-table-head>
                ${this._topRated.map(
      (e) => n`
                    <uui-table-row>
                      <uui-table-cell>${e.contentKey}</uui-table-cell>
                      <uui-table-cell>
                        <span class="stars">${this._renderStars(e.averageRating)}</span>
                      </uui-table-cell>
                      <uui-table-cell>${e.averageRating.toFixed(1)} / 5</uui-table-cell>
                      <uui-table-cell>${e.totalVotes}</uui-table-cell>
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
i.styles = _`
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
u([
  c()
], i.prototype, "_loading", 2);
u([
  c()
], i.prototype, "_topRated", 2);
u([
  c()
], i.prototype, "_error", 2);
u([
  c()
], i.prototype, "_count", 2);
i = u([
  b("star-ratings-dashboard")
], i);
export {
  i as StarRatingsDashboardElement
};

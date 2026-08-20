import { LitElement as p, html as n, css as _, state as c, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as v } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as g } from "@umbraco-cms/backoffice/auth";
function m(e) {
  let t = null;
  const r = new Promise((o) => {
    e.consumeContext(g, async (a) => {
      var i;
      try {
        t = await ((i = a == null ? void 0 : a.getLatestToken) == null ? void 0 : i.call(a)) ?? null;
      } catch {
        t = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return async (o, a = {}) => {
    await r;
    const i = new Headers(a.headers);
    t && !i.has("Authorization") && i.set("Authorization", `Bearer ${t}`);
    const l = await fetch(o, { ...a, credentials: "same-origin", headers: i });
    return (l.status === 401 || l.status === 403) && console.error(
      `[SplatDev] ${l.status} from ${String(o)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), l;
  };
}
var f = Object.defineProperty, y = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, u = (e, t, r, o) => {
  for (var a = o > 1 ? void 0 : o ? y(t, r) : t, i = e.length - 1, l; i >= 0; i--)
    (l = e[i]) && (a = (o ? l(t, r, a) : l(a)) || a);
  return o && a && f(t, r, a), a;
}, w = (e, t, r) => t.has(e) || h("Cannot " + r), $ = (e, t, r) => (w(e, t, "read from private field"), r ? r.call(e) : t.get(e)), k = (e, t, r) => t.has(e) ? h("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), d;
let s = class extends v(p) {
  constructor() {
    super(...arguments), k(this, d, m(this)), this._loading = !1, this._pages = [], this._error = null, this._count = 10, this._days = 30;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0, this._error = null;
    try {
      const e = `/umbraco/api/mostviewed/GetMostViewed?count=${this._count}&days=${this._days}`, t = await $(this, d).call(this, e);
      if (!t.ok) throw new Error(`HTTP ${t.status}`);
      this._pages = await t.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return n`
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

        ${this._error ? n`<uui-tag color="danger">${this._error}</uui-tag>` : this._loading ? n`<uui-loader></uui-loader>` : this._pages.length === 0 ? n`<div class="empty-state">No page views recorded yet.</div>` : n`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>#</uui-table-head-cell>
                  <uui-table-head-cell>Page</uui-table-head-cell>
                  <uui-table-head-cell>URL</uui-table-head-cell>
                  <uui-table-head-cell>Views</uui-table-head-cell>
                </uui-table-head>
                ${this._pages.map(
      (e, t) => n`
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
d = /* @__PURE__ */ new WeakMap();
s.styles = _`
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
u([
  c()
], s.prototype, "_loading", 2);
u([
  c()
], s.prototype, "_pages", 2);
u([
  c()
], s.prototype, "_error", 2);
u([
  c()
], s.prototype, "_count", 2);
u([
  c()
], s.prototype, "_days", 2);
s = u([
  b("most-viewed-dashboard")
], s);
export {
  s as MostViewedDashboardElement
};

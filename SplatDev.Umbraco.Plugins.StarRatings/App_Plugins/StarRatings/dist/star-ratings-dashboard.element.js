import { LitElement as m, html as c, css as v, state as h, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as w } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as $ } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as T } from "@umbraco-cms/backoffice/notification";
function C(e) {
  let t = null, a = null;
  const l = e.consumeContext.bind(e), s = new Promise((o) => {
    l($, async (r) => {
      var u;
      try {
        t = await ((u = r == null ? void 0 : r.getLatestToken) == null ? void 0 : u.call(r)) ?? null;
      } catch {
        t = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return l(T, (o) => {
    a = o;
  }), async (o, r = {}) => {
    await s;
    const u = new Headers(r.headers);
    t && !u.has("Authorization") && u.set("Authorization", `Bearer ${t}`);
    const i = await fetch(o, { ...r, credentials: "same-origin", headers: u });
    if (!i.ok) {
      const b = i.status === 401 || i.status === 403, f = b ? "Not authorised" : "Could not load data", _ = b ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${i.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${i.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${i.status} from ${String(o)} — ${_}`), a == null || a.peek("danger", { data: { headline: f, message: _ } });
    }
    return i;
  };
}
var R = Object.defineProperty, k = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, d = (e, t, a, l) => {
  for (var s = l > 1 ? void 0 : l ? k(t, a) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (s = (l ? r(t, a, s) : r(s)) || s);
  return l && s && R(t, a, s), s;
}, E = (e, t, a) => t.has(e) || g("Cannot " + a), x = (e, t, a) => (E(e, t, "read from private field"), a ? a.call(e) : t.get(e)), A = (e, t, a) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), p;
let n = class extends w(m) {
  constructor() {
    super(...arguments), A(this, p, C(this)), this._loading = !1, this._topRated = [], this._error = null, this._count = 10;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0, this._error = null;
    try {
      const e = await x(this, p).call(this, `/umbraco/api/starratings/GetTopRated?count=${this._count}`);
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
    return c`
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

        ${this._error ? c`<uui-tag color="danger">${this._error}</uui-tag>` : this._loading ? c`<uui-loader></uui-loader>` : this._topRated.length === 0 ? c`<div class="empty-state">No ratings recorded yet.</div>` : c`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Content Key</uui-table-head-cell>
                  <uui-table-head-cell>Stars</uui-table-head-cell>
                  <uui-table-head-cell>Average</uui-table-head-cell>
                  <uui-table-head-cell>Votes</uui-table-head-cell>
                </uui-table-head>
                ${this._topRated.map(
      (e) => c`
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
p = /* @__PURE__ */ new WeakMap();
n.styles = v`
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
d([
  h()
], n.prototype, "_loading", 2);
d([
  h()
], n.prototype, "_topRated", 2);
d([
  h()
], n.prototype, "_error", 2);
d([
  h()
], n.prototype, "_count", 2);
n = d([
  y("star-ratings-dashboard")
], n);
export {
  n as StarRatingsDashboardElement
};

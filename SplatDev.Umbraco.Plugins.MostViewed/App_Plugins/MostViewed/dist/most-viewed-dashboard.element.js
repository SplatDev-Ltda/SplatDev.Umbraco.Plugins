import { LitElement as w, html as c, css as v, state as h, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as y } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as $ } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as T } from "@umbraco-cms/backoffice/notification";
function k(e) {
  let t = null, a = null;
  const l = e.consumeContext.bind(e), s = new Promise((r) => {
    l($, async (o) => {
      var u;
      try {
        t = await ((u = o == null ? void 0 : o.getLatestToken) == null ? void 0 : u.call(o)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return l(T, (r) => {
    a = r;
  }), async (r, o = {}) => {
    await s;
    const u = new Headers(o.headers);
    t && !u.has("Authorization") && u.set("Authorization", `Bearer ${t}`);
    const n = await fetch(r, { ...o, credentials: "same-origin", headers: u });
    if (!n.ok) {
      const _ = n.status === 401 || n.status === 403, m = _ ? "Not authorised" : "Could not load data", b = _ ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(r)} — ${b}`), a == null || a.peek("danger", { data: { headline: m, message: b } });
    }
    return n;
  };
}
var C = Object.defineProperty, x = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, d = (e, t, a, l) => {
  for (var s = l > 1 ? void 0 : l ? x(t, a) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (l ? o(t, a, s) : o(s)) || s);
  return l && s && C(t, a, s), s;
}, E = (e, t, a) => t.has(e) || g("Cannot " + a), A = (e, t, a) => (E(e, t, "read from private field"), a ? a.call(e) : t.get(e)), O = (e, t, a) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), p;
let i = class extends y(w) {
  constructor() {
    super(...arguments), O(this, p, k(this)), this._loading = !1, this._pages = [], this._error = null, this._count = 10, this._days = 30;
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0, this._error = null;
    try {
      const e = `/umbraco/api/mostviewed/GetMostViewed?count=${this._count}&days=${this._days}`, t = await A(this, p).call(this, e);
      if (!t.ok) throw new Error(`HTTP ${t.status}`);
      this._pages = await t.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return c`
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

        ${this._error ? c`<uui-tag color="danger">${this._error}</uui-tag>` : this._loading ? c`<uui-loader></uui-loader>` : this._pages.length === 0 ? c`<div class="empty-state">No page views recorded yet.</div>` : c`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>#</uui-table-head-cell>
                  <uui-table-head-cell>Page</uui-table-head-cell>
                  <uui-table-head-cell>URL</uui-table-head-cell>
                  <uui-table-head-cell>Views</uui-table-head-cell>
                </uui-table-head>
                ${this._pages.map(
      (e, t) => c`
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
p = /* @__PURE__ */ new WeakMap();
i.styles = v`
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
d([
  h()
], i.prototype, "_loading", 2);
d([
  h()
], i.prototype, "_pages", 2);
d([
  h()
], i.prototype, "_error", 2);
d([
  h()
], i.prototype, "_count", 2);
d([
  h()
], i.prototype, "_days", 2);
i = d([
  f("most-viewed-dashboard")
], i);
export {
  i as MostViewedDashboardElement
};

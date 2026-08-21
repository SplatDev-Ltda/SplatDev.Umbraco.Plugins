import { LitElement as f, html as c, css as g, state as b, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as T } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as v } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as $ } from "@umbraco-cms/backoffice/notification";
function C(e) {
  let t = null, a = null;
  const i = e.consumeContext.bind(e), r = new Promise((l) => {
    i(v, async (s) => {
      var n;
      try {
        t = await ((n = s == null ? void 0 : s.getLatestToken) == null ? void 0 : n.call(s)) ?? null;
      } catch {
        t = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return i($, (l) => {
    a = l;
  }), async (l, s = {}) => {
    await r;
    const n = new Headers(s.headers);
    t && !n.has("Authorization") && n.set("Authorization", `Bearer ${t}`);
    const o = await fetch(l, { ...s, credentials: "same-origin", headers: n });
    if (!o.ok) {
      const d = o.status === 401 || o.status === 403, _ = d ? "Not authorised" : "Could not load data", m = d ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${o.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${o.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${o.status} from ${String(l)} — ${m}`), a == null || a.peek("danger", { data: { headline: _, message: m } });
    }
    return o;
  };
}
var A = Object.defineProperty, E = Object.getOwnPropertyDescriptor, y = (e) => {
  throw TypeError(e);
}, h = (e, t, a, i) => {
  for (var r = i > 1 ? void 0 : i ? E(t, a) : t, l = e.length - 1, s; l >= 0; l--)
    (s = e[l]) && (r = (i ? s(t, a, r) : s(r)) || r);
  return i && r && A(t, a, r), r;
}, M = (e, t, a) => t.has(e) || y("Cannot " + a), k = (e, t, a) => (M(e, t, "read from private field"), a ? a.call(e) : t.get(e)), O = (e, t, a) => t.has(e) ? y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), p;
let u = class extends T(f) {
  constructor() {
    super(...arguments), O(this, p, C(this)), this._memberTypes = [], this._loading = !1, this._apiBase = "/umbraco/api/membertypes";
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await k(this, p).call(this, `${this._apiBase}/GetAll`);
      e.ok && (this._memberTypes = await e.json());
    } catch {
      this._memberTypes = [];
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return c`
      <h1>Member Types</h1>
      <p class="description">Manage custom member types and their properties.</p>

      <uui-box headline="Member Types (${this._memberTypes.length})">
        ${this._loading ? c`<p>Loading...</p>` : this._memberTypes.length === 0 ? c`<p class="empty">No member types found.</p>` : c`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Alias</uui-table-head-cell>
                  <uui-table-head-cell>Description</uui-table-head-cell>
                  <uui-table-head-cell>Properties</uui-table-head-cell>
                </uui-table-head>
                ${this._memberTypes.map(
      (e) => c`
                    <uui-table-row>
                      <uui-table-cell><strong>${e.name}</strong></uui-table-cell>
                      <uui-table-cell><code>${e.alias}</code></uui-table-cell>
                      <uui-table-cell>${e.description}</uui-table-cell>
                      <uui-table-cell>${e.propertyCount}</uui-table-cell>
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
u.styles = g`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 24px 0; }
    uui-table { width: 100%; }
  `;
h([
  b()
], u.prototype, "_memberTypes", 2);
h([
  b()
], u.prototype, "_loading", 2);
u = h([
  w("membertypes-dashboard")
], u);
const x = u;
export {
  u as MemberTypesDashboardElement,
  x as default
};

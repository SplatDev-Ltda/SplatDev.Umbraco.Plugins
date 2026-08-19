import { LitElement as d, html as u, css as m, state as c, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as y } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as _ } from "@umbraco-cms/backoffice/auth";
function f(e) {
  let t = null;
  const l = new Promise((s) => {
    e.consumeContext(_, async (a) => {
      var r;
      try {
        t = await ((r = a == null ? void 0 : a.getLatestToken) == null ? void 0 : r.call(a)) ?? null;
      } catch {
        t = null;
      }
      s();
    }), setTimeout(s, 3e3);
  });
  return async (s, a = {}) => {
    await l;
    const r = new Headers(a.headers);
    t && !r.has("Authorization") && r.set("Authorization", `Bearer ${t}`);
    const i = await fetch(s, { ...a, credentials: "same-origin", headers: r });
    return (i.status === 401 || i.status === 403) && console.error(
      `[SplatDev] ${i.status} from ${String(s)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), i;
  };
}
var g = Object.defineProperty, v = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, p = (e, t, l, s) => {
  for (var a = s > 1 ? void 0 : s ? v(t, l) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (a = (s ? i(t, l, a) : i(a)) || a);
  return s && a && g(t, l, a), a;
}, T = (e, t, l) => t.has(e) || h("Cannot " + l), w = (e, t, l) => (T(e, t, "read from private field"), l ? l.call(e) : t.get(e)), $ = (e, t, l) => t.has(e) ? h("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, l), n;
let o = class extends y(d) {
  constructor() {
    super(...arguments), $(this, n, f(this)), this._memberTypes = [], this._loading = !1, this._apiBase = "/umbraco/api/membertypes";
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await w(this, n).call(this, `${this._apiBase}/GetAll`);
      e.ok && (this._memberTypes = await e.json());
    } catch {
      this._memberTypes = [];
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return u`
      <h1>Member Types</h1>
      <p class="description">Manage custom member types and their properties.</p>

      <uui-box headline="Member Types (${this._memberTypes.length})">
        ${this._loading ? u`<p>Loading...</p>` : this._memberTypes.length === 0 ? u`<p class="empty">No member types found.</p>` : u`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Alias</uui-table-head-cell>
                  <uui-table-head-cell>Description</uui-table-head-cell>
                  <uui-table-head-cell>Properties</uui-table-head-cell>
                </uui-table-head>
                ${this._memberTypes.map(
      (e) => u`
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
n = /* @__PURE__ */ new WeakMap();
o.styles = m`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 24px 0; }
    uui-table { width: 100%; }
  `;
p([
  c()
], o.prototype, "_memberTypes", 2);
p([
  c()
], o.prototype, "_loading", 2);
o = p([
  b("membertypes-dashboard")
], o);
const A = o;
export {
  o as MemberTypesDashboardElement,
  A as default
};

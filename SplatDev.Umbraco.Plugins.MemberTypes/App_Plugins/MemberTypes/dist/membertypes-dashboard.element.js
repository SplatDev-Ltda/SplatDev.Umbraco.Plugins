import { LitElement as w, html as d, css as $, state as m, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as x } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as C } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as k } from "@umbraco-cms/backoffice/notification";
function M(e) {
  let t = null, a = null;
  const o = e.consumeContext.bind(e), l = new Promise((s) => {
    o(C, async (r) => {
      var u;
      try {
        t = await ((u = r == null ? void 0 : r.getLatestToken) == null ? void 0 : u.call(r)) ?? null;
      } catch {
        t = null;
      }
      s();
    }), setTimeout(s, 3e3);
  });
  return o(k, (s) => {
    a = s;
  }), async (s, r = {}) => {
    await l;
    const u = new Headers(r.headers);
    t && !u.has("Authorization") && u.set("Authorization", `Bearer ${t}`);
    const i = await fetch(s, { ...r, credentials: "same-origin", headers: u });
    if (!i.ok) {
      const b = i.status === 401 || i.status === 403, T = b ? "Not authorised" : "Could not load data", _ = b ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${i.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${i.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${i.status} from ${String(s)} — ${_}`), a == null || a.peek("danger", { data: { headline: T, message: _ } });
    }
    return i;
  };
}
var A = Object.defineProperty, O = Object.getOwnPropertyDescriptor, y = (e) => {
  throw TypeError(e);
}, h = (e, t, a, o) => {
  for (var l = o > 1 ? void 0 : o ? O(t, a) : t, s = e.length - 1, r; s >= 0; s--)
    (r = e[s]) && (l = (o ? r(t, a, l) : r(l)) || l);
  return o && l && A(t, a, l), l;
}, g = (e, t, a) => t.has(e) || y("Cannot " + a), D = (e, t, a) => (g(e, t, "read from private field"), a ? a.call(e) : t.get(e)), f = (e, t, a) => t.has(e) ? y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), N = (e, t, a) => (g(e, t, "access private method"), a), c, p, v;
let n = class extends x(w) {
  constructor() {
    super(...arguments), f(this, p), f(this, c, M(this)), this._memberTypes = [], this._loading = !1, this._loadError = null, this._apiBase = "/umbraco/api/membertypes";
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await D(this, c).call(this, `${this._apiBase}/GetAll`);
      N(this, p, v).call(this, e) && (this._memberTypes = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._memberTypes = [];
    } finally {
      this._loading = !1;
    }
  }
  render() {
    return d`
      ${this._loadError ? d`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>Member Types</h1>
      <p class="description">Manage custom member types and their properties.</p>

      <uui-box headline="Member Types (${this._memberTypes.length})">
        ${this._loading ? d`<p>Loading...</p>` : this._memberTypes.length === 0 ? d`<p class="empty">No member types found.</p>` : d`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Alias</uui-table-head-cell>
                  <uui-table-head-cell>Description</uui-table-head-cell>
                  <uui-table-head-cell>Properties</uui-table-head-cell>
                </uui-table-head>
                ${this._memberTypes.map(
      (e) => d`
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
c = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakSet();
v = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
n.styles = $`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 24px 0; }
    uui-table { width: 100%; }
  
    .splatdev-load-error {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0 0 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem;
      border-radius: 3px;
    }
  `;
h([
  m()
], n.prototype, "_memberTypes", 2);
h([
  m()
], n.prototype, "_loading", 2);
h([
  m()
], n.prototype, "_loadError", 2);
n = h([
  E("membertypes-dashboard")
], n);
const S = n;
export {
  n as MemberTypesDashboardElement,
  S as default
};

import { LitElement as m, html as s, css as h, state as c, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as v } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as _ } from "@umbraco-cms/backoffice/auth";
function f(e) {
  let t = null;
  const i = new Promise((r) => {
    e.consumeContext(_, async (a) => {
      var o;
      try {
        t = await ((o = a == null ? void 0 : a.getLatestToken) == null ? void 0 : o.call(a)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return async (r, a = {}) => {
    await i;
    const o = new Headers(a.headers);
    t && !o.has("Authorization") && o.set("Authorization", `Bearer ${t}`);
    const l = await fetch(r, { ...a, credentials: "same-origin", headers: o });
    return (l.status === 401 || l.status === 403) && console.error(
      `[SplatDev] ${l.status} from ${String(r)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), l;
  };
}
var w = Object.defineProperty, y = Object.getOwnPropertyDescriptor, b = (e) => {
  throw TypeError(e);
}, u = (e, t, i, r) => {
  for (var a = r > 1 ? void 0 : r ? y(t, i) : t, o = e.length - 1, l; o >= 0; o--)
    (l = e[o]) && (a = (r ? l(t, i, a) : l(a)) || a);
  return r && a && w(t, i, a), a;
}, x = (e, t, i) => t.has(e) || b("Cannot " + i), p = (e, t, i) => (x(e, t, "read from private field"), i ? i.call(e) : t.get(e)), P = (e, t, i) => t.has(e) ? b("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), d;
let n = class extends v(m) {
  constructor() {
    super(...arguments), P(this, d, f(this)), this._activeTab = "overview", this._pending = [], this._loading = !1, this._result = null, this._apiBase = "/umbraco/api/memberregistration";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPending();
  }
  async _loadPending() {
    try {
      const e = await p(this, d).call(this, `${this._apiBase}/GetPending`);
      e.ok && (this._pending = await e.json());
    } catch {
      this._pending = [];
    }
  }
  async _approveMember(e) {
    await p(this, d).call(this, `${this._apiBase}/Approve?memberId=${e}`, { method: "POST" }), await this._loadPending();
  }
  _formatDate(e) {
    return new Date(e).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
  _renderOverview() {
    return s`
      <uui-box headline="Member Registration Plugin">
        <p>Provides member registration functionality:</p>
        <ul>
          <li>Registration form with email/username validation</li>
          <li>Email verification tokens (stored in DB schema: memberreg)</li>
          <li>Admin approval workflow</li>
          <li>Pending member management</li>
        </ul>
        <h4>API Endpoints</h4>
        <ul>
          <li><code>POST /umbraco/api/memberregistration/Register</code></li>
          <li><code>POST /umbraco/api/memberregistration/VerifyEmail</code></li>
          <li><code>POST /umbraco/api/memberregistration/Approve?memberId=X</code></li>
          <li><code>GET /umbraco/api/memberregistration/GetPending</code></li>
        </ul>
      </uui-box>
    `;
  }
  _renderPending() {
    return s`
      <uui-box headline="Pending Members (${this._pending.length})">
        ${this._pending.length === 0 ? s`<p style="color:var(--uui-color-text-alt,#6b7280)">No pending members.</p>` : s`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Email</uui-table-head-cell>
                  <uui-table-head-cell>Username</uui-table-head-cell>
                  <uui-table-head-cell>Registered</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._pending.map(
      (e) => s`
                    <uui-table-row>
                      <uui-table-cell>${e.name}</uui-table-cell>
                      <uui-table-cell>${e.email}</uui-table-cell>
                      <uui-table-cell>${e.username}</uui-table-cell>
                      <uui-table-cell>${this._formatDate(e.createDate)}</uui-table-cell>
                      <uui-table-cell>
                        <uui-button look="positive" label="Approve" @click=${() => this._approveMember(e.id)}>
                          Approve
                        </uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
  render() {
    return s`
      <h1>Member Registration Manager</h1>
      <p class="description">Manage member registration and approval workflow.</p>

      <div class="tabs">
        <div class="tab ${this._activeTab === "overview" ? "active" : ""}" @click=${() => {
      this._activeTab = "overview";
    }}>Overview</div>
        <div class="tab ${this._activeTab === "pending" ? "active" : ""}" @click=${() => {
      this._activeTab = "pending", this._loadPending();
    }}>
          Pending <span class="badge">${this._pending.length}</span>
        </div>
      </div>

      ${this._activeTab === "overview" ? this._renderOverview() : this._renderPending()}
    `;
  }
};
d = /* @__PURE__ */ new WeakMap();
n.styles = h`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .tabs { display: flex; gap: 0; border-bottom: 2px solid var(--uui-color-border, #e5e7eb); margin-bottom: 24px; }
    .tab { padding: 10px 20px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-weight: 500; }
    .tab.active { border-bottom-color: var(--uui-color-focus, #1a56db); color: var(--uui-color-focus, #1a56db); }
    .form-row { margin-bottom: 16px; }
    .form-row label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 0.875rem; }
    .result { padding: 12px 16px; border-radius: 6px; margin-top: 12px; }
    .result.success { background: #d1fae5; color: #065f46; }
    .result.error { background: #fde8e8; color: #c81e1e; }
    .badge { display: inline-flex; align-items: center; justify-content: center; background: #1a56db; color: #fff; border-radius: 9999px; font-size: 0.75rem; padding: 0 6px; min-width: 20px; margin-left: 4px; }
  `;
u([
  c()
], n.prototype, "_activeTab", 2);
u([
  c()
], n.prototype, "_pending", 2);
u([
  c()
], n.prototype, "_loading", 2);
u([
  c()
], n.prototype, "_result", 2);
n = u([
  g("memberregistration-dashboard")
], n);
const E = n;
export {
  n as MemberRegistrationDashboardElement,
  E as default
};

import { LitElement as _, html as d, css as w, state as b, customElement as y } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as T } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as $ } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as x } from "@umbraco-cms/backoffice/notification";
function P(e) {
  let t = null, a = null;
  const l = e.consumeContext.bind(e), o = new Promise((r) => {
    l($, async (i) => {
      var u;
      try {
        t = await ((u = i == null ? void 0 : i.getLatestToken) == null ? void 0 : u.call(i)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return l(x, (r) => {
    a = r;
  }), async (r, i = {}) => {
    await o;
    const u = new Headers(i.headers);
    t && !u.has("Authorization") && u.set("Authorization", `Bearer ${t}`);
    const s = await fetch(r, { ...i, credentials: "same-origin", headers: u });
    if (!s.ok) {
      const m = s.status === 401 || s.status === 403, f = m ? "Not authorised" : "Could not load data", h = m ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${s.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${s.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${s.status} from ${String(r)} — ${h}`), a == null || a.peek("danger", { data: { headline: f, message: h } });
    }
    return s;
  };
}
var k = Object.defineProperty, A = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, c = (e, t, a, l) => {
  for (var o = l > 1 ? void 0 : l ? A(t, a) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (o = (l ? i(t, a, o) : i(o)) || o);
  return l && o && k(t, a, o), o;
}, O = (e, t, a) => t.has(e) || v("Cannot " + a), g = (e, t, a) => (O(e, t, "read from private field"), a ? a.call(e) : t.get(e)), E = (e, t, a) => t.has(e) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), p;
let n = class extends T(_) {
  constructor() {
    super(...arguments), E(this, p, P(this)), this._activeTab = "overview", this._pending = [], this._loading = !1, this._result = null, this._apiBase = "/umbraco/api/memberregistration";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPending();
  }
  async _loadPending() {
    try {
      const e = await g(this, p).call(this, `${this._apiBase}/GetPending`);
      e.ok && (this._pending = await e.json());
    } catch {
      this._pending = [];
    }
  }
  async _approveMember(e) {
    await g(this, p).call(this, `${this._apiBase}/Approve?memberId=${e}`, { method: "POST" }), await this._loadPending();
  }
  _formatDate(e) {
    return new Date(e).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
  _renderOverview() {
    return d`
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
    return d`
      <uui-box headline="Pending Members (${this._pending.length})">
        ${this._pending.length === 0 ? d`<p style="color:var(--uui-color-text-alt,#6b7280)">No pending members.</p>` : d`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Email</uui-table-head-cell>
                  <uui-table-head-cell>Username</uui-table-head-cell>
                  <uui-table-head-cell>Registered</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._pending.map(
      (e) => d`
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
    return d`
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
p = /* @__PURE__ */ new WeakMap();
n.styles = w`
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
c([
  b()
], n.prototype, "_activeTab", 2);
c([
  b()
], n.prototype, "_pending", 2);
c([
  b()
], n.prototype, "_loading", 2);
c([
  b()
], n.prototype, "_result", 2);
n = c([
  y("memberregistration-dashboard")
], n);
const B = n;
export {
  n as MemberRegistrationDashboardElement,
  B as default
};

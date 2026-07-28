import { LitElement as c, html as a, css as b, state as n, customElement as p } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, h = Object.getOwnPropertyDescriptor, r = (e, l, s, o) => {
  for (var t = o > 1 ? void 0 : o ? h(l, s) : l, u = e.length - 1, d; u >= 0; u--)
    (d = e[u]) && (t = (o ? d(l, s, t) : d(t)) || t);
  return o && t && g(l, s, t), t;
};
let i = class extends m(c) {
  constructor() {
    super(...arguments), this._activeTab = "overview", this._pending = [], this._loading = !1, this._result = null, this._apiBase = "/umbraco/api/memberregistration";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPending();
  }
  async _loadPending() {
    try {
      const e = await fetch(`${this._apiBase}/GetPending`);
      e.ok && (this._pending = await e.json());
    } catch {
      this._pending = [];
    }
  }
  async _approveMember(e) {
    await fetch(`${this._apiBase}/Approve?memberId=${e}`, { method: "POST" }), await this._loadPending();
  }
  _formatDate(e) {
    return new Date(e).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
  _renderOverview() {
    return a`
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
    return a`
      <uui-box headline="Pending Members (${this._pending.length})">
        ${this._pending.length === 0 ? a`<p style="color:var(--uui-color-text-alt,#6b7280)">No pending members.</p>` : a`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Email</uui-table-head-cell>
                  <uui-table-head-cell>Username</uui-table-head-cell>
                  <uui-table-head-cell>Registered</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._pending.map(
      (e) => a`
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
    return a`
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
i.styles = b`
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
r([
  n()
], i.prototype, "_activeTab", 2);
r([
  n()
], i.prototype, "_pending", 2);
r([
  n()
], i.prototype, "_loading", 2);
r([
  n()
], i.prototype, "_result", 2);
i = r([
  p("memberregistration-dashboard")
], i);
const _ = i;
export {
  i as MemberRegistrationDashboardElement,
  _ as default
};

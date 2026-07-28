import { LitElement as c, html as t, css as m, state as d, customElement as p } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, h = Object.getOwnPropertyDescriptor, l = (e, o, i, s) => {
  for (var r = s > 1 ? void 0 : s ? h(o, i) : o, n = e.length - 1, u; n >= 0; n--)
    (u = e[n]) && (r = (s ? u(o, i, r) : u(r)) || r);
  return s && r && g(o, i, r), r;
};
let a = class extends b(c) {
  constructor() {
    super(...arguments), this._activeTab = "overview", this._result = null, this._loading = !1, this._apiBase = "/umbraco/api/memberlogin";
  }
  async _callApi(e, o) {
    this._loading = !0, this._result = null;
    try {
      const i = await fetch(`${this._apiBase}/${e}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(o)
      }), s = await i.json();
      this._result = {
        success: i.ok,
        message: s.message ?? (i.ok ? "Success" : "Request failed")
      };
    } catch {
      this._result = { success: !1, message: "Network error." };
    } finally {
      this._loading = !1;
    }
  }
  _renderOverview() {
    return t`
      <uui-box headline="Member Login Plugin">
        <p>Provides custom member login functionality:</p>
        <ul>
          <li>Login with remember me support</li>
          <li>Forgot password with token-based email reset</li>
          <li>Account lockout detection and messaging</li>
          <li>Approval workflow support</li>
        </ul>
        <h4>API Endpoints</h4>
        <ul>
          <li><code>POST /umbraco/api/memberlogin/Login</code></li>
          <li><code>POST /umbraco/api/memberlogin/Logout</code></li>
          <li><code>POST /umbraco/api/memberlogin/ForgotPassword</code></li>
          <li><code>POST /umbraco/api/memberlogin/ResetPassword</code></li>
        </ul>
      </uui-box>
    `;
  }
  _renderTestLogin() {
    return t`
      <uui-box headline="Test Login">
        <div class="form-row">
          <label>Username / Email</label>
          <uui-input id="loginUsername" placeholder="username or email"></uui-input>
        </div>
        <div class="form-row">
          <label>Password</label>
          <uui-input id="loginPassword" type="password" placeholder="password"></uui-input>
        </div>
        <uui-button
          look="primary"
          label="Test Login"
          ?disabled=${this._loading}
          @click=${() => {
      var e, o, i, s;
      return this._callApi("Login", {
        username: ((o = (e = this.shadowRoot) == null ? void 0 : e.getElementById("loginUsername")) == null ? void 0 : o.value) ?? "",
        password: ((s = (i = this.shadowRoot) == null ? void 0 : i.getElementById("loginPassword")) == null ? void 0 : s.value) ?? "",
        rememberMe: !1
      });
    }}
        >Test Login</uui-button>
        ${this._result ? t`<div class="result ${this._result.success ? "success" : "error"}">${this._result.message}</div>` : ""}
      </uui-box>
    `;
  }
  _renderForgotPassword() {
    return t`
      <uui-box headline="Forgot Password">
        <div class="form-row">
          <label>Email Address</label>
          <uui-input id="forgotEmail" type="email" placeholder="member@example.com"></uui-input>
        </div>
        <uui-button
          look="primary"
          label="Send Reset Link"
          ?disabled=${this._loading}
          @click=${() => {
      var e, o;
      return this._callApi("ForgotPassword", {
        email: ((o = (e = this.shadowRoot) == null ? void 0 : e.getElementById("forgotEmail")) == null ? void 0 : o.value) ?? ""
      });
    }}
        >Send Reset Link</uui-button>
        ${this._result ? t`<div class="result ${this._result.success ? "success" : "error"}">${this._result.message}</div>` : ""}
      </uui-box>
    `;
  }
  render() {
    return t`
      <h1>Member Login Manager</h1>
      <p class="description">Manage member login and password reset from the Umbraco backoffice.</p>

      <div class="tabs">
        ${["overview", "test-login", "forgot-password"].map(
      (e) => t`
            <div
              class="tab ${this._activeTab === e ? "active" : ""}"
              @click=${() => {
        this._activeTab = e, this._result = null;
      }}
            >${{ overview: "Overview", "test-login": "Test Login", "forgot-password": "Forgot Password" }[e]}</div>
          `
    )}
      </div>

      ${this._activeTab === "overview" ? this._renderOverview() : this._activeTab === "test-login" ? this._renderTestLogin() : this._renderForgotPassword()}
    `;
  }
};
a.styles = m`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .form-row { margin-bottom: 16px; }
    .form-row label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 0.875rem; }
    .result { padding: 12px 16px; border-radius: 6px; margin-top: 12px; }
    .result.success { background: #d1fae5; color: #065f46; }
    .result.error { background: #fde8e8; color: #c81e1e; }
    .tabs { display: flex; gap: 0; border-bottom: 2px solid var(--uui-color-border, #e5e7eb); margin-bottom: 24px; }
    .tab { padding: 10px 20px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-weight: 500; }
    .tab.active { border-bottom-color: var(--uui-color-focus, #1a56db); color: var(--uui-color-focus, #1a56db); }
  `;
l([
  d()
], a.prototype, "_activeTab", 2);
l([
  d()
], a.prototype, "_result", 2);
l([
  d()
], a.prototype, "_loading", 2);
a = l([
  p("memberlogin-dashboard")
], a);
const f = a;
export {
  a as MemberLoginDashboardElement,
  f as default
};

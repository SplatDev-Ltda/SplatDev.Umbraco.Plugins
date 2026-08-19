import { LitElement as p, html as l, css as h, state as c, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as v } from "@umbraco-cms/backoffice/auth";
function f(e) {
  let o = null;
  const t = new Promise((s) => {
    e.consumeContext(v, async (r) => {
      var i;
      try {
        o = await ((i = r == null ? void 0 : r.getLatestToken) == null ? void 0 : i.call(r)) ?? null;
      } catch {
        o = null;
      }
      s();
    }), setTimeout(s, 3e3);
  });
  return async (s, r = {}) => {
    await t;
    const i = new Headers(r.headers);
    o && !i.has("Authorization") && i.set("Authorization", `Bearer ${o}`);
    const a = await fetch(s, { ...r, credentials: "same-origin", headers: i });
    return (a.status === 401 || a.status === 403) && console.error(
      `[SplatDev] ${a.status} from ${String(s)} — the backoffice token was ${o ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), a;
  };
}
var _ = Object.defineProperty, w = Object.getOwnPropertyDescriptor, m = (e) => {
  throw TypeError(e);
}, u = (e, o, t, s) => {
  for (var r = s > 1 ? void 0 : s ? w(o, t) : o, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (r = (s ? a(o, t, r) : a(r)) || r);
  return s && r && _(o, t, r), r;
}, y = (e, o, t) => o.has(e) || m("Cannot " + t), T = (e, o, t) => (y(e, o, "read from private field"), t ? t.call(e) : o.get(e)), P = (e, o, t) => o.has(e) ? m("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(e) : o.set(e, t), d;
let n = class extends b(p) {
  constructor() {
    super(...arguments), P(this, d, f(this)), this._activeTab = "overview", this._result = null, this._loading = !1, this._apiBase = "/umbraco/api/memberlogin";
  }
  async _callApi(e, o) {
    this._loading = !0, this._result = null;
    try {
      const t = await T(this, d).call(this, `${this._apiBase}/${e}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(o)
      }), s = await t.json();
      this._result = {
        success: t.ok,
        message: s.message ?? (t.ok ? "Success" : "Request failed")
      };
    } catch {
      this._result = { success: !1, message: "Network error." };
    } finally {
      this._loading = !1;
    }
  }
  _renderOverview() {
    return l`
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
    return l`
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
      var e, o, t, s;
      return this._callApi("Login", {
        username: ((o = (e = this.shadowRoot) == null ? void 0 : e.getElementById("loginUsername")) == null ? void 0 : o.value) ?? "",
        password: ((s = (t = this.shadowRoot) == null ? void 0 : t.getElementById("loginPassword")) == null ? void 0 : s.value) ?? "",
        rememberMe: !1
      });
    }}
        >Test Login</uui-button>
        ${this._result ? l`<div class="result ${this._result.success ? "success" : "error"}">${this._result.message}</div>` : ""}
      </uui-box>
    `;
  }
  _renderForgotPassword() {
    return l`
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
        ${this._result ? l`<div class="result ${this._result.success ? "success" : "error"}">${this._result.message}</div>` : ""}
      </uui-box>
    `;
  }
  render() {
    return l`
      <h1>Member Login Manager</h1>
      <p class="description">Manage member login and password reset from the Umbraco backoffice.</p>

      <div class="tabs">
        ${["overview", "test-login", "forgot-password"].map(
      (e) => l`
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
d = /* @__PURE__ */ new WeakMap();
n.styles = h`
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
u([
  c()
], n.prototype, "_activeTab", 2);
u([
  c()
], n.prototype, "_result", 2);
u([
  c()
], n.prototype, "_loading", 2);
n = u([
  g("memberlogin-dashboard")
], n);
const L = n;
export {
  n as MemberLoginDashboardElement,
  L as default
};

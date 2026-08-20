import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

@customElement("memberlogin-dashboard")
export class MemberLoginDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
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

  @state() private _activeTab: string = "overview";
  @state() private _result: { success: boolean; message: string } | null = null;
  @state() private _loading: boolean = false;

  private _apiBase = "/umbraco/api/memberlogin";

  private async _callApi(action: string, body: object): Promise<void> {
    this._loading = true;
    this._result = null;
    try {
      const resp = await this.#fetch(`${this._apiBase}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      this._result = {
        success: resp.ok,
        message: data.message ?? (resp.ok ? "Success" : "Request failed"),
      };
    } catch {
      this._result = { success: false, message: "Network error." };
    } finally {
      this._loading = false;
    }
  }

  private _renderOverview() {
    return html`
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

  private _renderTestLogin() {
    return html`
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
          @click=${() =>
            this._callApi("Login", {
              username: (this.shadowRoot?.getElementById("loginUsername") as HTMLInputElement)?.value ?? "",
              password: (this.shadowRoot?.getElementById("loginPassword") as HTMLInputElement)?.value ?? "",
              rememberMe: false,
            })}
        >Test Login</uui-button>
        ${this._result
          ? html`<div class="result ${this._result.success ? "success" : "error"}">${this._result.message}</div>`
          : ""}
      </uui-box>
    `;
  }

  private _renderForgotPassword() {
    return html`
      <uui-box headline="Forgot Password">
        <div class="form-row">
          <label>Email Address</label>
          <uui-input id="forgotEmail" type="email" placeholder="member@example.com"></uui-input>
        </div>
        <uui-button
          look="primary"
          label="Send Reset Link"
          ?disabled=${this._loading}
          @click=${() =>
            this._callApi("ForgotPassword", {
              email: (this.shadowRoot?.getElementById("forgotEmail") as HTMLInputElement)?.value ?? "",
            })}
        >Send Reset Link</uui-button>
        ${this._result
          ? html`<div class="result ${this._result.success ? "success" : "error"}">${this._result.message}</div>`
          : ""}
      </uui-box>
    `;
  }

  override render() {
    return html`
      <h1>Member Login Manager</h1>
      <p class="description">Manage member login and password reset from the Umbraco backoffice.</p>

      <div class="tabs">
        ${["overview", "test-login", "forgot-password"].map(
          (tab) => html`
            <div
              class="tab ${this._activeTab === tab ? "active" : ""}"
              @click=${() => { this._activeTab = tab; this._result = null; }}
            >${{ overview: "Overview", "test-login": "Test Login", "forgot-password": "Forgot Password" }[tab]}</div>
          `
        )}
      </div>

      ${this._activeTab === "overview"
        ? this._renderOverview()
        : this._activeTab === "test-login"
        ? this._renderTestLogin()
        : this._renderForgotPassword()}
    `;
  }
}

export default MemberLoginDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "memberlogin-dashboard": MemberLoginDashboardElement;
  }
}

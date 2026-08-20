import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface PendingMember {
  id: number;
  name: string;
  email: string;
  username: string;
  createDate: string;
}

@customElement("memberregistration-dashboard")
export class MemberRegistrationDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
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

  @state() private _activeTab: string = "overview";
  @state() private _pending: PendingMember[] = [];
  @state() private _loading: boolean = false;
  @state() private _result: { success: boolean; message: string } | null = null;

  private _apiBase = "/umbraco/api/memberregistration";

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadPending();
  }

  private async _loadPending(): Promise<void> {
    try {
      const resp = await this.#fetch(`${this._apiBase}/GetPending`);
      if (resp.ok) this._pending = await resp.json();
    } catch {
      this._pending = [];
    }
  }

  private async _approveMember(id: number): Promise<void> {
    await this.#fetch(`${this._apiBase}/Approve?memberId=${id}`, { method: "POST" });
    await this._loadPending();
  }

  private _formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  private _renderOverview() {
    return html`
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

  private _renderPending() {
    return html`
      <uui-box headline="Pending Members (${this._pending.length})">
        ${this._pending.length === 0
          ? html`<p style="color:var(--uui-color-text-alt,#6b7280)">No pending members.</p>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Email</uui-table-head-cell>
                  <uui-table-head-cell>Username</uui-table-head-cell>
                  <uui-table-head-cell>Registered</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._pending.map(
                  (m) => html`
                    <uui-table-row>
                      <uui-table-cell>${m.name}</uui-table-cell>
                      <uui-table-cell>${m.email}</uui-table-cell>
                      <uui-table-cell>${m.username}</uui-table-cell>
                      <uui-table-cell>${this._formatDate(m.createDate)}</uui-table-cell>
                      <uui-table-cell>
                        <uui-button look="positive" label="Approve" @click=${() => this._approveMember(m.id)}>
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

  override render() {
    return html`
      <h1>Member Registration Manager</h1>
      <p class="description">Manage member registration and approval workflow.</p>

      <div class="tabs">
        <div class="tab ${this._activeTab === "overview" ? "active" : ""}" @click=${() => { this._activeTab = "overview"; }}>Overview</div>
        <div class="tab ${this._activeTab === "pending" ? "active" : ""}" @click=${() => { this._activeTab = "pending"; this._loadPending(); }}>
          Pending <span class="badge">${this._pending.length}</span>
        </div>
      </div>

      ${this._activeTab === "overview" ? this._renderOverview() : this._renderPending()}
    `;
  }
}

export default MemberRegistrationDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "memberregistration-dashboard": MemberRegistrationDashboardElement;
  }
}

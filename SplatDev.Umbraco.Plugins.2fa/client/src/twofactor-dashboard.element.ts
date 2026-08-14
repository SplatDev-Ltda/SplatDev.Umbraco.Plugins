import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

/**
 * Administrative view of member 2FA.
 *
 * Enrolment and backup-code generation are intentionally absent. They used to live here,
 * calling unauthenticated endpoints with a member id typed into the box, which meant this
 * dashboard could read any member's TOTP secret. Those operations now belong to the member,
 * on member-authenticated routes. What remains is what an administrator actually needs:
 * see whether someone is enrolled, and revoke it when they lose their device.
 */
@customElement("twofactor-dashboard")
export class TwoFactorDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .input-row { display: flex; gap: 10px; align-items: center; margin-bottom: 20px; }
    .status-badge { display: inline-block; padding: 4px 14px; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; }
    .status-badge.enabled { background: #d1fae5; color: #065f46; }
    .status-badge.disabled { background: #fef3c7; color: #92400e; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-bottom: 16px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .action-row { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
    .hint { color: var(--uui-color-text-alt, #6b7280); margin-top: 12px; font-size: 0.9rem; }
  `;

  @state() private _memberId = "";
  @state() private _status: boolean | null = null;
  @state() private _loading = false;
  @state() private _message: { type: "success" | "error"; text: string } | null = null;

  private readonly _api = "/umbraco/api/twofactor/admin";

  private async _checkStatus(): Promise<void> {
    if (!this._memberId) return;
    this._loading = true;
    this._message = null;
    try {
      const r = await fetch(
        `${this._api}/IsEnabled?memberId=${encodeURIComponent(this._memberId)}`,
        { credentials: "same-origin" },
      );
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json();
      this._status = d.enabled;
    } catch {
      this._status = null;
      this._message = { type: "error", text: "Could not read 2FA status for that member." };
    } finally {
      this._loading = false;
    }
  }

  private async _disable(): Promise<void> {
    if (!confirm("Revoke 2FA for this member? They will need to enrol again.")) return;
    this._loading = true;
    try {
      const r = await fetch(
        `${this._api}/Disable?memberId=${encodeURIComponent(this._memberId)}`,
        { method: "POST", credentials: "same-origin" },
      );
      if (!r.ok) throw new Error(String(r.status));
      this._status = false;
      this._message = { type: "success", text: "2FA revoked for member." };
    } catch {
      this._message = { type: "error", text: "Could not revoke 2FA." };
    } finally {
      this._loading = false;
    }
  }

  override render() {
    return html`
      <h1>Two-Factor Authentication</h1>
      <p class="description">
        Check whether a member has TOTP enrolled, and revoke it if they have lost their device.
      </p>

      <uui-box headline="Member Lookup">
        <div class="input-row">
          <input type="number" .value=${this._memberId}
            @input=${(e: InputEvent) => (this._memberId = (e.target as HTMLInputElement).value)}
            placeholder="Member ID" style="width:140px;padding:8px;border:1px solid #d1d5db;border-radius:4px;" />
          <uui-button look="secondary" ?disabled=${!this._memberId || this._loading}
            @click=${this._checkStatus}>Check Status</uui-button>
        </div>
      </uui-box>

      ${this._message
        ? html`<div class="msg ${this._message.type}" style="margin-top:12px;">${this._message.text}</div>`
        : ""}

      ${this._status !== null
        ? html`
            <uui-box headline="2FA Status" style="margin-top:16px;">
              <span class="status-badge ${this._status ? "enabled" : "disabled"}">
                ${this._status ? "Enabled" : "Not enrolled"}
              </span>

              ${this._status
                ? html`
                    <div class="action-row">
                      <uui-button look="danger" @click=${this._disable} ?disabled=${this._loading}>
                        Revoke 2FA
                      </uui-button>
                    </div>
                  `
                : html`
                    <p class="hint">
                      This member has not enrolled. Enrolment happens on the member's own
                      account page, not from the backoffice.
                    </p>
                  `}
            </uui-box>
          `
        : ""}
    `;
  }
}

export default TwoFactorDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "twofactor-dashboard": TwoFactorDashboardElement;
  }
}

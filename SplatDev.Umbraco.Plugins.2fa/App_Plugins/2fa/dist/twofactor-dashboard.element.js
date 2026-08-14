import { LitElement as m, html as o, css as p, state as n, customElement as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as h } from "@umbraco-cms/backoffice/element-api";
var b = Object.defineProperty, g = Object.getOwnPropertyDescriptor, i = (e, a, l, r) => {
  for (var s = r > 1 ? void 0 : r ? g(a, l) : a, d = e.length - 1, u; d >= 0; d--)
    (u = e[d]) && (s = (r ? u(a, l, s) : u(s)) || s);
  return r && s && b(a, l, s), s;
};
let t = class extends h(m) {
  constructor() {
    super(...arguments), this._memberId = "", this._status = null, this._loading = !1, this._message = null, this._api = "/umbraco/api/twofactor/admin";
  }
  async _checkStatus() {
    if (this._memberId) {
      this._loading = !0, this._message = null;
      try {
        const e = await fetch(
          `${this._api}/IsEnabled?memberId=${encodeURIComponent(this._memberId)}`,
          { credentials: "same-origin" }
        );
        if (!e.ok) throw new Error(String(e.status));
        const a = await e.json();
        this._status = a.enabled;
      } catch {
        this._status = null, this._message = { type: "error", text: "Could not read 2FA status for that member." };
      } finally {
        this._loading = !1;
      }
    }
  }
  async _disable() {
    if (confirm("Revoke 2FA for this member? They will need to enrol again.")) {
      this._loading = !0;
      try {
        const e = await fetch(
          `${this._api}/Disable?memberId=${encodeURIComponent(this._memberId)}`,
          { method: "POST", credentials: "same-origin" }
        );
        if (!e.ok) throw new Error(String(e.status));
        this._status = !1, this._message = { type: "success", text: "2FA revoked for member." };
      } catch {
        this._message = { type: "error", text: "Could not revoke 2FA." };
      } finally {
        this._loading = !1;
      }
    }
  }
  render() {
    return o`
      <h1>Two-Factor Authentication</h1>
      <p class="description">
        Check whether a member has TOTP enrolled, and revoke it if they have lost their device.
      </p>

      <uui-box headline="Member Lookup">
        <div class="input-row">
          <input type="number" .value=${this._memberId}
            @input=${(e) => this._memberId = e.target.value}
            placeholder="Member ID" style="width:140px;padding:8px;border:1px solid #d1d5db;border-radius:4px;" />
          <uui-button look="secondary" ?disabled=${!this._memberId || this._loading}
            @click=${this._checkStatus}>Check Status</uui-button>
        </div>
      </uui-box>

      ${this._message ? o`<div class="msg ${this._message.type}" style="margin-top:12px;">${this._message.text}</div>` : ""}

      ${this._status !== null ? o`
            <uui-box headline="2FA Status" style="margin-top:16px;">
              <span class="status-badge ${this._status ? "enabled" : "disabled"}">
                ${this._status ? "Enabled" : "Not enrolled"}
              </span>

              ${this._status ? o`
                    <div class="action-row">
                      <uui-button look="danger" @click=${this._disable} ?disabled=${this._loading}>
                        Revoke 2FA
                      </uui-button>
                    </div>
                  ` : o`
                    <p class="hint">
                      This member has not enrolled. Enrolment happens on the member's own
                      account page, not from the backoffice.
                    </p>
                  `}
            </uui-box>
          ` : ""}
    `;
  }
};
t.styles = p`
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
i([
  n()
], t.prototype, "_memberId", 2);
i([
  n()
], t.prototype, "_status", 2);
i([
  n()
], t.prototype, "_loading", 2);
i([
  n()
], t.prototype, "_message", 2);
t = i([
  c("twofactor-dashboard")
], t);
const x = t;
export {
  t as TwoFactorDashboardElement,
  x as default
};

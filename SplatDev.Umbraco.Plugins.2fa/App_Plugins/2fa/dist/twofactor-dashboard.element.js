import { LitElement as u, html as i, css as c, state as r, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as h } from "@umbraco-cms/backoffice/element-api";
var m = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, a = (t, e, n, d) => {
  for (var o = d > 1 ? void 0 : d ? _(e, n) : e, l = t.length - 1, p; l >= 0; l--)
    (p = t[l]) && (o = (d ? p(e, n, o) : p(o)) || o);
  return d && o && m(e, n, o), o;
};
let s = class extends h(u) {
  constructor() {
    super(...arguments), this._memberId = "", this._status = null, this._loading = !1, this._secret = null, this._totpCode = "", this._backupCodes = [], this._message = null, this._api = "/umbraco/api/twofactor";
  }
  async _checkStatus() {
    if (this._memberId) {
      this._loading = !0;
      try {
        const e = await (await fetch(`${this._api}/IsEnabled?memberId=${this._memberId}`)).json();
        this._status = e.enabled;
      } finally {
        this._loading = !1;
      }
    }
  }
  async _setup() {
    this._loading = !0, this._message = null;
    try {
      const e = await (await fetch(`${this._api}/SetupTotp?memberId=${this._memberId}`, { method: "POST" })).json();
      this._secret = e.secretKey;
    } finally {
      this._loading = !1;
    }
  }
  async _verify() {
    this._loading = !0;
    try {
      (await (await fetch(`${this._api}/VerifyTotp?memberId=${this._memberId}&code=${this._totpCode}`, { method: "POST" })).json()).valid ? (this._status = !0, this._secret = null, this._message = { type: "success", text: "2FA enabled successfully!" }) : this._message = { type: "error", text: "Invalid code. Please try again." };
    } finally {
      this._loading = !1;
    }
  }
  async _generateBackupCodes() {
    this._loading = !0;
    try {
      const e = await (await fetch(`${this._api}/GenerateBackupCodes?memberId=${this._memberId}&count=8`, { method: "POST" })).json();
      this._backupCodes = e.codes ?? [], this._message = { type: "success", text: "Backup codes generated. Save them securely!" };
    } finally {
      this._loading = !1;
    }
  }
  async _disable() {
    if (confirm("Disable 2FA for this member?")) {
      this._loading = !0;
      try {
        await fetch(`${this._api}/Disable?memberId=${this._memberId}`, { method: "POST" }), this._status = !1, this._secret = null, this._backupCodes = [], this._message = { type: "success", text: "2FA disabled." };
      } finally {
        this._loading = !1;
      }
    }
  }
  render() {
    return i`
      <h1>Two-Factor Authentication</h1>
      <p class="description">Manage TOTP 2FA and backup codes for Umbraco members.</p>

      <uui-box headline="Member Lookup">
        <div class="input-row">
          <input type="number" .value=${this._memberId}
            @input=${(t) => this._memberId = t.target.value}
            placeholder="Member ID" style="width:140px;padding:8px;border:1px solid #d1d5db;border-radius:4px;" />
          <uui-button look="secondary" ?disabled=${!this._memberId || this._loading}
            @click=${this._checkStatus}>Check Status</uui-button>
        </div>
      </uui-box>

      ${this._message ? i`<div class="msg ${this._message.type}" style="margin-top:12px;">${this._message.text}</div>` : ""}

      ${this._status !== null ? i`
        <uui-box headline="2FA Status" style="margin-top:16px;">
          <span class="status-badge ${this._status ? "enabled" : "disabled"}">
            ${this._status ? "Enabled" : "Disabled"}
          </span>

          ${this._status ? i`
            <div class="action-row">
              <uui-button look="secondary" @click=${this._generateBackupCodes} ?disabled=${this._loading}>
                Generate Backup Codes
              </uui-button>
              <uui-button look="danger" @click=${this._disable} ?disabled=${this._loading}>
                Disable 2FA
              </uui-button>
            </div>
            ${this._backupCodes.length > 0 ? i`
              <div style="margin-top:16px;background:#f9fafb;padding:1rem;border-radius:6px;">
                <strong>Backup Codes (save these now):</strong>
                <ul class="backup-list">
                  ${this._backupCodes.map((t) => i`<li>${t}</li>`)}
                </ul>
              </div>
            ` : ""}
          ` : i`
            <div class="action-row">
              <uui-button look="primary" @click=${this._setup} ?disabled=${this._loading}>
                Set Up TOTP
              </uui-button>
            </div>
            ${this._secret ? i`
              <div class="secret-box">
                <p><strong>Secret Key:</strong> <code>${this._secret}</code></p>
                <p style="margin-top:8px;">Enter this key in your authenticator app, then verify:</p>
                <div class="input-row" style="margin-top:8px;">
                  <input class="totp-input" type="text" maxlength="6" placeholder="000000"
                    .value=${this._totpCode}
                    @input=${(t) => this._totpCode = t.target.value} />
                  <uui-button look="positive" @click=${this._verify} ?disabled=${this._loading}>
                    Verify &amp; Enable
                  </uui-button>
                </div>
              </div>
            ` : ""}
          `}
        </uui-box>
      ` : ""}
    `;
  }
};
s.styles = c`
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
    .secret-box { background: #eff6ff; padding: 1rem; border-radius: 6px; margin-top: 12px; }
    .secret-box code { font-size: 0.875rem; word-break: break-all; }
    .totp-input { font-size: 1.2rem; letter-spacing: 0.3em; text-align: center; width: 130px; padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db); border-radius: 4px; }
    .backup-list { list-style: none; padding: 0; margin: 8px 0 0; font-family: monospace; }
    .backup-list li { padding: 2px 0; }
    .action-row { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
  `;
a([
  r()
], s.prototype, "_memberId", 2);
a([
  r()
], s.prototype, "_status", 2);
a([
  r()
], s.prototype, "_loading", 2);
a([
  r()
], s.prototype, "_secret", 2);
a([
  r()
], s.prototype, "_totpCode", 2);
a([
  r()
], s.prototype, "_backupCodes", 2);
a([
  r()
], s.prototype, "_message", 2);
s = a([
  b("twofactor-dashboard")
], s);
const y = s;
export {
  s as TwoFactorDashboardElement,
  y as default
};

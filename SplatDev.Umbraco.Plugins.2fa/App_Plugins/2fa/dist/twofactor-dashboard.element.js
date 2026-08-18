import { LitElement as d, html as o, css as h, state as r, customElement as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as p } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/member";
var b = Object.defineProperty, g = Object.getOwnPropertyDescriptor, i = (e, t, l, n) => {
  for (var a = n > 1 ? void 0 : n ? g(t, l) : t, m = e.length - 1, u; m >= 0; m--)
    (u = e[m]) && (a = (n ? u(t, l, a) : u(a)) || a);
  return n && a && b(t, l, a), a;
};
let s = class extends p(d) {
  constructor() {
    super(...arguments), this._member = [], this._memberName = "", this._status = null, this._loading = !1, this._message = null, this._api = "/umbraco/api/twofactor/admin";
  }
  async _checkStatus() {
    if (this._memberId) {
      this._loading = !0, this._message = null;
      try {
        const e = await fetch(
          `${this._api}/IsEnabled?member=${encodeURIComponent(this._member[0] ?? "")}`,
          { credentials: "same-origin" }
        );
        if (!e.ok) throw new Error(String(e.status));
        const t = await e.json();
        this._status = t.enabled, this._memberName = t.memberName ?? "";
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
          `${this._api}/Disable?member=${encodeURIComponent(this._member[0] ?? "")}`,
          { method: "POST", credentials: "same-origin" }
        );
        if (!e.ok) throw new Error(String(e.status));
        const t = await e.json();
        this._status = !1, this._message = { type: "success", text: t.message ?? "2FA revoked." };
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
        Pick a member to see whether they have TOTP enrolled, and revoke it if they have
        lost their device.
      </p>

      <uui-box headline="Find a member">
        <div class="input-row">
          <umb-input-member
            max="1"
            .value=${this._member}
            @change=${(e) => {
      const t = e.target;
      this._member = (t.selection ?? String(t.value ?? "").split(",")).filter(Boolean), this._status = null;
    }}>
          </umb-input-member>
          <uui-button look="secondary" ?disabled=${this._member.length === 0 || this._loading}
            @click=${this._checkStatus}>Check status</uui-button>
        </div>
      </uui-box>

      ${this._message ? o`<div class="msg ${this._message.type}" style="margin-top:12px;">${this._message.text}</div>` : ""}

      ${this._status !== null ? o`
            <uui-box headline=${this._memberName ? `2FA for ${this._memberName}` : "2FA status"} style="margin-top:16px;">
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
s.styles = h`
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
  r()
], s.prototype, "_member", 2);
i([
  r()
], s.prototype, "_memberName", 2);
i([
  r()
], s.prototype, "_status", 2);
i([
  r()
], s.prototype, "_loading", 2);
i([
  r()
], s.prototype, "_message", 2);
s = i([
  c("twofactor-dashboard")
], s);
const y = s;
export {
  s as TwoFactorDashboardElement,
  y as default
};

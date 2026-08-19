import { LitElement as p, html as m, css as b, state as h, customElement as _ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/member";
import { UMB_AUTH_CONTEXT as f } from "@umbraco-cms/backoffice/auth";
function y(t) {
  let e = null;
  const a = new Promise((r) => {
    t.consumeContext(f, async (s) => {
      var o;
      try {
        e = await ((o = s == null ? void 0 : s.getLatestToken) == null ? void 0 : o.call(s)) ?? null;
      } catch {
        e = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return async (r, s = {}) => {
    await a;
    const o = new Headers(s.headers);
    e && !o.has("Authorization") && o.set("Authorization", `Bearer ${e}`);
    const n = await fetch(r, { ...s, credentials: "same-origin", headers: o });
    return (n.status === 401 || n.status === 403) && console.error(
      `[SplatDev] ${n.status} from ${String(r)} — the backoffice token was ${e ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), n;
  };
}
var v = Object.defineProperty, w = Object.getOwnPropertyDescriptor, c = (t) => {
  throw TypeError(t);
}, l = (t, e, a, r) => {
  for (var s = r > 1 ? void 0 : r ? w(e, a) : e, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (s = (r ? n(e, a, s) : n(s)) || s);
  return r && s && v(e, a, s), s;
}, x = (t, e, a) => e.has(t) || c("Cannot " + a), u = (t, e, a) => (x(t, e, "read from private field"), a ? a.call(t) : e.get(t)), k = (t, e, a) => e.has(t) ? c("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), d;
let i = class extends g(p) {
  constructor() {
    super(...arguments), k(this, d, y(this)), this._member = [], this._memberName = "", this._status = null, this._loading = !1, this._message = null, this._api = "/umbraco/api/twofactor/admin";
  }
  async _checkStatus() {
    if (this._memberId) {
      this._loading = !0, this._message = null;
      try {
        const t = await u(this, d).call(this, `${this._api}/IsEnabled?member=${encodeURIComponent(this._member[0] ?? "")}`, { credentials: "same-origin" });
        if (!t.ok) throw new Error(String(t.status));
        const e = await t.json();
        this._status = e.enabled, this._memberName = e.memberName ?? "";
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
        const t = await u(this, d).call(this, `${this._api}/Disable?member=${encodeURIComponent(this._member[0] ?? "")}`, { method: "POST", credentials: "same-origin" });
        if (!t.ok) throw new Error(String(t.status));
        const e = await t.json();
        this._status = !1, this._message = { type: "success", text: e.message ?? "2FA revoked." };
      } catch {
        this._message = { type: "error", text: "Could not revoke 2FA." };
      } finally {
        this._loading = !1;
      }
    }
  }
  render() {
    return m`
      <h1>Two-Factor Authentication</h1>
      <p class="description">
        Pick a member to see whether they have TOTP enrolled, and revoke it if they have
        lost their device.
      </p>

      <uui-box headline="Find a member">
        <div class="input-row">
          <umb-input-member
            max="1"
            .selection=${this._member}
            @change=${(t) => {
      const e = t.target;
      this._member = (e.selection ?? String(e.value ?? "").split(",")).filter(Boolean), this._status = null;
    }}>
          </umb-input-member>
          <uui-button look="secondary" ?disabled=${this._member.length === 0 || this._loading}
            @click=${this._checkStatus}>Check status</uui-button>
        </div>
      </uui-box>

      ${this._message ? m`<div class="msg ${this._message.type}" style="margin-top:12px;">${this._message.text}</div>` : ""}

      ${this._status !== null ? m`
            <uui-box headline=${this._memberName ? `2FA for ${this._memberName}` : "2FA status"} style="margin-top:16px;">
              <span class="status-badge ${this._status ? "enabled" : "disabled"}">
                ${this._status ? "Enabled" : "Not enrolled"}
              </span>

              ${this._status ? m`
                    <div class="action-row">
                      <uui-button look="danger" @click=${this._disable} ?disabled=${this._loading}>
                        Revoke 2FA
                      </uui-button>
                    </div>
                  ` : m`
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
d = /* @__PURE__ */ new WeakMap();
i.styles = b`
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
l([
  h()
], i.prototype, "_member", 2);
l([
  h()
], i.prototype, "_memberName", 2);
l([
  h()
], i.prototype, "_status", 2);
l([
  h()
], i.prototype, "_loading", 2);
l([
  h()
], i.prototype, "_message", 2);
i = l([
  _("twofactor-dashboard")
], i);
const F = i;
export {
  i as TwoFactorDashboardElement,
  F as default
};

import { LitElement as w, html as u, css as y, state as d, customElement as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as x } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/member";
import { UMB_AUTH_CONTEXT as k } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as $ } from "@umbraco-cms/backoffice/notification";
function T(t) {
  let e = null, s = null;
  const n = t.consumeContext.bind(t), r = new Promise((o) => {
    n(k, async (a) => {
      var m;
      try {
        e = await ((m = a == null ? void 0 : a.getLatestToken) == null ? void 0 : m.call(a)) ?? null;
      } catch {
        e = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return n($, (o) => {
    s = o;
  }), async (o, a = {}) => {
    await r;
    const m = new Headers(a.headers);
    e && !m.has("Authorization") && m.set("Authorization", `Bearer ${e}`);
    const l = await fetch(o, { ...a, credentials: "same-origin", headers: m });
    if (!l.ok) {
      const p = l.status === 401 || l.status === 403, f = p ? "Not authorised" : "Could not load data", b = p ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${l.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${l.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${l.status} from ${String(o)} — ${b}`), s == null || s.peek("danger", { data: { headline: f, message: b } });
    }
    return l;
  };
}
var A = Object.defineProperty, C = Object.getOwnPropertyDescriptor, g = (t) => {
  throw TypeError(t);
}, h = (t, e, s, n) => {
  for (var r = n > 1 ? void 0 : n ? C(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (r = (n ? a(e, s, r) : a(r)) || r);
  return n && r && A(e, s, r), r;
}, E = (t, e, s) => e.has(t) || g("Cannot " + s), _ = (t, e, s) => (E(t, e, "read from private field"), s ? s.call(t) : e.get(t)), F = (t, e, s) => e.has(t) ? g("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), c;
let i = class extends x(w) {
  constructor() {
    super(...arguments), F(this, c, T(this)), this._member = [], this._memberName = "", this._status = null, this._loading = !1, this._message = null, this._api = "/umbraco/api/twofactor/admin";
  }
  async _checkStatus() {
    if (this._memberId) {
      this._loading = !0, this._message = null;
      try {
        const t = await _(this, c).call(this, `${this._api}/IsEnabled?member=${encodeURIComponent(this._member[0] ?? "")}`, { credentials: "same-origin" });
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
        const t = await _(this, c).call(this, `${this._api}/Disable?member=${encodeURIComponent(this._member[0] ?? "")}`, { method: "POST", credentials: "same-origin" });
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
    return u`
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

      ${this._message ? u`<div class="msg ${this._message.type}" style="margin-top:12px;">${this._message.text}</div>` : ""}

      ${this._status !== null ? u`
            <uui-box headline=${this._memberName ? `2FA for ${this._memberName}` : "2FA status"} style="margin-top:16px;">
              <span class="status-badge ${this._status ? "enabled" : "disabled"}">
                ${this._status ? "Enabled" : "Not enrolled"}
              </span>

              ${this._status ? u`
                    <div class="action-row">
                      <uui-button look="danger" @click=${this._disable} ?disabled=${this._loading}>
                        Revoke 2FA
                      </uui-button>
                    </div>
                  ` : u`
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
c = /* @__PURE__ */ new WeakMap();
i.styles = y`
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
h([
  d()
], i.prototype, "_member", 2);
h([
  d()
], i.prototype, "_memberName", 2);
h([
  d()
], i.prototype, "_status", 2);
h([
  d()
], i.prototype, "_loading", 2);
h([
  d()
], i.prototype, "_message", 2);
i = h([
  v("twofactor-dashboard")
], i);
const z = i;
export {
  i as TwoFactorDashboardElement,
  z as default
};

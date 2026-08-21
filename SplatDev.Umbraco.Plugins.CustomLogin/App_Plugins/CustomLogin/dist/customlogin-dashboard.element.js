import { LitElement as C, html as h, css as k, state as p, customElement as S } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as T } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as O } from "@umbraco-cms/backoffice/notification";
function N(e) {
  let t = null, s = null;
  const l = e.consumeContext.bind(e), i = new Promise((o) => {
    l(T, async (a) => {
      var d;
      try {
        t = await ((d = a == null ? void 0 : a.getLatestToken) == null ? void 0 : d.call(a)) ?? null;
      } catch {
        t = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return l(O, (o) => {
    s = o;
  }), async (o, a = {}) => {
    await i;
    const d = new Headers(a.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const n = await fetch(o, { ...a, credentials: "same-origin", headers: d });
    if (!n.ok) {
      const _ = n.status === 401 || n.status === 403, $ = _ ? "Not authorised" : "Could not load data", f = _ ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(o)} — ${f}`), s == null || s.peek("danger", { data: { headline: $, message: f } });
    }
    return n;
  };
}
var A = Object.defineProperty, B = Object.getOwnPropertyDescriptor, w = (e) => {
  throw TypeError(e);
}, u = (e, t, s, l) => {
  for (var i = l > 1 ? void 0 : l ? B(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (i = (l ? a(t, s, i) : a(i)) || i);
  return l && i && A(t, s, i), i;
}, x = (e, t, s) => t.has(e) || w("Cannot " + s), v = (e, t, s) => (x(e, t, "read from private field"), s ? s.call(e) : t.get(e)), b = (e, t, s) => t.has(e) ? w("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), y = (e, t, s) => (x(e, t, "access private method"), s), c, g, m;
let r = class extends E(C) {
  constructor() {
    super(...arguments), b(this, g), b(this, c, N(this)), this._settings = {
      brandName: "",
      logoUrl: "",
      backgroundColor: "#ffffff",
      accentColor: "#1a73e8",
      supportEmail: "",
      enableSso: !1
    }, this._loading = !1, this._saving = !1, this._message = null, this._loadError = null, this._apiBase = "/umbraco/api/customlogin";
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await v(this, c).call(this, `${this._apiBase}/GetSettings`);
      y(this, g, m).call(this, e) && (this._settings = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details.");
    } finally {
      this._loading = !1;
    }
  }
  async _save() {
    this._saving = !0, this._message = null;
    try {
      const e = await v(this, c).call(this, `${this._apiBase}/SaveSettings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._settings)
      });
      y(this, g, m).call(this, e) ? this._message = { type: "success", text: "Settings saved successfully." } : this._message = { type: "error", text: "Failed to save settings." };
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._message = { type: "error", text: "Network error. Please try again." };
    } finally {
      this._saving = !1;
    }
  }
  _set(e, t) {
    this._settings = { ...this._settings, [e]: t };
  }
  render() {
    return this._loading ? h`<p>Loading...</p>` : h`
      ${this._loadError ? h`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>Custom Login Settings</h1>
      <p class="description">Configure the branded login page appearance and SSO integration.</p>

      ${this._message ? h`<div class="msg ${this._message.type}">${this._message.text}</div>` : ""}

      <uui-box headline="Branding">
        <div class="field-row">
          <label>Brand Name</label>
          <input type="text" .value=${this._settings.brandName}
            @input=${(e) => this._set("brandName", e.target.value)}
            placeholder="My Company" />
        </div>
        <div class="field-row">
          <label>Logo URL</label>
          <input type="url" .value=${this._settings.logoUrl}
            @input=${(e) => this._set("logoUrl", e.target.value)}
            placeholder="https://example.com/logo.png" />
        </div>
        <div class="field-row">
          <label>Background Color</label>
          <div class="color-row">
            <input type="color" .value=${this._settings.backgroundColor}
              @input=${(e) => this._set("backgroundColor", e.target.value)} />
            <input type="text" .value=${this._settings.backgroundColor}
              @input=${(e) => this._set("backgroundColor", e.target.value)}
              style="width:120px" />
          </div>
        </div>
        <div class="field-row">
          <label>Accent Color</label>
          <div class="color-row">
            <input type="color" .value=${this._settings.accentColor}
              @input=${(e) => this._set("accentColor", e.target.value)} />
            <input type="text" .value=${this._settings.accentColor}
              @input=${(e) => this._set("accentColor", e.target.value)}
              style="width:120px" />
          </div>
        </div>
        <div class="field-row">
          <label>Support Email</label>
          <input type="email" .value=${this._settings.supportEmail}
            @input=${(e) => this._set("supportEmail", e.target.value)}
            placeholder="support@example.com" />
        </div>
      </uui-box>

      <uui-box headline="SSO" style="margin-top:16px;">
        <div class="field-row">
          <uui-toggle
            .checked=${this._settings.enableSso}
            @change=${(e) => this._set("enableSso", e.target.checked)}
          >Enable Single Sign-On hook</uui-toggle>
        </div>
      </uui-box>

      <div style="margin-top:20px;">
        <uui-button look="primary" ?disabled=${this._saving} @click=${this._save}>
          ${this._saving ? "Saving..." : "Save Settings"}
        </uui-button>
      </div>
    `;
  }
};
c = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakSet();
m = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
r.styles = k`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .field-row { margin-bottom: 16px; }
    .field-row label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 4px; }
    .field-row input[type="text"],
    .field-row input[type="url"],
    .field-row input[type="email"] {
      width: 100%;
      max-width: 480px;
      padding: 8px 10px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 4px;
      font-size: 1rem;
    }
    .color-row { display: flex; align-items: center; gap: 8px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-bottom: 16px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
  
    .splatdev-load-error {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0 0 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem;
      border-radius: 3px;
    }
  `;
u([
  p()
], r.prototype, "_settings", 2);
u([
  p()
], r.prototype, "_loading", 2);
u([
  p()
], r.prototype, "_saving", 2);
u([
  p()
], r.prototype, "_message", 2);
u([
  p()
], r.prototype, "_loadError", 2);
r = u([
  S("customlogin-dashboard")
], r);
const q = r;
export {
  r as CustomLoginDashboardElement,
  q as default
};

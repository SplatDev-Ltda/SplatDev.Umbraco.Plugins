import { LitElement as h, html as u, css as m, state as d, customElement as _ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as v } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as f } from "@umbraco-cms/backoffice/auth";
function b(e) {
  let t = null;
  const a = new Promise((i) => {
    e.consumeContext(f, async (s) => {
      var o;
      try {
        t = await ((o = s == null ? void 0 : s.getLatestToken) == null ? void 0 : o.call(s)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return async (i, s = {}) => {
    await a;
    const o = new Headers(s.headers);
    t && !o.has("Authorization") && o.set("Authorization", `Bearer ${t}`);
    const r = await fetch(i, { ...s, credentials: "same-origin", headers: o });
    return (r.status === 401 || r.status === 403) && console.error(
      `[SplatDev] ${r.status} from ${String(i)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), r;
  };
}
var y = Object.defineProperty, w = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, n = (e, t, a, i) => {
  for (var s = i > 1 ? void 0 : i ? w(t, a) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (s = (i ? r(t, a, s) : r(s)) || s);
  return i && s && y(t, a, s), s;
}, x = (e, t, a) => t.has(e) || g("Cannot " + a), c = (e, t, a) => (x(e, t, "read from private field"), a ? a.call(e) : t.get(e)), $ = (e, t, a) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), p;
let l = class extends v(h) {
  constructor() {
    super(...arguments), $(this, p, b(this)), this._settings = {
      brandName: "",
      logoUrl: "",
      backgroundColor: "#ffffff",
      accentColor: "#1a73e8",
      supportEmail: "",
      enableSso: !1
    }, this._loading = !1, this._saving = !1, this._message = null, this._apiBase = "/umbraco/api/customlogin";
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await c(this, p).call(this, `${this._apiBase}/GetSettings`);
      e.ok && (this._settings = await e.json());
    } catch {
    } finally {
      this._loading = !1;
    }
  }
  async _save() {
    this._saving = !0, this._message = null;
    try {
      (await c(this, p).call(this, `${this._apiBase}/SaveSettings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._settings)
      })).ok ? this._message = { type: "success", text: "Settings saved successfully." } : this._message = { type: "error", text: "Failed to save settings." };
    } catch {
      this._message = { type: "error", text: "Network error. Please try again." };
    } finally {
      this._saving = !1;
    }
  }
  _set(e, t) {
    this._settings = { ...this._settings, [e]: t };
  }
  render() {
    return this._loading ? u`<p>Loading...</p>` : u`
      <h1>Custom Login Settings</h1>
      <p class="description">Configure the branded login page appearance and SSO integration.</p>

      ${this._message ? u`<div class="msg ${this._message.type}">${this._message.text}</div>` : ""}

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
p = /* @__PURE__ */ new WeakMap();
l.styles = m`
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
  `;
n([
  d()
], l.prototype, "_settings", 2);
n([
  d()
], l.prototype, "_loading", 2);
n([
  d()
], l.prototype, "_saving", 2);
n([
  d()
], l.prototype, "_message", 2);
l = n([
  _("customlogin-dashboard")
], l);
const E = l;
export {
  l as CustomLoginDashboardElement,
  E as default
};

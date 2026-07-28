import { LitElement as g, html as d, css as u, state as l, customElement as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as h } from "@umbraco-cms/backoffice/element-api";
var m = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, a = (e, i, r, o) => {
  for (var s = o > 1 ? void 0 : o ? _(i, r) : i, n = e.length - 1, p; n >= 0; n--)
    (p = e[n]) && (s = (o ? p(i, r, s) : p(s)) || s);
  return o && s && m(i, r, s), s;
};
let t = class extends h(g) {
  constructor() {
    super(...arguments), this._settings = {
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
      const e = await fetch(`${this._apiBase}/GetSettings`);
      e.ok && (this._settings = await e.json());
    } catch {
    } finally {
      this._loading = !1;
    }
  }
  async _save() {
    this._saving = !0, this._message = null;
    try {
      (await fetch(`${this._apiBase}/SaveSettings`, {
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
  _set(e, i) {
    this._settings = { ...this._settings, [e]: i };
  }
  render() {
    return this._loading ? d`<p>Loading...</p>` : d`
      <h1>Custom Login Settings</h1>
      <p class="description">Configure the branded login page appearance and SSO integration.</p>

      ${this._message ? d`<div class="msg ${this._message.type}">${this._message.text}</div>` : ""}

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
t.styles = u`
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
a([
  l()
], t.prototype, "_settings", 2);
a([
  l()
], t.prototype, "_loading", 2);
a([
  l()
], t.prototype, "_saving", 2);
a([
  l()
], t.prototype, "_message", 2);
t = a([
  c("customlogin-dashboard")
], t);
const f = t;
export {
  t as CustomLoginDashboardElement,
  f as default
};

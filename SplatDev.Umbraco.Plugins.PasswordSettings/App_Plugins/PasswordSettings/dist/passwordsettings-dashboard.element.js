import { LitElement as d, html as e, nothing as c, css as h, state as o, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as y } from "@umbraco-cms/backoffice/element-api";
var _ = Object.defineProperty, v = Object.getOwnPropertyDescriptor, a = (i, l, n, r) => {
  for (var s = r > 1 ? void 0 : r ? v(l, n) : l, p = i.length - 1, u; p >= 0; p--)
    (u = i[p]) && (s = (r ? u(l, n, s) : u(s)) || s);
  return r && s && _(l, n, s), s;
};
let t = class extends y(d) {
  constructor() {
    super(...arguments), this._policy = null, this._loading = !1, this._saving = !1, this._testPassword = "", this._validationResult = null, this._statusMsg = "", this._apiBase = "/umbraco/api/passwordsettings";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPolicy();
  }
  async _loadPolicy() {
    this._loading = !0;
    try {
      const i = await fetch(`${this._apiBase}/GetPolicy`);
      i.ok && (this._policy = await i.json());
    } finally {
      this._loading = !1;
    }
  }
  async _savePolicy() {
    if (this._policy) {
      this._saving = !0, this._statusMsg = "";
      try {
        const i = await fetch(`${this._apiBase}/SavePolicy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this._policy)
        });
        i.ok && (this._policy = await i.json(), this._statusMsg = "Policy saved successfully.");
      } finally {
        this._saving = !1;
      }
    }
  }
  async _validatePassword() {
    if (!this._testPassword) return;
    const i = await fetch(`${this._apiBase}/ValidatePassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: this._testPassword })
    });
    i.ok && (this._validationResult = await i.json());
  }
  _setField(i, l) {
    this._policy && (this._policy = { ...this._policy, [i]: l });
  }
  render() {
    return e`
      <h1>Password Settings</h1>
      <p class="description">Configure complexity rules, expiration and reuse prevention for member passwords.</p>

      ${this._loading ? e`<p>Loading...</p>` : this._policy ? e`
            <uui-box headline="Password Policy">
              <div class="form-grid">
                <div class="field">
                  <label>Minimum Length</label>
                  <uui-input
                    type="number"
                    .value=${String(this._policy.minLength)}
                    @input=${(i) => this._setField("minLength", parseInt(i.target.value, 10))}
                  ></uui-input>
                </div>
                <div class="field check-row">
                  <uui-toggle
                    ?checked=${this._policy.requireUppercase}
                    @change=${(i) => this._setField("requireUppercase", i.target.checked)}
                  ></uui-toggle>
                  <label>Require Uppercase</label>
                </div>
                <div class="field check-row">
                  <uui-toggle
                    ?checked=${this._policy.requireDigit}
                    @change=${(i) => this._setField("requireDigit", i.target.checked)}
                  ></uui-toggle>
                  <label>Require Digit</label>
                </div>
                <div class="field check-row">
                  <uui-toggle
                    ?checked=${this._policy.requireSpecial}
                    @change=${(i) => this._setField("requireSpecial", i.target.checked)}
                  ></uui-toggle>
                  <label>Require Special Character</label>
                </div>
                <div class="field">
                  <label>Expiration Days (0 = never)</label>
                  <uui-input
                    type="number"
                    .value=${String(this._policy.expirationDays)}
                    @input=${(i) => this._setField("expirationDays", parseInt(i.target.value, 10))}
                  ></uui-input>
                </div>
                <div class="field">
                  <label>Password History Count</label>
                  <uui-input
                    type="number"
                    .value=${String(this._policy.historyCount)}
                    @input=${(i) => this._setField("historyCount", parseInt(i.target.value, 10))}
                  ></uui-input>
                </div>
              </div>
              <div class="actions">
                <uui-button
                  look="primary"
                  label="Save Policy"
                  ?disabled=${this._saving}
                  @click=${this._savePolicy}
                >${this._saving ? "Saving..." : "Save Policy"}</uui-button>
                ${this._statusMsg ? e`<span class="status">${this._statusMsg}</span>` : c}
              </div>
            </uui-box>

            <uui-box headline="Test Password Strength" style="margin-top:20px">
              <div class="tester">
                <uui-input
                  placeholder="Enter a password to test..."
                  .value=${this._testPassword}
                  @input=${(i) => this._testPassword = i.target.value}
                  style="width:100%;margin-bottom:10px"
                ></uui-input>
                <uui-button look="secondary" label="Validate" @click=${this._validatePassword}>Validate</uui-button>
                ${this._validationResult ? this._validationResult.valid ? e`<p class="valid-msg">Password meets all requirements.</p>` : e`<ul class="error-list">${this._validationResult.errors.map((i) => e`<li>${i}</li>`)}</ul>` : c}
              </div>
            </uui-box>
          ` : e`<p>No policy found.</p>`}
    `;
  }
};
t.styles = h`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .form-grid { display: grid; gap: 16px; max-width: 480px; }
    .field label { display: block; font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
    .check-row { display: flex; align-items: center; gap: 8px; }
    .tester { margin-top: 24px; }
    .tester h2 { font-size: 1rem; margin-bottom: 12px; }
    .valid-msg { color: #065f46; margin-top: 8px; }
    .error-list { list-style: disc; padding-left: 1.25rem; color: #b91c1c; margin-top: 8px; }
    .actions { margin-top: 20px; display: flex; gap: 12px; align-items: center; }
    .status { font-size: 0.875rem; color: #065f46; }
  `;
a([
  o()
], t.prototype, "_policy", 2);
a([
  o()
], t.prototype, "_loading", 2);
a([
  o()
], t.prototype, "_saving", 2);
a([
  o()
], t.prototype, "_testPassword", 2);
a([
  o()
], t.prototype, "_validationResult", 2);
a([
  o()
], t.prototype, "_statusMsg", 2);
t = a([
  g("passwordsettings-dashboard")
], t);
const b = t;
export {
  t as PasswordSettingsDashboardElement,
  b as default
};

import { LitElement as _, html as n, nothing as h, css as y, state as u, customElement as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as f } from "@umbraco-cms/backoffice/auth";
function w(t) {
  let e = null;
  const s = new Promise((a) => {
    t.consumeContext(f, async (i) => {
      var l;
      try {
        e = await ((l = i == null ? void 0 : i.getLatestToken) == null ? void 0 : l.call(i)) ?? null;
      } catch {
        e = null;
      }
      a();
    }), setTimeout(a, 3e3);
  });
  return async (a, i = {}) => {
    await s;
    const l = new Headers(i.headers);
    e && !l.has("Authorization") && l.set("Authorization", `Bearer ${e}`);
    const r = await fetch(a, { ...i, credentials: "same-origin", headers: l });
    return (r.status === 401 || r.status === 403) && console.error(
      `[SplatDev] ${r.status} from ${String(a)} — the backoffice token was ${e ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), r;
  };
}
var b = Object.defineProperty, P = Object.getOwnPropertyDescriptor, g = (t) => {
  throw TypeError(t);
}, p = (t, e, s, a) => {
  for (var i = a > 1 ? void 0 : a ? P(e, s) : e, l = t.length - 1, r; l >= 0; l--)
    (r = t[l]) && (i = (a ? r(e, s, i) : r(i)) || i);
  return a && i && b(e, s, i), i;
}, $ = (t, e, s) => e.has(t) || g("Cannot " + s), c = (t, e, s) => ($(t, e, "read from private field"), s ? s.call(t) : e.get(t)), x = (t, e, s) => e.has(t) ? g("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), d;
let o = class extends m(_) {
  constructor() {
    super(...arguments), x(this, d, w(this)), this._policy = null, this._loading = !1, this._saving = !1, this._testPassword = "", this._validationResult = null, this._statusMsg = "", this._apiBase = "/umbraco/api/passwordsettings";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPolicy();
  }
  async _loadPolicy() {
    this._loading = !0;
    try {
      const t = await c(this, d).call(this, `${this._apiBase}/GetPolicy`);
      t.ok && (this._policy = await t.json());
    } finally {
      this._loading = !1;
    }
  }
  async _savePolicy() {
    if (this._policy) {
      this._saving = !0, this._statusMsg = "";
      try {
        const t = await c(this, d).call(this, `${this._apiBase}/SavePolicy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this._policy)
        });
        t.ok && (this._policy = await t.json(), this._statusMsg = "Policy saved successfully.");
      } finally {
        this._saving = !1;
      }
    }
  }
  async _validatePassword() {
    if (!this._testPassword) return;
    const t = await c(this, d).call(this, `${this._apiBase}/ValidatePassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: this._testPassword })
    });
    t.ok && (this._validationResult = await t.json());
  }
  _setField(t, e) {
    this._policy && (this._policy = { ...this._policy, [t]: e });
  }
  render() {
    return n`
      <h1>Password Settings</h1>
      <p class="description">Configure complexity rules, expiration and reuse prevention for member passwords.</p>

      ${this._loading ? n`<p>Loading...</p>` : this._policy ? n`
            <uui-box headline="Password Policy">
              <div class="form-grid">
                <div class="field">
                  <label>Minimum Length</label>
                  <uui-input
                    type="number"
                    .value=${String(this._policy.minLength)}
                    @input=${(t) => this._setField("minLength", parseInt(t.target.value, 10))}
                  ></uui-input>
                </div>
                <div class="field check-row">
                  <uui-toggle
                    ?checked=${this._policy.requireUppercase}
                    @change=${(t) => this._setField("requireUppercase", t.target.checked)}
                  ></uui-toggle>
                  <label>Require Uppercase</label>
                </div>
                <div class="field check-row">
                  <uui-toggle
                    ?checked=${this._policy.requireDigit}
                    @change=${(t) => this._setField("requireDigit", t.target.checked)}
                  ></uui-toggle>
                  <label>Require Digit</label>
                </div>
                <div class="field check-row">
                  <uui-toggle
                    ?checked=${this._policy.requireSpecial}
                    @change=${(t) => this._setField("requireSpecial", t.target.checked)}
                  ></uui-toggle>
                  <label>Require Special Character</label>
                </div>
                <div class="field">
                  <label>Expiration Days (0 = never)</label>
                  <uui-input
                    type="number"
                    .value=${String(this._policy.expirationDays)}
                    @input=${(t) => this._setField("expirationDays", parseInt(t.target.value, 10))}
                  ></uui-input>
                </div>
                <div class="field">
                  <label>Password History Count</label>
                  <uui-input
                    type="number"
                    .value=${String(this._policy.historyCount)}
                    @input=${(t) => this._setField("historyCount", parseInt(t.target.value, 10))}
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
                ${this._statusMsg ? n`<span class="status">${this._statusMsg}</span>` : h}
              </div>
            </uui-box>

            <uui-box headline="Test Password Strength" style="margin-top:20px">
              <div class="tester">
                <uui-input
                  placeholder="Enter a password to test..."
                  .value=${this._testPassword}
                  @input=${(t) => this._testPassword = t.target.value}
                  style="width:100%;margin-bottom:10px"
                ></uui-input>
                <uui-button look="secondary" label="Validate" @click=${this._validatePassword}>Validate</uui-button>
                ${this._validationResult ? this._validationResult.valid ? n`<p class="valid-msg">Password meets all requirements.</p>` : n`<ul class="error-list">${this._validationResult.errors.map((t) => n`<li>${t}</li>`)}</ul>` : h}
              </div>
            </uui-box>
          ` : n`<p>No policy found.</p>`}
    `;
  }
};
d = /* @__PURE__ */ new WeakMap();
o.styles = y`
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
p([
  u()
], o.prototype, "_policy", 2);
p([
  u()
], o.prototype, "_loading", 2);
p([
  u()
], o.prototype, "_saving", 2);
p([
  u()
], o.prototype, "_testPassword", 2);
p([
  u()
], o.prototype, "_validationResult", 2);
p([
  u()
], o.prototype, "_statusMsg", 2);
o = p([
  v("passwordsettings-dashboard")
], o);
const T = o;
export {
  o as PasswordSettingsDashboardElement,
  T as default
};

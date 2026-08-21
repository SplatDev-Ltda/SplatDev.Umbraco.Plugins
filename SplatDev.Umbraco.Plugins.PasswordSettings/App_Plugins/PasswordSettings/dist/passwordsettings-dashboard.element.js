import { LitElement as w, html as r, nothing as v, css as b, state as c, customElement as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as P } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as k } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as x } from "@umbraco-cms/backoffice/notification";
function S(t) {
  let e = null, i = null;
  const n = t.consumeContext.bind(t), l = new Promise((a) => {
    n(k, async (s) => {
      var d;
      try {
        e = await ((d = s == null ? void 0 : s.getLatestToken) == null ? void 0 : d.call(s)) ?? null;
      } catch {
        e = null;
      }
      a();
    }), setTimeout(a, 3e3);
  });
  return n(x, (a) => {
    i = a;
  }), async (a, s = {}) => {
    await l;
    const d = new Headers(s.headers);
    e && !d.has("Authorization") && d.set("Authorization", `Bearer ${e}`);
    const u = await fetch(a, { ...s, credentials: "same-origin", headers: d });
    if (!u.ok) {
      const _ = u.status === 401 || u.status === 403, f = _ ? "Not authorised" : "Could not load data", y = _ ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${u.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${u.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${u.status} from ${String(a)} — ${y}`), i == null || i.peek("danger", { data: { headline: f, message: y } });
    }
    return u;
  };
}
var C = Object.defineProperty, T = Object.getOwnPropertyDescriptor, m = (t) => {
  throw TypeError(t);
}, p = (t, e, i, n) => {
  for (var l = n > 1 ? void 0 : n ? T(e, i) : e, a = t.length - 1, s; a >= 0; a--)
    (s = t[a]) && (l = (n ? s(e, i, l) : s(l)) || l);
  return n && l && C(e, i, l), l;
}, q = (t, e, i) => e.has(t) || m("Cannot " + i), g = (t, e, i) => (q(t, e, "read from private field"), i ? i.call(t) : e.get(t)), O = (t, e, i) => e.has(t) ? m("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), h;
let o = class extends P(w) {
  constructor() {
    super(...arguments), O(this, h, S(this)), this._policy = null, this._loading = !1, this._saving = !1, this._testPassword = "", this._validationResult = null, this._statusMsg = "", this._apiBase = "/umbraco/api/passwordsettings";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPolicy();
  }
  async _loadPolicy() {
    this._loading = !0;
    try {
      const t = await g(this, h).call(this, `${this._apiBase}/GetPolicy`);
      t.ok && (this._policy = await t.json());
    } finally {
      this._loading = !1;
    }
  }
  async _savePolicy() {
    if (this._policy) {
      this._saving = !0, this._statusMsg = "";
      try {
        const t = await g(this, h).call(this, `${this._apiBase}/SavePolicy`, {
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
    const t = await g(this, h).call(this, `${this._apiBase}/ValidatePassword`, {
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
    return r`
      <h1>Password Settings</h1>
      <p class="description">Configure complexity rules, expiration and reuse prevention for member passwords.</p>

      ${this._loading ? r`<p>Loading...</p>` : this._policy ? r`
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
                ${this._statusMsg ? r`<span class="status">${this._statusMsg}</span>` : v}
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
                ${this._validationResult ? this._validationResult.valid ? r`<p class="valid-msg">Password meets all requirements.</p>` : r`<ul class="error-list">${this._validationResult.errors.map((t) => r`<li>${t}</li>`)}</ul>` : v}
              </div>
            </uui-box>
          ` : r`<p>No policy found.</p>`}
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
o.styles = b`
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
  c()
], o.prototype, "_policy", 2);
p([
  c()
], o.prototype, "_loading", 2);
p([
  c()
], o.prototype, "_saving", 2);
p([
  c()
], o.prototype, "_testPassword", 2);
p([
  c()
], o.prototype, "_validationResult", 2);
p([
  c()
], o.prototype, "_statusMsg", 2);
o = p([
  $("passwordsettings-dashboard")
], o);
const R = o;
export {
  o as PasswordSettingsDashboardElement,
  R as default
};

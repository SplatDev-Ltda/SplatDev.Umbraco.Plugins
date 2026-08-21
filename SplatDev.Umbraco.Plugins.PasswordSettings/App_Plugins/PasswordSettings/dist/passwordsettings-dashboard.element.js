import { LitElement as k, html as l, nothing as w, css as S, state as c, customElement as T } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as C } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as q } from "@umbraco-cms/backoffice/notification";
function O(t) {
  let e = null, s = null;
  const d = t.consumeContext.bind(t), o = new Promise((a) => {
    d(E, async (i) => {
      var p;
      try {
        e = await ((p = i == null ? void 0 : i.getLatestToken) == null ? void 0 : p.call(i)) ?? null;
      } catch {
        e = null;
      }
      a();
    }), setTimeout(a, 3e3);
  });
  return d(q, (a) => {
    s = a;
  }), async (a, i = {}) => {
    await o;
    const p = new Headers(i.headers);
    e && !p.has("Authorization") && p.set("Authorization", `Bearer ${e}`);
    const u = await fetch(a, { ...i, credentials: "same-origin", headers: p });
    if (!u.ok) {
      const m = u.status === 401 || u.status === 403, P = m ? "Not authorised" : "Could not load data", f = m ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${u.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${u.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${u.status} from ${String(a)} — ${f}`), s == null || s.peek("danger", { data: { headline: P, message: f } });
    }
    return u;
  };
}
var D = Object.defineProperty, M = Object.getOwnPropertyDescriptor, $ = (t) => {
  throw TypeError(t);
}, n = (t, e, s, d) => {
  for (var o = d > 1 ? void 0 : d ? M(e, s) : e, a = t.length - 1, i; a >= 0; a--)
    (i = t[a]) && (o = (d ? i(e, s, o) : i(o)) || o);
  return d && o && D(e, s, o), o;
}, x = (t, e, s) => e.has(t) || $("Cannot " + s), y = (t, e, s) => (x(t, e, "read from private field"), s ? s.call(t) : e.get(t)), b = (t, e, s) => e.has(t) ? $("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), v = (t, e, s) => (x(t, e, "access private method"), s), h, g, _;
let r = class extends C(k) {
  constructor() {
    super(...arguments), b(this, g), b(this, h, O(this)), this._policy = null, this._loading = !1, this._saving = !1, this._testPassword = "", this._validationResult = null, this._statusMsg = "", this._loadError = null, this._apiBase = "/umbraco/api/passwordsettings";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPolicy();
  }
  async _loadPolicy() {
    this._loading = !0;
    try {
      const t = await y(this, h).call(this, `${this._apiBase}/GetPolicy`);
      v(this, g, _).call(this, t) && (this._policy = await t.json());
    } finally {
      this._loading = !1;
    }
  }
  async _savePolicy() {
    if (this._policy) {
      this._saving = !0, this._statusMsg = "";
      try {
        const t = await y(this, h).call(this, `${this._apiBase}/SavePolicy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this._policy)
        });
        v(this, g, _).call(this, t) && (this._policy = await t.json(), this._statusMsg = "Policy saved successfully.");
      } finally {
        this._saving = !1;
      }
    }
  }
  async _validatePassword() {
    if (!this._testPassword) return;
    const t = await y(this, h).call(this, `${this._apiBase}/ValidatePassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: this._testPassword })
    });
    v(this, g, _).call(this, t) && (this._validationResult = await t.json());
  }
  _setField(t, e) {
    this._policy && (this._policy = { ...this._policy, [t]: e });
  }
  render() {
    return l`
      ${this._loadError ? l`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>Password Settings</h1>
      <p class="description">Configure complexity rules, expiration and reuse prevention for member passwords.</p>

      ${this._loading ? l`<p>Loading...</p>` : this._policy ? l`
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
                ${this._statusMsg ? l`<span class="status">${this._statusMsg}</span>` : w}
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
                ${this._validationResult ? this._validationResult.valid ? l`<p class="valid-msg">Password meets all requirements.</p>` : l`<ul class="error-list">${this._validationResult.errors.map((t) => l`<li>${t}</li>`)}</ul>` : w}
              </div>
            </uui-box>
          ` : l`<p>No policy found.</p>`}
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakSet();
_ = function(t) {
  return t.ok ? (this._loadError = null, !0) : (this._loadError = t.status === 401 || t.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${t.status}${t.statusText ? ` ${t.statusText}` : ""}.`, !1);
};
r.styles = S`
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
n([
  c()
], r.prototype, "_policy", 2);
n([
  c()
], r.prototype, "_loading", 2);
n([
  c()
], r.prototype, "_saving", 2);
n([
  c()
], r.prototype, "_testPassword", 2);
n([
  c()
], r.prototype, "_validationResult", 2);
n([
  c()
], r.prototype, "_statusMsg", 2);
n([
  c()
], r.prototype, "_loadError", 2);
r = n([
  T("passwordsettings-dashboard")
], r);
const N = r;
export {
  r as PasswordSettingsDashboardElement,
  N as default
};

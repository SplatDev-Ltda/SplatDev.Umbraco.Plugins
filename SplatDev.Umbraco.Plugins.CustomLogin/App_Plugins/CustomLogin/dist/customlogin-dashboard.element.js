import { LitElement as $, html as p, css as k, state as h, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as S } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as T } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as A } from "@umbraco-cms/backoffice/notification";
function O(e) {
  let t = null, s = null;
  const i = e.consumeContext.bind(e), r = new Promise((o) => {
    i(T, async (a) => {
      var n;
      try {
        t = await ((n = a == null ? void 0 : a.getLatestToken) == null ? void 0 : n.call(a)) ?? null;
      } catch {
        t = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return i(A, (o) => {
    s = o;
  }), async (o, a = {}) => {
    await r;
    const n = new Headers(a.headers);
    t && !n.has("Authorization") && n.set("Authorization", `Bearer ${t}`);
    const l = await fetch(o, { ...a, credentials: "same-origin", headers: n });
    if (!l.ok) {
      const u = l.status === 401 || l.status === 403, m = u ? "Not authorised" : "Could not load data", _ = u ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${l.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${l.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${l.status} from ${String(o)} — ${_}`), s == null || s.peek("danger", { data: { headline: m, message: _ } });
    }
    return l;
  };
}
async function U(e, t) {
  var s, i, r, o, a;
  try {
    const n = await e(`/umbraco/management/api/v1/media/${encodeURIComponent(t)}`);
    if (n.ok) {
      const u = (i = (s = (await n.json()).values) == null ? void 0 : s.find((_) => _.alias === "umbracoFile")) == null ? void 0 : i.value, m = typeof u == "string" ? u : u == null ? void 0 : u.src;
      if (m) return m;
    }
  } catch {
  }
  try {
    const n = await e(
      `/umbraco/management/api/v1/media/urls?id=${encodeURIComponent(t)}`
    );
    if (!n.ok) return null;
    const l = await n.json();
    return ((a = (o = (r = l == null ? void 0 : l[0]) == null ? void 0 : r.urlInfos) == null ? void 0 : o[0]) == null ? void 0 : a.url) ?? null;
  } catch {
    return null;
  }
}
var B = Object.defineProperty, D = Object.getOwnPropertyDescriptor, C = (e) => {
  throw TypeError(e);
}, c = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? D(t, s) : t, o = e.length - 1, a; o >= 0; o--)
    (a = e[o]) && (r = (i ? a(t, s, r) : a(r)) || r);
  return i && r && B(t, s, r), r;
}, x = (e, t, s) => t.has(e) || C("Cannot " + s), v = (e, t, s) => (x(e, t, "read from private field"), s ? s.call(e) : t.get(e)), y = (e, t, s) => t.has(e) ? C("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), w = (e, t, s) => (x(e, t, "access private method"), s), g, f, b;
const N = "CC07B313-0843-4AA8-BBDA-871C8DA728C8", I = "C4B1EFCF-A9D5-41C4-9621-E9D273B52A9C";
let d = class extends S($) {
  constructor() {
    super(...arguments), y(this, f), y(this, g, O(this)), this._settings = {
      brandName: "",
      logoUrl: "",
      backgroundColor: "#ffffff",
      accentColor: "#1a73e8",
      supportEmail: "",
      enableSso: !1
    }, this._loading = !1, this._saving = !1, this._message = null, this._loadError = null, this._apiBase = "/umbraco/api/customlogin", this._logoKeys = [], this._pickLogo = async (e) => {
      const t = e.target;
      this._logoKeys = t.selection ?? [];
      const s = this._logoKeys[0];
      if (!s) {
        this._set("logoUrl", "");
        return;
      }
      const i = await U(v(this, g), s);
      i && this._set("logoUrl", i);
    };
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await v(this, g).call(this, `${this._apiBase}/GetSettings`);
      w(this, f, b).call(this, e) && (this._settings = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details.");
    } finally {
      this._loading = !1;
    }
  }
  async _save() {
    this._saving = !0, this._message = null;
    try {
      const e = await v(this, g).call(this, `${this._apiBase}/SaveSettings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._settings)
      });
      w(this, f, b).call(this, e) ? this._message = { type: "success", text: "Settings saved successfully." } : this._message = { type: "error", text: "Failed to save settings." };
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
    return this._loading ? p`<p>Loading...</p>` : p`
      ${this._loadError ? p`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>Custom Login Settings</h1>
      <p class="description">Configure the branded login page appearance and SSO integration.</p>

      ${this._message ? p`<div class="msg ${this._message.type}">${this._message.text}</div>` : ""}

      <uui-box headline="Branding">
        <div class="field-row">
          <label>Brand Name</label>
          <input type="text" .value=${this._settings.brandName}
            @input=${(e) => this._set("brandName", e.target.value)}
            placeholder="My Company" />
        </div>
        <div class="field-row">
          <label>Logo</label>
          <div>
            <umb-input-media
              .selection=${this._logoKeys}
              .allowedContentTypeIds=${[N, I]}
              max="1"
              @change=${this._pickLogo}
            ></umb-input-media>
            ${this._settings.logoUrl ? p`<p class="hint">
                  Using <code>${this._settings.logoUrl}</code>
                  <uui-button compact look="secondary" label="Clear the logo"
                    @click=${() => {
      this._logoKeys = [], this._set("logoUrl", "");
    }}>Clear</uui-button>
                </p>` : p`<p class="hint">No logo chosen — the default Umbraco logo is shown.</p>`}
          </div>
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
g = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakSet();
b = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
d.styles = k`
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
c([
  h()
], d.prototype, "_settings", 2);
c([
  h()
], d.prototype, "_loading", 2);
c([
  h()
], d.prototype, "_saving", 2);
c([
  h()
], d.prototype, "_message", 2);
c([
  h()
], d.prototype, "_loadError", 2);
c([
  h()
], d.prototype, "_logoKeys", 2);
d = c([
  E("customlogin-dashboard")
], d);
const F = d;
export {
  d as CustomLoginDashboardElement,
  F as default
};

import { LitElement as p, html as h, css as _, state as u, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as f } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as v } from "@umbraco-cms/backoffice/auth";
function y(e) {
  let t = null;
  const s = new Promise((i) => {
    e.consumeContext(v, async (a) => {
      var o;
      try {
        t = await ((o = a == null ? void 0 : a.getLatestToken) == null ? void 0 : o.call(a)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return async (i, a = {}) => {
    await s;
    const o = new Headers(a.headers);
    t && !o.has("Authorization") && o.set("Authorization", `Bearer ${t}`);
    const r = await fetch(i, { ...a, credentials: "same-origin", headers: o });
    return (r.status === 401 || r.status === 403) && console.error(
      `[SplatDev] ${r.status} from ${String(i)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), r;
  };
}
var b = Object.defineProperty, w = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, d = (e, t, s, i) => {
  for (var a = i > 1 ? void 0 : i ? w(t, s) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (a = (i ? r(t, s, a) : r(a)) || a);
  return i && a && b(t, s, a), a;
}, S = (e, t, s) => t.has(e) || g("Cannot " + s), c = (e, t, s) => (S(e, t, "read from private field"), s ? s.call(e) : t.get(e)), L = (e, t, s) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), l;
let n = class extends f(p) {
  constructor() {
    super(...arguments), L(this, l, y(this)), this._settings = { enabled: !0, placeholder: "", lazyLoadIframes: !0 }, this._loading = !0, this._saved = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSettings();
  }
  async _loadSettings() {
    try {
      const e = await c(this, l).call(this, "/umbraco/api/lazyload/GetSettings");
      this._settings = await e.json();
    } finally {
      this._loading = !1;
    }
  }
  async _saveSettings() {
    await c(this, l).call(this, "/umbraco/api/lazyload/SaveSettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this._settings)
    }), this._saved = !0, setTimeout(() => {
      this._saved = !1;
    }, 3e3);
  }
  _toggle(e) {
    this._settings = { ...this._settings, [e]: !this._settings[e] };
  }
  render() {
    return this._loading ? h`<uui-loader></uui-loader>` : h`
      <uui-box headline="Lazy Load Settings">
        <div class="form-row">
          <label>Enabled</label>
          <uui-toggle ?checked=${this._settings.enabled} @change=${() => this._toggle("enabled")}></uui-toggle>
        </div>
        <div class="form-row">
          <label>Lazy Load Iframes</label>
          <uui-toggle ?checked=${this._settings.lazyLoadIframes} @change=${() => this._toggle("lazyLoadIframes")}></uui-toggle>
        </div>
        <div class="form-row">
          <label>Placeholder</label>
          <input type="text" .value=${this._settings.placeholder}
            @input=${(e) => this._settings = { ...this._settings, placeholder: e.target.value }} />
        </div>
        <uui-button look="primary" @click=${this._saveSettings}>Save Settings</uui-button>
        ${this._saved ? h`<uui-tag color="positive" look="secondary">Saved!</uui-tag>` : ""}
      </uui-box>
    `;
  }
};
l = /* @__PURE__ */ new WeakMap();
n.styles = _`
    :host { display: block; padding: 1rem; }
    .form-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    label { min-width: 160px; font-weight: 600; }
    input[type="text"] { flex: 1; padding: 0.4rem; border: 1px solid var(--uui-color-border); border-radius: 4px; }
  `;
d([
  u()
], n.prototype, "_settings", 2);
d([
  u()
], n.prototype, "_loading", 2);
d([
  u()
], n.prototype, "_saved", 2);
n = d([
  m("lazyload-dashboard")
], n);
const T = n;
export {
  n as LazyLoadDashboardElement,
  T as default
};
//# sourceMappingURL=lazyload-dashboard.element.js.map

import { LitElement as g, html as d, css as h, state as u, customElement as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as p } from "@umbraco-cms/backoffice/element-api";
var _ = Object.defineProperty, m = Object.getOwnPropertyDescriptor, o = (e, s, l, i) => {
  for (var t = i > 1 ? void 0 : i ? m(s, l) : s, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (t = (i ? n(s, l, t) : n(t)) || t);
  return i && t && _(s, l, t), t;
};
let a = class extends p(g) {
  constructor() {
    super(...arguments), this._settings = { enabled: !0, placeholder: "", lazyLoadIframes: !0 }, this._loading = !0, this._saved = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSettings();
  }
  async _loadSettings() {
    try {
      const e = await fetch("/umbraco/api/lazyload/GetSettings");
      this._settings = await e.json();
    } finally {
      this._loading = !1;
    }
  }
  async _saveSettings() {
    await fetch("/umbraco/api/lazyload/SaveSettings", {
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
    return this._loading ? d`<uui-loader></uui-loader>` : d`
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
        ${this._saved ? d`<uui-tag color="positive" look="secondary">Saved!</uui-tag>` : ""}
      </uui-box>
    `;
  }
};
a.styles = h`
    :host { display: block; padding: 1rem; }
    .form-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    label { min-width: 160px; font-weight: 600; }
    input[type="text"] { flex: 1; padding: 0.4rem; border: 1px solid var(--uui-color-border); border-radius: 4px; }
  `;
o([
  u()
], a.prototype, "_settings", 2);
o([
  u()
], a.prototype, "_loading", 2);
o([
  u()
], a.prototype, "_saved", 2);
a = o([
  c("lazyload-dashboard")
], a);
const y = a;
export {
  a as LazyLoadDashboardElement,
  y as default
};
//# sourceMappingURL=lazyload-dashboard.element.js.map

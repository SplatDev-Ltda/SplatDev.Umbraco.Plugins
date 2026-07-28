import { LitElement as d, html as u, css as p, state as c, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as f } from "@umbraco-cms/backoffice/element-api";
var m = Object.defineProperty, b = Object.getOwnPropertyDescriptor, l = (n, i, s, a) => {
  for (var e = a > 1 ? void 0 : a ? b(i, s) : i, o = n.length - 1, r; o >= 0; o--)
    (r = n[o]) && (e = (a ? r(i, s, e) : r(e)) || e);
  return a && e && m(i, s, e), e;
};
let t = class extends f(d) {
  constructor() {
    super(...arguments), this._saved = !1;
  }
  _handleSave() {
    this._saved = !0, setTimeout(() => {
      this._saved = !1;
    }, 3e3);
  }
  render() {
    return u`
      <h1>Site Settings</h1>
      <p class="description">Centralized site-wide configuration panel. Manage global settings and feature toggles.</p>
      <div class="status-card">
        <div class="status-icon">⚙️</div>
        <div class="status-text">
          <h2>Site Settings <span class="badge">Active</span></h2>
          <p>Plugin is installed and running on your Umbraco site.</p>
        </div>
      </div>
      <div class="config-section">
        <h3>Configuration</h3>
        <div class="form-field">
          <label>Status</label>
          <uui-toggle label="Enable Site Settings" checked></uui-toggle>
        </div>
        <div class="actions">
          <uui-button
            look="primary"
            label="Save Settings"
            @click=${this._handleSave}
          >${this._saved ? "Saved!" : "Save Settings"}</uui-button>
          <uui-button look="secondary" label="View Documentation">Documentation</uui-button>
        </div>
      </div>
    `;
  }
};
t.styles = p`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 600px; line-height: 1.6; }
    .status-card { display: flex; align-items: center; gap: 12px; background: var(--uui-color-surface, #fff); border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; padding: 16px; margin-bottom: 16px; }
    .status-icon { width: 48px; height: 48px; border-radius: 10px; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
    .status-text h2 { margin: 0 0 4px; font-size: 1rem; font-weight: 600; }
    .status-text p { margin: 0; font-size: 0.875rem; color: var(--uui-color-text-alt, #6b7280); }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; background: #d1fae5; color: #065f46; }
    .actions { display: flex; gap: 8px; margin-top: 16px; }
    .config-section { background: var(--uui-color-surface, #fff); border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; padding: 20px; }
    .config-section h3 { margin: 0 0 16px; font-size: 1rem; font-weight: 600; }
    .form-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
    .form-field label { font-size: 0.8rem; font-weight: 600; }
  `;
l([
  c()
], t.prototype, "_saved", 2);
t = l([
  g("splatdev-settings-dashboard")
], t);
const h = t;
export {
  t as SplatdevSiteSettingsDashboardElement,
  h as default
};

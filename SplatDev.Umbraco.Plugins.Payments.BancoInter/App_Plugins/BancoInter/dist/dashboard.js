import { LitElement as d, html as c, css as u, state as p, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, b = Object.getOwnPropertyDescriptor, l = (s, a, o, i) => {
  for (var e = i > 1 ? void 0 : i ? b(a, o) : a, n = s.length - 1, r; n >= 0; n--)
    (r = s[n]) && (e = (i ? r(a, o, e) : r(e)) || e);
  return i && e && g(a, o, e), e;
};
let t = class extends m(d) {
  constructor() {
    super(...arguments), this._saved = !1;
  }
  _handleSave() {
    this._saved = !0, setTimeout(() => {
      this._saved = !1;
    }, 3e3);
  }
  render() {
    return c`
      <h1>Banco Inter Payments</h1>
      <p class="description">Banco Inter payment gateway integration. Configure PIX, boleto and card payment methods.</p>
      <div class="status-card">
        <div class="status-icon">⚙️</div>
        <div class="status-text">
          <h2>Banco Inter Payments <span class="badge">Active</span></h2>
          <p>Plugin is installed and running on your Umbraco site.</p>
        </div>
      </div>
      <div class="config-section">
        <h3>Configuration</h3>
        <div class="form-field">
          <label>Status</label>
          <uui-toggle label="Enable Banco Inter Payments" checked></uui-toggle>
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
t.styles = u`
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
  p()
], t.prototype, "_saved", 2);
t = l([
  f("splatdev-bancinter-dashboard")
], t);
const h = t;
export {
  t as SplatdevBancoInterPaymentsDashboardElement,
  h as default
};

import { LitElement as e, css as t, customElement as n, html as r, state as i } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as a } from "@umbraco-cms/backoffice/element-api";
//#region \0@oxc-project+runtime@0.132.0/helpers/decorate.js
function o(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
//#endregion
//#region src/backups-dashboard.element.ts
var s = class extends a(e) {
	constructor(...e) {
		super(...e), this._saved = !1;
	}
	static {
		this.styles = t`
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
	}
	_handleSave() {
		this._saved = !0, setTimeout(() => {
			this._saved = !1;
		}, 3e3);
	}
	render() {
		return r`
      <h1>Backups</h1>
      <p class="description">Automated database and media backup management. Schedule, download, and restore backups.</p>
      <div class="status-card">
        <div class="status-icon">⚙️</div>
        <div class="status-text">
          <h2>Backups <span class="badge">Active</span></h2>
          <p>Plugin is installed and running on your Umbraco site.</p>
        </div>
      </div>
      <div class="config-section">
        <h3>Configuration</h3>
        <div class="form-field">
          <label>Status</label>
          <uui-toggle label="Enable Backups" checked></uui-toggle>
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
o([i()], s.prototype, "_saved", void 0), s = o([n("backups-dashboard")], s);
var c = s;
//#endregion
export { s as BackupsBackupsDashboardElement, c as default };

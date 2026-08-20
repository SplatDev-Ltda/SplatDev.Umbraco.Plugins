import { LitElement as p, html as t, nothing as c, css as f, state as u, customElement as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as b } from "@umbraco-cms/backoffice/auth";
var v = Object.defineProperty, g = Object.getOwnPropertyDescriptor, d = (e, a, i, s) => {
  for (var o = s > 1 ? void 0 : s ? g(a, i) : a, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (o = (s ? l(a, i, o) : l(o)) || o);
  return s && o && v(a, i, o), o;
};
const x = "/umbraco/api/Yaml2Schema", y = [
  "Languages",
  "Data Types",
  "Document Types",
  "Media Types",
  "Templates",
  "Content",
  "Media",
  "Dictionary Items",
  "Members",
  "Member Types",
  "Member Groups",
  "Users",
  "NuGet Packages",
  "Property Editors",
  "Static Assets"
];
let r = class extends m(p) {
  constructor() {
    super(), this._status = null, this._loadingStatus = !1, this._authContext = null, this._authReady = new Promise((e) => {
      this._authResolve = e;
    });
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(b, (e) => {
      this._authContext = e, this._authResolve(), this._loadStatus();
    });
  }
  async _getToken() {
    var e, a;
    return await this._authReady, this._authContext ? ((a = (e = this._authContext).getLatestToken) == null ? void 0 : a.call(e)) ?? null : null;
  }
  async _fetchAuthenticated(e, a = {}) {
    const i = {
      "Content-Type": "application/json",
      ...a.headers ?? {}
    }, s = await this._getToken();
    return s && (i.Authorization = `Bearer ${s}`), fetch(`${x}${e}`, { ...a, headers: i });
  }
  async _loadStatus() {
    this._loadingStatus = !0;
    try {
      const e = await this._fetchAuthenticated("/Status");
      e.ok && (this._status = await e.json());
    } catch {
    } finally {
      this._loadingStatus = !1;
    }
  }
  _renderStatus() {
    if (this._loadingStatus)
      return t`<uui-loader-circle></uui-loader-circle>`;
    if (!this._status)
      return t`
        <div class="info-card">
          <div class="info-row"><span class="info-label">Config file</span><span class="info-value">config/umbraco.yaml</span></div>
          <div class="info-row"><span class="info-label">Import runs</span><span class="info-value">On every application startup when the YAML file is present</span></div>
          <div class="info-row"><span class="info-label">File processed</span><span class="info-value">Renamed to <code>*.done</code> after a successful import</span></div>
        </div>`;
    const e = this._status.lastImportSucceeded ? t`<span class="status-badge ok">Last import succeeded</span>` : t`<span class="status-badge warn">Last import had errors</span>`;
    return t`
      <div class="info-card">
        <div class="info-row"><span class="info-label">Status</span><span>${e}</span></div>
        <div class="info-row"><span class="info-label">Config file</span><span class="info-value">${this._status.configPath ?? "config/umbraco.yaml"}</span></div>
        ${this._status.lastImportDate ? t`<div class="info-row"><span class="info-label">Last import</span><span class="info-value">${new Date(this._status.lastImportDate).toLocaleString()}</span></div>` : c}
        ${this._status.processedFile ? t`<div class="info-row"><span class="info-label">Processed file</span><span class="info-value">${this._status.processedFile}</span></div>` : c}
      </div>`;
  }
  render() {
    return t`
      <div class="header">
        <h1>YAML Import</h1>
        <p>Declarative Infrastructure-as-Code bootstrapping for Umbraco — define your entire site structure in a YAML file.</p>
      </div>
      <div class="section"><h2>Status</h2>${this._renderStatus()}</div>
      <div class="section">
        <h2>Supported Entity Types</h2>
        <div class="entity-grid">${y.map((e) => t`<div class="entity-chip">${e}</div>`)}</div>
      </div>
      <div class="section">
        <h2>How it works</h2>
        <div class="howto">
          <p>Place a <code>umbraco.yaml</code> file at the path configured in <code>appsettings.json</code> under <code>UmbracoYaml:ConfigPath</code> (default: <code>config/umbraco.yaml</code>).</p>
          <p>On the next application startup, Yaml2Schema reads the file and creates or updates all declared entities. After a successful import the file is renamed to <code>umbraco.yaml.done</code> so it is not re-processed.</p>
          <p>Use <code>[UPDATE]</code> prefixes on entity names to force updates on existing items, and <code>[REMOVE]</code> to delete them.</p>
        </div>
      </div>
    `;
  }
};
r.styles = f`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
      color: var(--uui-color-text, #1b264f);
      font-family: var(--uui-font-family);
    }
    .header { margin-bottom: var(--uui-size-layout-2, 32px); }
    .header h1 {
      font-size: 1.5rem; font-weight: 700; margin: 0 0 8px 0;
    }
    .header p { margin: 0; color: var(--uui-color-text-alt, #666); font-size: 0.925rem; }
    .section { margin-bottom: var(--uui-size-layout-2, 32px); }
    .section h2 {
      font-size: 1rem; font-weight: 600; margin: 0 0 8px 0;
      border-bottom: 1px solid var(--uui-color-border, #e3e3e3); padding-bottom: 6px;
    }
    .info-card {
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e3e3e3);
      border-radius: var(--uui-border-radius, 6px); padding: 16px;
    }
    .info-row {
      display: flex; align-items: baseline; gap: 8px; padding: 6px 0;
      border-bottom: 1px solid var(--uui-color-border, #f0f0f0); font-size: 14px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; min-width: 140px; }
    .info-value { color: var(--uui-color-text-alt, #555); font-family: monospace; font-size: 13px; }
    .entity-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;
    }
    .entity-chip {
      display: flex; align-items: center; gap: 6px;
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e3e3e3);
      border-radius: var(--uui-border-radius, 6px); padding: 10px 12px; font-size: 13px;
    }
    .status-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;
    }
    .status-badge.ok { background: #ecfdf5; color: #065f46; }
    .status-badge.warn { background: #fffbeb; color: #92400e; }
    .howto {
      background: var(--uui-color-surface-alt, #f8fafc);
      border: 1px solid var(--uui-color-border, #e3e3e3);
      border-radius: var(--uui-border-radius, 6px); padding: 16px; font-size: 13px;
      line-height: 1.7; color: var(--uui-color-text-alt, #555);
    }
    .howto code {
      background: rgba(0,0,0,.06); border-radius: 3px; padding: 1px 5px;
      font-family: monospace;
    }
    uui-loader-circle { margin: 12px 0; }
  `;
d([
  u()
], r.prototype, "_status", 2);
d([
  u()
], r.prototype, "_loadingStatus", 2);
r = d([
  h("yaml2schema-dashboard")
], r);
export {
  r as Yaml2SchemaDashboard
};
//# sourceMappingURL=yaml2schema-dashboard.js.map

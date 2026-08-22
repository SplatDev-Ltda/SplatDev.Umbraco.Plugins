import { LitElement, html, css, nothing, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import type { UmbAuthContext } from "@umbraco-cms/backoffice/auth";

const API_BASE = "/umbraco/api/Yaml2Schema";

const ENTITY_TYPES: string[] = [
  "Languages", "Data Types", "Document Types", "Media Types",
  "Templates", "Content", "Media", "Dictionary Items",
  "Members", "Member Types", "Member Groups", "Users",
  "NuGet Packages", "Property Editors", "Static Assets",
];

interface Yaml2SchemaStatus {
  lastImportSucceeded?: boolean;
  /** A YAML file is present and waiting to be imported on the next startup. */
  pendingImport?: boolean;
  configPath?: string;
  lastImportDate?: string;
  processedFile?: string;
}

@customElement("yaml2schema-dashboard")
export class Yaml2SchemaDashboard extends UmbElementMixin(LitElement) {
  @state() private _status: Yaml2SchemaStatus | null = null;
  @state() private _loadingStatus = false;
  private _authContext: UmbAuthContext | null = null;

  // consumeContext resolves asynchronously; _getToken waits on this so a request
  // cannot go out before the token exists and come back 401.
  private _authReady!: Promise<void>;
  private _authResolve!: () => void;

  static override styles = css`
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

  constructor() {
    super();
    this._authReady = new Promise<void>((resolve) => {
      this._authResolve = resolve;
    });
  }

  override connectedCallback() {
    super.connectedCallback();
    this.consumeContext(UMB_AUTH_CONTEXT, (ctx: UmbAuthContext) => {
      this._authContext = ctx;
      this._authResolve();
      this._loadStatus();
    });
  }

  private async _getToken(): Promise<string | null> {
    await this._authReady;
    if (!this._authContext) return null;
    return (this._authContext as any).getLatestToken?.() ?? null;
  }

  private async _fetchAuthenticated(path: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) ?? {}),
    };
    const token = await this._getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${API_BASE}${path}`, { ...options, headers });
  }

  private async _loadStatus() {
    this._loadingStatus = true;
    try {
      const res = await this._fetchAuthenticated("/Status");
      if (res.ok) this._status = await res.json();
    } catch {
      /* Status endpoint may not exist yet */
    } finally {
      this._loadingStatus = false;
    }
  }

  private _renderStatus() {
    if (this._loadingStatus) {
      return html`<uui-loader-circle></uui-loader-circle>`;
    }

    if (!this._status) {
      return html`
        <div class="info-card">
          <div class="info-row"><span class="info-label">Config file</span><span class="info-value">config/umbraco.yaml</span></div>
          <div class="info-row"><span class="info-label">Import runs</span><span class="info-value">On every application startup when the YAML file is present</span></div>
          <div class="info-row"><span class="info-label">File processed</span><span class="info-value">Renamed to <code>*.done</code> after a successful import</span></div>
        </div>`;
    }

    // "Not succeeded" is not the same as "failed": on a site that has never had a YAML
    // file, nothing has run at all, and reporting that as an error sent people looking
    // for a failure that never happened.
    const badge = this._status.lastImportSucceeded
      ? html`<span class="status-badge ok">Last import succeeded</span>`
      : this._status.pendingImport
        ? html`<span class="status-badge warn">Import pending — runs on next startup</span>`
        : html`<span class="status-badge">No import has run</span>`;

    return html`
      <div class="info-card">
        <div class="info-row"><span class="info-label">Status</span><span>${badge}</span></div>
        <div class="info-row"><span class="info-label">Config file</span><span class="info-value">${this._status.configPath ?? "config/umbraco.yaml"}</span></div>
        ${this._status.lastImportDate ? html`<div class="info-row"><span class="info-label">Last import</span><span class="info-value">${new Date(this._status.lastImportDate).toLocaleString()}</span></div>` : nothing}
        ${this._status.processedFile ? html`<div class="info-row"><span class="info-label">Processed file</span><span class="info-value">${this._status.processedFile}</span></div>` : nothing}
      </div>`;
  }

  override render() {
    return html`
      <div class="header">
        <h1>YAML Import</h1>
        <p>Declarative Infrastructure-as-Code bootstrapping for Umbraco — define your entire site structure in a YAML file.</p>
      </div>
      <div class="section"><h2>Status</h2>${this._renderStatus()}</div>
      <div class="section">
        <h2>Supported Entity Types</h2>
        <div class="entity-grid">${ENTITY_TYPES.map(label => html`<div class="entity-chip">${label}</div>`)}</div>
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
}

declare global {
  interface HTMLElementTagNameMap {
    "yaml2schema-dashboard": Yaml2SchemaDashboard;
  }
}

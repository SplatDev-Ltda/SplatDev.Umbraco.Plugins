// Schema2Yaml Dashboard — Lit element for Umbraco 14–17
// Registered as a custom element; referenced from umbraco-package.json.
// Uses UMB_AUTH_CONTEXT for authenticated API calls.

// Guard: Umbraco's @web/router listens to the Navigation API and tries to call
// history.pushState for every navigate event — including those triggered by
// showSaveFilePicker and <a download href="blob:"> clicks — which causes a
// SecurityError because blob: URLs cannot be pushed to the history stack.
// Installing a capturing listener here (before the router registers its own)
// lets us call navigateEvent.preventDefault() for blob: destinations, which
// tells the browser "this navigation is handled" and suppresses the pushState.
if (typeof window !== 'undefined' && window.navigation) {
    window.navigation.addEventListener('navigate', (e) => {
        if (e.destination?.url?.startsWith('blob:')) {
            e.preventDefault();
        }
    }, { capture: true });
}

import { LitElement, html, css, nothing, customElement, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';

const API_BASE = '/umbraco/api/SchemaExport';

@customElement('schema2yaml-dashboard')
export class Schema2YamlDashboard extends UmbElementMixin(LitElement) {

    @state() private _loading = false;
    @state() private _downloadingZip = false;
    @state() private _stats: any = null;
    @state() private _yaml = '';
    @state() private _yamlPreview = '';
    @state() private _previewTruncated = false;
    @state() private _hasExport = false;
    @state() private _profiles: any[] = [];
    @state() private _activeProfile: any = null;
    @state() private _showConfigDialog = false;
    @state() private _editingProfileId: string | null = null;
    @state() private _editingProfileName = '';
    @state() private _configuring = false;
    @state() private _loadingItems = false;
    @state() private _availableItems: any = null;
    @state() private _contentTree: any[] = [];
    @state() private _mediaTree: any[] = [];
    @state() private _expandedCategories: Record<string, boolean> = {};
    @state() private _expandedTreeNodes: Record<string, boolean> = {};

    static override styles = css`
        :host {
            display: block;
            padding: var(--uui-size-layout-1, 24px);
        }

        .header {
            margin-bottom: var(--uui-size-layout-2, 32px);
        }

        .header h1 {
            font-size: var(--uui-type-h3-size, 1.5rem);
            font-weight: 600;
            margin: 0 0 var(--uui-size-3, 8px) 0;
            color: var(--uui-color-text, #1b264f);
        }

        .header p {
            margin: 0;
            color: var(--uui-color-text-alt, #666);
        }

        .actions {
            display: flex;
            gap: var(--uui-size-3, 8px);
            flex-wrap: wrap;
            margin-bottom: var(--uui-size-layout-2, 32px);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: var(--uui-size-3, 8px);
            margin-bottom: var(--uui-size-layout-2, 32px);
        }

        .stat-card {
            background: var(--uui-color-surface, #fff);
            border: 1px solid var(--uui-color-border, #e3e3e3);
            border-radius: var(--uui-border-radius, 4px);
            padding: var(--uui-size-5, 16px);
            text-align: center;
        }

        .stat-label {
            font-size: 12px;
            color: var(--uui-color-text-alt, #595959);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: var(--uui-size-2, 6px);
        }

        .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: var(--uui-color-interactive, #1b264f);
            line-height: 1;
        }

        .stat-meta {
            font-size: 12px;
            color: var(--uui-color-text-alt, #595959);
            margin-top: var(--uui-size-2, 6px);
        }

        .preview-box {
            margin-top: var(--uui-size-layout-2, 32px);
        }

        .preview-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: var(--uui-size-3, 8px);
        }

        .preview-header h3 {
            margin: 0;
            font-size: var(--uui-type-h5-size, 1rem);
            font-weight: 600;
        }

        .truncated-note {
            font-size: 12px;
            font-style: italic;
            color: var(--uui-color-warning-emphasis, #a0522d);
        }

        pre.yaml {
            background: var(--uui-color-surface-alt, #f5f5f5);
            border: 1px solid var(--uui-color-border, #e3e3e3);
            border-radius: var(--uui-border-radius, 4px);
            padding: var(--uui-size-5, 16px);
            font-family: 'Courier New', Consolas, monospace;
            font-size: 12px;
            line-height: 1.6;
            max-height: 520px;
            overflow: auto;
            white-space: pre;
            margin: 0;
        }

        .config-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.5); z-index: 1000;
            display: flex; align-items: center; justify-content: center;
        }
        .config-dialog {
            background: var(--uui-color-surface,#fff);
            border-radius: var(--uui-border-radius,4px);
            box-shadow: 0 8px 32px rgba(0,0,0,.18);
            width: 900px; max-width: 96vw; max-height: 90vh;
            display: flex; flex-direction: column; overflow: hidden;
        }
        .config-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 24px;
            border-bottom: 1px solid var(--uui-color-border,#e3e3e3);
            font-weight: 600; font-size: 16px;
        }
        .config-body { display: flex; flex: 1; overflow: hidden; }
        .config-profiles {
            width: 210px; min-width: 170px;
            border-right: 1px solid var(--uui-color-border,#e3e3e3);
            display: flex; flex-direction: column; overflow-y: auto; padding: 16px; gap: 6px;
        }
        .config-selection { flex: 1; overflow-y: auto; padding: 16px 24px; }
        .config-footer {
            display: flex; gap: 8px; justify-content: flex-end;
            padding: 12px 24px;
            border-top: 1px solid var(--uui-color-border,#e3e3e3);
        }
        .profile-item {
            padding: 7px 10px; border-radius: 4px; cursor: pointer;
            display: flex; align-items: center; gap: 6px; font-size: 13px;
        }
        .profile-item:hover { background: var(--uui-color-surface-alt,#f5f5f5); }
        .profile-item.active-profile { background: var(--uui-color-selected,#e3edff); font-weight: 500; }
        .profile-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: var(--uui-color-positive,#2e7d32); flex-shrink: 0;
        }
        .profile-name-input {
            width: 100%; padding: 8px; box-sizing: border-box;
            border: 1px solid var(--uui-color-border,#ddd);
            border-radius: 4px; font-size: 14px; margin-bottom: 16px;
        }
        .section-label {
            font-size: 12px; font-weight: 600; text-transform: uppercase;
            color: var(--uui-color-text-alt,#595959); letter-spacing: .05em; margin-bottom: 8px;
        }
        .cat-row {
            display: flex; align-items: flex-start; gap: 8px;
            padding: 8px 0; border-bottom: 1px solid var(--uui-color-border,#f0f0f0);
        }
        .cat-row:last-child { border-bottom: none; }
        .cat-name { font-weight: 500; font-size: 14px; }
        .cat-meta { font-size: 12px; color: var(--uui-color-text-alt,#595959); margin-left: 4px; }
        .filter-toggle {
            font-size: 12px; color: var(--uui-color-interactive,#1b264f);
            cursor: pointer; margin-top: 4px; display: inline-block;
        }
        .entity-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .chip {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 4px 10px; border-radius: 16px; font-size: 12px;
            border: 1px solid var(--uui-color-border,#ddd);
            cursor: pointer; user-select: none;
            background: var(--uui-color-surface,#fff);
        }
        .chip.selected {
            background: var(--uui-color-interactive,#1b264f);
            border-color: var(--uui-color-interactive,#1b264f);
            color: #fff;
        }
    `;

    constructor() {
        super();
        this._loading = false;
        this._downloadingZip = false;
        this._stats = null;
        this._yaml = null;
        this._yamlPreview = null;
        this._previewTruncated = false;
        this._hasExport = false;
        this._authContext = null;
        this._notificationContext = null;
        this._profiles         = [];
        this._activeProfile    = null;
        this._showConfigDialog = false;
        this._editingProfileId   = null;
        this._editingProfileName = '';
        this._configuring        = this._defaultSelection();
        this._loadingItems       = false;
        this._availableItems     = null;
        this._contentTree        = null;
        this._mediaTree          = null;
        this._expandedCategories = new Set();
        this._expandedTreeNodes  = new Set();
    }

    _defaultSelection() {
        const cat = () => ({ includeAll: true, aliases: [], nodeIds: [] });
        return {
            languages: cat(), dataTypes: cat(), documentTypes: cat(),
            mediaTypes: cat(), templates: cat(), media: cat(),
            content: cat(), dictionaryItems: cat(), members: cat(), users: cat()
        };
    }

    connectedCallback() {
        super.connectedCallback();

        // Resolve auth context for authenticated fetches
        this.consumeContext(UMB_AUTH_CONTEXT, (ctx) => {
            this._authContext = ctx;
            // Load last-export statistics on mount (silently — may not exist yet)
            this._loadStatistics();
            this._loadActiveProfile();
        });

        // Resolve notification context for toast messages
        this.consumeContext(UMB_NOTIFICATION_CONTEXT, (ctx) => {
            this._notificationContext = ctx;
        });
    }

    // ─── Auth helpers ──────────────────────────────────────────────────────────

    async _getToken() {
        if (!this._authContext) return null;
        // getLatestToken() is deprecated in Umbraco 17 but functional until v19.
        // getOpenApiConfiguration() configures the OpenAPI SDK client and does not
        // expose a raw Bearer token for use in custom fetch() calls.
        return this._authContext.getLatestToken?.() ?? null;
    }

    async _fetchAuthenticated(path, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...(options.headers ?? {}) };
        const token = await this._getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(`${API_BASE}${path}`, { ...options, headers });
    }

    async _fetchWithAuth(url, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...(options.headers ?? {}) };
        const token = await this._getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(url, { ...options, headers });
    }

    // ─── API calls ─────────────────────────────────────────────────────────────

    async _loadStatistics() {
        try {
            const res = await this._fetchAuthenticated('/Statistics');
            if (res.ok) {
                const data = await res.json();
                if (data && data.dataTypes !== undefined) {
                    this._stats = data;
                }
            }
        } catch {
            // No prior export — silently ignore
        }
    }

    async _loadActiveProfile() {
        try {
            const res = await this._fetchWithAuth('/umbraco/api/ExportProfile/Active');
            if (res.status === 204) { this._activeProfile = null; return; }
            if (res.ok) this._activeProfile = await res.json();
        } catch { /* silently ignore */ }
    }

    async _deactivateProfile(e) {
        e.stopPropagation();
        try {
            await this._fetchWithAuth('/umbraco/api/ExportProfile/Deactivate', { method: 'POST' });
            this._activeProfile = null;
            this._notify('positive', 'Filter cleared', 'Next export will include everything.');
        } catch (err) {
            this._notify('danger', 'Failed to clear filter', err.message ?? 'Unknown error');
        }
    }

    async _runExport() {
        if (this._loading) return;

        this._loading   = true;
        this._hasExport = false;
        this._stats     = null;
        this._yaml      = null;
        this._yamlPreview = null;

        try {
            let res;
            if (this._activeProfile) {
                res = await this._fetchWithAuth('/umbraco/api/SchemaExport/ExportSelected', {
                    method: 'POST',
                    body: JSON.stringify(this._activeProfile.selection),
                });
            } else {
                res = await this._fetchAuthenticated('/Export');
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: res.statusText }));
                throw new Error(err.message ?? res.statusText);
            }

            const data = await res.json();
            this._stats = data.statistics;
            this._applyYaml(data.yaml);
            this._notify('positive', 'Export complete', 'Schema exported successfully.');
        } catch (e) {
            this._notify('danger', 'Export failed', e.message ?? 'An unexpected error occurred.');
        } finally {
            this._loading = false;
        }
    }

    _applyYaml(yaml) {
        const LIMIT = 10000;
        this._yaml = yaml;
        this._hasExport = true;

        if (yaml && yaml.length > LIMIT) {
            this._yamlPreview = yaml.substring(0, LIMIT);
            this._previewTruncated = true;
        } else {
            this._yamlPreview = yaml;
            this._previewTruncated = false;
        }
    }

    async _downloadYaml() {
        if (this._activeProfile) {
            await this._triggerDownloadPost(
                '/umbraco/api/SchemaExport/DownloadYamlSelected', this._activeProfile.selection);
        } else {
            await this._triggerDownload(`${API_BASE}/DownloadYaml`);
        }
    }

    async _downloadZip() {
        if (this._downloadingZip) return;
        this._downloadingZip = true;

        try {
            if (this._activeProfile) {
                await this._triggerDownloadPost(
                    '/umbraco/api/SchemaExport/DownloadZipSelected', this._activeProfile.selection);
            } else {
                await this._triggerDownload(`${API_BASE}/DownloadZip`);
            }
        } finally {
            // Small delay so the button state is visible before re-enabling
            setTimeout(() => { this._downloadingZip = false; }, 2000);
        }
    }

    async _triggerDownload(url) {
        // Fetch the file with authentication, then save it client-side.
        // A module-level capture listener on window.navigation (top of this file) cancels
        // any navigate event whose destination is a blob: URL before @web/router sees it,
        // preventing the SecurityError that would otherwise occur when the router tries to
        // call history.pushState with a blob: URL.
        try {
            const res = await this._fetchAuthenticated(url.replace(API_BASE, ''));

            if (!res.ok) {
                throw new Error(`Server returned ${res.status}: ${res.statusText}`);
            }

            const blob = await res.blob();

            // Derive filename from Content-Disposition header if present
            const cd = res.headers.get('Content-Disposition') ?? '';
            const match = cd.match(/filename[^;=\n]*=["']?([^"';\n]+)/i);
            let fallbackName = 'umbraco-export';
            if (url.toLowerCase().includes('zip')) fallbackName += '.zip';
            else if (url.toLowerCase().includes('yaml')) fallbackName += '.yml';
            const filename = match ? match[1].trim() : fallbackName;

            // Preferred: File System Access API (Chrome 86+, Edge 86+).
            if (typeof window.showSaveFilePicker === 'function') {
                const ext = filename.split('.').pop();
                const types = ext === 'zip'
                    ? [{ description: 'ZIP archive', accept: { 'application/zip': ['.zip'] } }]
                    : [{ description: 'YAML file',   accept: { 'application/x-yaml': ['.yml', '.yaml'] } }];
                try {
                    const handle = await window.showSaveFilePicker({ suggestedName: filename, types });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    return;
                } catch (pickerErr) {
                    if (pickerErr.name === 'AbortError') return; // User cancelled.
                    // Picker unavailable — fall through to anchor fallback.
                }
            }

            // Fallback: programmatic anchor download.
            // Safe because the module-level navigate guard prevents the router from
            // intercepting the blob: URL navigation.
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
        } catch (e) {
            this._notify('danger', 'Download failed', e.message ?? 'Could not download file.');
        }
    }

    async _triggerDownloadPost(url, body) {
        try {
            const res = await this._fetchWithAuth(url, {
                method: 'POST',
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}: ${res.statusText}`);
            const blob = await res.blob();
            const cd   = res.headers.get('Content-Disposition') ?? '';
            const match = cd.match(/filename[^;=\n]*=["']?([^"';\n]+)/i);
            let name = match ? match[1].trim() : (url.includes('zip') ? 'umbraco-export.zip' : 'umbraco-export.yml');
            if (typeof window.showSaveFilePicker === 'function') {
                const ext = name.split('.').pop();
                const types = ext === 'zip'
                    ? [{ description: 'ZIP archive', accept: { 'application/zip': ['.zip'] } }]
                    : [{ description: 'YAML file',   accept: { 'application/x-yaml': ['.yml','.yaml'] } }];
                try {
                    const handle = await window.showSaveFilePicker({ suggestedName: name, types });
                    const w = await handle.createWritable();
                    await w.write(blob); await w.close(); return;
                } catch (pe) { if (pe.name === 'AbortError') return; }
            }
            const obj = URL.createObjectURL(blob);
            const a = Object.assign(document.createElement('a'), { href: obj, download: name, style: 'display:none' });
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(obj), 100);
        } catch (e) {
            this._notify('danger', 'Download failed', e.message ?? 'Could not download file.');
        }
    }

    // ─── Notifications ─────────────────────────────────────────────────────────

    _notify(color, headline, message) {
        if (this._notificationContext) {
            this._notificationContext.peek(color, { data: { headline, message } });
        }
    }

    // ─── Config dialog ─────────────────────────────────────────────────────────

    async _openConfigDialog() {
        this._showConfigDialog = true;
        await this._loadProfiles();
        if (this._activeProfile) {
            this._editingProfileId   = this._activeProfile.id;
            this._editingProfileName = this._activeProfile.name;
            this._configuring        = JSON.parse(JSON.stringify(this._activeProfile.selection));
        } else if (this._profiles.length > 0) {
            await this._selectProfile(this._profiles[0].id);
        } else {
            this._newProfile();
        }
        if (!this._availableItems) await this._fetchAvailableItems();
    }

    async _loadProfiles() {
        try {
            const res = await this._fetchWithAuth('/umbraco/api/ExportProfile/List');
            if (res.ok) this._profiles = await res.json();
        } catch { /* silently ignore */ }
    }

    async _selectProfile(id) {
        try {
            const res = await this._fetchWithAuth(`/umbraco/api/ExportProfile/Get/${id}`);
            if (!res.ok) return;
            const p = await res.json();
            this._editingProfileId   = p.id;
            this._editingProfileName = p.name;
            this._configuring        = JSON.parse(JSON.stringify(p.selection));
        } catch { /* silently ignore */ }
    }

    _newProfile() {
        this._editingProfileId   = null;
        this._editingProfileName = '';
        this._configuring        = this._defaultSelection();
    }

    _closeConfigDialog() { this._showConfigDialog = false; }

    _renderConfigDialog() {
        return html`
            <div class="config-overlay"
                 role="dialog" aria-modal="true" aria-label="Configure Export"
                 @click=${(e) => { if (e.target === e.currentTarget) this._closeConfigDialog(); }}>
                <div class="config-dialog">
                    <div class="config-header">
                        Configure Export
                        <uui-button look="secondary" compact label="Close dialog" aria-label="Close dialog" @click=${this._closeConfigDialog}>✕</uui-button>
                    </div>

                    <div class="config-body">
                        <div class="config-profiles">
                            <div class="section-label">Profiles</div>
                            <uui-button look="secondary" compact label="New profile" @click=${this._newProfile}>
                                + New profile
                            </uui-button>
                            <hr style="border:none;border-top:1px solid var(--uui-color-border,#e3e3e3);margin:4px 0">

                            ${this._profiles.map(p => html`
                                <div class="profile-item ${this._editingProfileId === p.id ? 'active-profile' : ''}"
                                     @click=${() => this._selectProfile(p.id)}>
                                    ${p.isActive ? html`<span class="profile-dot"></span>` : nothing}
                                    ${p.name}
                                </div>`)}

                            ${this._editingProfileId !== null ? html`
                                <hr style="border:none;border-top:1px solid var(--uui-color-border,#e3e3e3);margin:8px 0">
                                <uui-button look="secondary" color="danger" compact
                                            label="Delete profile"
                                            @click=${this._deleteProfile}>
                                    Delete
                                </uui-button>` : nothing}
                        </div>

                        <div class="config-selection">
                            ${this._renderSelectionPanel()}
                        </div>
                    </div>

                    <div class="config-footer">
                        <uui-button look="secondary" label="Cancel" @click=${this._closeConfigDialog}>Cancel</uui-button>
                        <uui-button look="primary" color="default" label="Save" @click=${this._saveProfile}>Save</uui-button>
                        <uui-button look="primary" color="positive" label="Save and Apply" @click=${this._saveAndApplyProfile}>
                            Save &amp; Apply
                        </uui-button>
                    </div>
                </div>
            </div>`;
    }

    _renderSelectionPanel() {
        const flatCats = [
            { key: 'languages',       label: 'Languages',       items: this._availableItems?.languages },
            { key: 'dataTypes',       label: 'Data Types',       items: this._availableItems?.dataTypes },
            { key: 'documentTypes',   label: 'Document Types',   items: this._availableItems?.documentTypes },
            { key: 'mediaTypes',      label: 'Media Types',      items: this._availableItems?.mediaTypes },
            { key: 'templates',       label: 'Templates',        items: this._availableItems?.templates },
            { key: 'dictionaryItems', label: 'Dictionary Items', items: this._availableItems?.dictionaryItems },
            { key: 'members',         label: 'Members',          items: this._availableItems?.members },
            { key: 'users',           label: 'Users',            items: this._availableItems?.users },
        ];

        return html`
            <div class="section-label">Profile name</div>
            <input class="profile-name-input" type="text"
                   .value=${this._editingProfileName}
                   @input=${(e) => { this._editingProfileName = e.target.value; }}
                   placeholder="Enter profile name...">
            <div class="section-label">Selection</div>
            ${this._loadingItems
                ? html`<uui-loader-circle></uui-loader-circle>`
                : flatCats.map(c => this._renderFlatCategoryRow(c))}
            ${this._renderTreeCategoryRow('content', 'Content')}
            ${this._renderTreeCategoryRow('media',   'Media')}`;
    }

    _renderFlatCategoryRow({ key, label, items }) {
        const cat      = this._configuring[key];
        const included = cat.includeAll || cat.aliases.length > 0;
        const expanded = this._expandedCategories.has(key);

        return html`
            <div class="cat-row">
                <input type="checkbox" .checked=${included}
                       @change=${(e) => this._toggleCategory(key, e.target.checked)}>
                <div style="flex:1">
                    <span class="cat-name">${label}</span>
                    ${included && cat.includeAll
                        ? html`<span class="cat-meta">(all)</span>`
                        : nothing}
                    ${included && items?.length > 0 ? html`
                        <div>
                            <span class="filter-toggle"
                                  @click=${() => this._toggleEntityExpand(key)}>
                                ${expanded ? '▲ hide' : '▼ filter...'}
                            </span>
                        </div>
                        ${expanded ? html`
                            <div class="entity-list">
                                ${items.map(item => {
                                    const sel = cat.includeAll
                                        || cat.aliases.includes(item.alias);
                                    return html`
                                        <span class="chip ${sel ? 'selected' : ''}"
                                              @click=${() => {
                                                  if (!items?.length) return;
                                                  if (cat.includeAll) {
                                                      // Deselect one from "all" — keep every other alias selected
                                                      this._configuring = {
                                                          ...this._configuring,
                                                          [key]: {
                                                              includeAll: false,
                                                              aliases: items.map(i => i.alias)
                                                                            .filter(a => a !== item.alias),
                                                              nodeIds: []
                                                          }
                                                      };
                                                  } else {
                                                      this._toggleAlias(key, item.alias, !cat.aliases.includes(item.alias));
                                                  }
                                              }}>
                                            ${item.name}
                                        </span>`;
                                })}
                            </div>` : nothing}
                    ` : nothing}
                </div>
            </div>`;
    }

    _renderTreeCategoryRow(key, label) {
        const cat      = this._configuring[key];
        const included = cat.includeAll || (cat.nodeIds?.length ?? 0) > 0;
        const expanded = this._expandedCategories.has(key);
        const tree     = key === 'content' ? this._contentTree : this._mediaTree;

        return html`
            <div class="cat-row">
                <input type="checkbox" .checked=${included}
                       @change=${async (e) => {
                           this._toggleCategory(key, e.target.checked);
                           if (e.target.checked && !tree) {
                               if (key === 'content') await this._fetchContentTree();
                               else await this._fetchMediaTree();
                           }
                       }}>
                <div style="flex:1">
                    <span class="cat-name">${label}</span>
                    ${included && cat.includeAll
                        ? html`<span class="cat-meta">(all)</span>`
                        : nothing}
                    ${included ? html`
                        <div>
                            <span class="filter-toggle"
                                  @click=${async () => {
                                      this._toggleEntityExpand(key);
                                      if (!tree) {
                                          if (key === 'content') await this._fetchContentTree();
                                          else await this._fetchMediaTree();
                                      }
                                  }}>
                                ${expanded ? '▲ hide' : '▼ tree...'}
                            </span>
                        </div>
                        ${expanded && tree
                            ? html`<div style="margin-top:8px">
                                ${tree.map(n => this._renderTreeNode(key, n, 0))}
                              </div>`
                            : nothing}
                    ` : nothing}
                </div>
            </div>`;
    }

    _renderTreeNode(key, node, depth) {
        const cat        = this._configuring[key];
        const nodeIds    = cat?.nodeIds ?? [];
        const isSelected = cat?.includeAll || nodeIds.includes(node.id);
        const expandKey  = `${key}-${node.id}`;
        const isExpanded = this._expandedTreeNodes.has(expandKey);
        const hasChildren = (node.children ?? []).length > 0;

        return html`
            <div style="padding-left:${depth * 16}px;margin:2px 0">
                <div style="display:flex;align-items:center;gap:6px">
                    ${hasChildren
                        ? html`<span style="width:14px;font-size:12px;cursor:pointer;color:var(--uui-color-text-alt,#595959)"
                                     @click=${() => this._toggleTreeExpand(key, node.id)}>
                                   ${isExpanded ? '▼' : '▶'}
                               </span>`
                        : html`<span style="width:14px"></span>`}
                    <input type="checkbox" .checked=${isSelected}
                           @change=${(e) => {
                               if (cat.includeAll) {
                                   // Deselect one subtree from "all" — keep all other root descendants selected
                                   const tree = key === 'content' ? this._contentTree : this._mediaTree;
                                   const uncheckedIds = new Set(this._allDescendantIds(node));
                                   const remaining = (tree ?? [])
                                       .flatMap(r => this._allDescendantIds(r))
                                       .filter(id => !uncheckedIds.has(id));
                                   this._configuring = {
                                       ...this._configuring,
                                       [key]: { includeAll: false, aliases: [], nodeIds: remaining }
                                   };
                               } else {
                                   this._toggleNodeIds(key, node, e.target.checked);
                               }
                           }}>
                    <span style="font-size:13px">${node.name}</span>
                </div>
                ${isExpanded && hasChildren
                    ? node.children.map(c => this._renderTreeNode(key, c, depth + 1))
                    : nothing}
            </div>`;
    }

    // ─── Config dialog helpers (Task 13) ──────────────────────────────────────

    async _fetchAvailableItems() {
        this._loadingItems = true;
        try {
            const res = await this._fetchWithAuth('/umbraco/api/ExportItems/Available');
            if (res.ok) this._availableItems = await res.json();
        } catch { /* silently ignore */ }
        finally { this._loadingItems = false; }
    }

    _toggleCategory(key, enabled) {
        this._configuring = {
            ...this._configuring,
            [key]: { ...this._configuring[key], includeAll: enabled, aliases: [], nodeIds: [] }
        };
    }

    _toggleEntityExpand(key) {
        const next = new Set(this._expandedCategories);
        next.has(key) ? next.delete(key) : next.add(key);
        this._expandedCategories = next;
    }

    _toggleAlias(key, alias, selected) {
        const cat     = this._configuring[key];
        const aliases = selected
            ? [...cat.aliases, alias]
            : cat.aliases.filter(a => a !== alias);
        this._configuring = {
            ...this._configuring,
            [key]: { ...cat, includeAll: false, aliases }
        };
    }


    async _fetchContentTree() {
        try {
            const res = await this._fetchWithAuth('/umbraco/api/ExportItems/ContentTree');
            if (res.ok) this._contentTree = await res.json();
        } catch { /* silently ignore */ }
    }

    async _fetchMediaTree() {
        try {
            const res = await this._fetchWithAuth('/umbraco/api/ExportItems/MediaTree');
            if (res.ok) this._mediaTree = await res.json();
        } catch { /* silently ignore */ }
    }

    _toggleTreeExpand(categoryKey, nodeId) {
        const k    = `${categoryKey}-${nodeId}`;
        const next = new Set(this._expandedTreeNodes);
        next.has(k) ? next.delete(k) : next.add(k);
        this._expandedTreeNodes = next;
    }

    _allDescendantIds(node) {
        return [node.id, ...(node.children ?? []).flatMap(c => this._allDescendantIds(c))];
    }

    _toggleNodeIds(key, node, selected) {
        const ids  = this._allDescendantIds(node);
        const cat  = this._configuring[key];
        const prev = cat.nodeIds ?? [];
        const next = selected
            ? [...new Set([...prev, ...ids])]
            : prev.filter(id => !ids.includes(id));
        this._configuring = {
            ...this._configuring,
            [key]: { ...cat, includeAll: false, nodeIds: next }
        };
    }

    // ─── Config dialog stubs (Tasks 15) ────────────────────────────────────────

    async _saveProfile() {
        if (!this._editingProfileName.trim()) {
            this._notify('warning', 'Name required', 'Enter a profile name before saving.');
            return false;
        }
        try {
            let res, p;
            if (this._editingProfileId === null) {
                res = await this._fetchWithAuth('/umbraco/api/ExportProfile/Create', {
                    method: 'POST',
                    body: JSON.stringify({ name: this._editingProfileName, selection: this._configuring }),
                });
            } else {
                res = await this._fetchWithAuth(
                    `/umbraco/api/ExportProfile/Update/${this._editingProfileId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ name: this._editingProfileName, selection: this._configuring }),
                });
            }
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? res.statusText);
            p = await res.json();
            this._editingProfileId = p.id;
            await this._loadProfiles();
            this._notify('positive', 'Profile saved', `"${p.name}" saved.`);
            return true;
        } catch (e) {
            this._notify('danger', 'Save failed', e.message ?? 'Unknown error');
            return false;
        }
    }
    async _saveAndApplyProfile() {
        const saved = await this._saveProfile();
        if (!saved) return;
        try {
            const res = await this._fetchWithAuth(
                `/umbraco/api/ExportProfile/Activate/${this._editingProfileId}`,
                { method: 'POST' });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? res.statusText);
            await this._loadActiveProfile();
            this._closeConfigDialog();
            this._notify('positive', 'Profile applied', `Exporting with "${this._editingProfileName}".`);
        } catch (e) {
            this._notify('danger', 'Apply failed', e.message ?? 'Unknown error');
        }
    }
    async _deleteProfile() {
        if (this._editingProfileId === null) return;
        try {
            const res = await this._fetchWithAuth(
                `/umbraco/api/ExportProfile/Delete/${this._editingProfileId}`,
                { method: 'DELETE' });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? res.statusText);
            if (this._activeProfile?.id === this._editingProfileId)
                this._activeProfile = null;
            this._editingProfileId   = null;
            this._editingProfileName = '';
            this._configuring        = this._defaultSelection();
            await this._loadProfiles();
            this._notify('positive', 'Profile deleted', 'Profile removed.');
        } catch (e) {
            this._notify('danger', 'Delete failed', e.message ?? 'Unknown error');
        }
    }

    // ─── Render ────────────────────────────────────────────────────────────────

    _renderStats() {
        if (!this._stats) return nothing;

        const s = this._stats;

        return html`
            <div class="stats-grid">
                ${this._statCard('Languages',       s.languages)}
                ${this._statCard('Data Types',      s.dataTypes)}
                ${this._statCard('Document Types',  s.documentTypes)}
                ${this._statCard('Media Types',     s.mediaTypes)}
                ${this._statCard('Templates',       s.templates)}
                ${this._statCard('Content Nodes',   s.content)}
                ${this._statCard('Media Items',     s.media)}
                ${this._statCard('Dictionary Items',s.dictionaryItems)}
                ${this._statCard('Members',         s.members)}
                ${this._statCard('Users',           s.users)}
            </div>
            ${s.umbracoVersion ? html`
                <p class="stat-meta">
                    Exported ${s.exportDate ? new Date(s.exportDate).toLocaleString() : ''}
                    &mdash; Umbraco ${s.umbracoVersion}
                    ${s.durationSeconds != null ? html`&mdash; ${s.durationSeconds.toFixed(2)}s` : nothing}
                </p>` : nothing}
        `;
    }

    _statCard(label, value) {
        return html`
            <div class="stat-card">
                <div class="stat-label">${label}</div>
                <div class="stat-value">${value ?? 0}</div>
            </div>`;
    }

    _renderPreview() {
        if (!this._yamlPreview) return nothing;

        return html`
            <div class="preview-box">
                <div class="preview-header">
                    <h3>YAML Preview</h3>
                    ${this._previewTruncated
                        ? html`<span class="truncated-note">Showing first 10 000 chars — download for the full export</span>`
                        : nothing}
                </div>
                <pre class="yaml">${this._yamlPreview}${this._previewTruncated ? '\n… (truncated)' : ''}</pre>
            </div>`;
    }

    render() {
        const exportLabel = this._activeProfile
            ? `Export (${this._activeProfile.name})`
            : (this._loading ? 'Exporting…' : 'Export to YAML');

        return html`
            <div class="header">
                <h1>Schema Export</h1>
                <p>Export your Umbraco site structure to YAML for version control and migration.</p>
            </div>

            <div class="actions">
                <uui-button
                    look="primary"
                    color="default"
                    label=${exportLabel}
                    ?disabled=${this._loading}
                    @click=${this._runExport}>
                    ${this._loading ? html`<uui-loader-circle></uui-loader-circle>` : nothing}
                    ${exportLabel}
                    ${this._activeProfile ? html`
                        <span style="margin-left:6px;opacity:.7;font-size:11px"
                              @click=${this._deactivateProfile}
                              title="Clear filter — export everything">✕</span>` : nothing}
                </uui-button>

                <uui-button
                    look="secondary"
                    color="default"
                    label="Download YAML"
                    ?disabled=${!this._hasExport || this._loading}
                    @click=${this._downloadYaml}>
                    Download YAML
                </uui-button>

                <uui-button
                    look="secondary"
                    color="default"
                    label=${this._downloadingZip ? 'Preparing ZIP…' : 'Download ZIP (with media)'}
                    ?disabled=${this._downloadingZip || !this._hasExport}
                    @click=${this._downloadZip}>
                    ${this._downloadingZip ? html`<uui-loader-circle></uui-loader-circle>` : nothing}
                    ${this._downloadingZip ? 'Preparing ZIP…' : 'Download ZIP (with media)'}
                </uui-button>

                <uui-button look="secondary" color="default"
                    label="Configure Export" @click=${this._openConfigDialog}>
                    Configure Export
                </uui-button>
            </div>

            ${this._renderStats()}
            ${this._renderPreview()}
            ${this._showConfigDialog ? this._renderConfigDialog() : nothing}
        `;
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'schema2yaml-dashboard': Schema2YamlDashboard;
  }
}

import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface CopyMapping {
  id: number;
  name: string;
  sourceDocTypeAlias: string;
  targetDocTypeAlias: string;
  propertyMappingsJson: string;
  createdAt: string;
}

type FormData = Omit<CopyMapping, "id" | "createdAt"> & { id?: number };

interface CopyResult {
  success: boolean;
  message: string;
}

@customElement("copyvalue-dashboard")
export class CopyValueDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .toolbar { margin-bottom: 16px; }
    .form-card { background: var(--uui-color-surface-alt, #f9fafb); border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; padding: 20px; margin-bottom: 20px; max-width: 600px; }
    .form-card h3 { margin: 0 0 16px; font-size: 1rem; }
    .form-row { margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
    label { font-size: 0.8rem; font-weight: 600; }
    textarea { width: 100%; min-height: 100px; font-family: monospace; font-size: 0.85rem; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; resize: vertical; }
    .form-actions { display: flex; gap: 8px; margin-top: 16px; }
    .actions { display: flex; gap: 6px; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 24px 0; }
    uui-table { width: 100%; }
    code { background: #f3f4f6; padding: 1px 6px; border-radius: 4px; font-size: 0.8rem; }
    .result-ok { background: #d1fae5; color: #065f46; padding: 10px 14px; border-radius: 6px; margin-top: 12px; }
    .result-err { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 6px; margin-top: 12px; }
    .hint { color: #6b7280; font-size: 0.75rem; margin-top: 4px; }
  `;

  @state() private _mappings: CopyMapping[] = [];
  @state() private _loading = false;
  @state() private _showForm = false;
  @state() private _saving = false;
  @state() private _activeTab = "mappings";
  @state() private _form: FormData = this._emptyForm();
  @state() private _copyResult: CopyResult | null = null;
  @state() private _selectedMappingId = "";
  @state() private _sourceId = "";
  @state() private _targetId = "";
  @state() private _publish = false;

  private readonly _api = "/umbraco/api/copyvalue";

  private _emptyForm(): FormData {
    return { name: "", sourceDocTypeAlias: "", targetDocTypeAlias: "", propertyMappingsJson: "[]" };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private async _load(): Promise<void> {
    this._loading = true;
    try {
      const r = await this.#fetch(`${this._api}/GetMappings`);
      if (r.ok) this._mappings = await r.json();
    } catch { this._mappings = []; }
    finally { this._loading = false; }
  }

  private _edit(m: CopyMapping): void {
    this._form = { ...m };
    this._showForm = true;
  }

  private async _delete(m: CopyMapping): Promise<void> {
    if (!confirm(`Delete mapping '${m.name}'?`)) return;
    await this.#fetch(`${this._api}/DeleteMapping?id=${m.id}`, { method: "DELETE" });
    await this._load();
  }

  private async _save(): Promise<void> {
    this._saving = true;
    try {
      await this.#fetch(`${this._api}/SaveMapping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._form),
      });
      this._showForm = false;
      await this._load();
    } finally { this._saving = false; }
  }

  private async _executeCopy(): Promise<void> {
    const mapping = this._mappings.find(m => String(m.id) === this._selectedMappingId);
    if (!mapping) { alert("Select a mapping template."); return; }

    let mappings;
    try { mappings = JSON.parse(mapping.propertyMappingsJson); }
    catch { alert("Invalid JSON in mapping template."); return; }

    const r = await this.#fetch(`${this._api}/CopyProperties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceContentId: parseInt(this._sourceId),
        targetContentId: parseInt(this._targetId),
        mappings,
        publish: this._publish,
      }),
    });
    const ok = r.ok;
    const data = await r.json().catch(() => ({ message: "Unknown error" }));
    this._copyResult = { success: ok, message: data.message ?? (ok ? "Success" : "Failed") };
  }

  private _formatDate(d: string): string {
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  private _renderMappingsTab() {
    return html`
      <div class="toolbar">
        <uui-button look="primary" label="Add Mapping Template" @click=${() => { this._form = this._emptyForm(); this._showForm = true; }}>Add Mapping Template</uui-button>
      </div>

      ${this._showForm ? html`
        <div class="form-card">
          <h3>${this._form.id ? "Edit" : "New"} Mapping Template</h3>
          <div class="form-row">
            <label>Name</label>
            <uui-input .value=${this._form.name} @input=${(e: Event) => (this._form = { ...this._form, name: (e.target as HTMLInputElement).value })} placeholder="Blog → News copy"></uui-input>
          </div>
          <div class="form-row">
            <label>Source Document Type Alias</label>
            <uui-input .value=${this._form.sourceDocTypeAlias} @input=${(e: Event) => (this._form = { ...this._form, sourceDocTypeAlias: (e.target as HTMLInputElement).value })} placeholder="blogPost"></uui-input>
          </div>
          <div class="form-row">
            <label>Target Document Type Alias</label>
            <uui-input .value=${this._form.targetDocTypeAlias} @input=${(e: Event) => (this._form = { ...this._form, targetDocTypeAlias: (e.target as HTMLInputElement).value })} placeholder="newsArticle"></uui-input>
          </div>
          <div class="form-row">
            <label>Property Mappings (JSON)</label>
            <textarea .value=${this._form.propertyMappingsJson} @input=${(e: Event) => (this._form = { ...this._form, propertyMappingsJson: (e.target as HTMLTextAreaElement).value })} placeholder='[{"source":"pageTitle","target":"headline"}]'></textarea>
            <p class="hint">Array of {"{"}"source": "srcAlias", "target": "tgtAlias"{"}"} pairs.</p>
          </div>
          <div class="form-actions">
            <uui-button look="primary" label="Save" ?disabled=${this._saving} @click=${this._save}>Save</uui-button>
            <uui-button look="secondary" label="Cancel" @click=${() => (this._showForm = false)}>Cancel</uui-button>
          </div>
        </div>
      ` : nothing}

      ${this._loading
        ? html`<p>Loading mappings...</p>`
        : this._mappings.length === 0
        ? html`<p class="empty">No mapping templates found.</p>`
        : html`
          <uui-box headline="Mapping Templates (${this._mappings.length})">
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Name</uui-table-head-cell>
                <uui-table-head-cell>Source Doc Type</uui-table-head-cell>
                <uui-table-head-cell>Target Doc Type</uui-table-head-cell>
                <uui-table-head-cell>Created</uui-table-head-cell>
                <uui-table-head-cell>Actions</uui-table-head-cell>
              </uui-table-head>
              ${this._mappings.map(m => html`
                <uui-table-row>
                  <uui-table-cell><strong>${m.name}</strong></uui-table-cell>
                  <uui-table-cell><code>${m.sourceDocTypeAlias}</code></uui-table-cell>
                  <uui-table-cell><code>${m.targetDocTypeAlias}</code></uui-table-cell>
                  <uui-table-cell>${this._formatDate(m.createdAt)}</uui-table-cell>
                  <uui-table-cell>
                    <div class="actions">
                      <uui-button look="secondary" label="Edit" @click=${() => this._edit(m)}>Edit</uui-button>
                      <uui-button look="danger" label="Delete" @click=${() => this._delete(m)}>Delete</uui-button>
                    </div>
                  </uui-table-cell>
                </uui-table-row>
              `)}
            </uui-table>
          </uui-box>
        `}
    `;
  }

  private _renderCopyTab() {
    return html`
      <div class="form-card">
        <h3>Execute Property Copy</h3>
        <div class="form-row">
          <label>Mapping Template</label>
          <select @change=${(e: Event) => (this._selectedMappingId = (e.target as HTMLSelectElement).value)}>
            <option value="">— Select a mapping —</option>
            ${this._mappings.map(m => html`<option value="${m.id}">${m.name}</option>`)}
          </select>
        </div>
        <div class="form-row">
          <label>Source Content ID</label>
          <uui-input type="number" placeholder="1234" @input=${(e: Event) => (this._sourceId = (e.target as HTMLInputElement).value)}></uui-input>
        </div>
        <div class="form-row">
          <label>Target Content ID</label>
          <uui-input type="number" placeholder="5678" @input=${(e: Event) => (this._targetId = (e.target as HTMLInputElement).value)}></uui-input>
        </div>
        <div class="form-row">
          <uui-toggle .checked=${this._publish} @change=${(e: Event) => (this._publish = (e.target as HTMLInputElement).checked)} label="Publish after copy"></uui-toggle>
        </div>
        <uui-button look="primary" label="Execute Copy" @click=${this._executeCopy}>Execute Copy</uui-button>
        ${this._copyResult ? html`<div class="${this._copyResult.success ? "result-ok" : "result-err"}">${this._copyResult.message}</div>` : nothing}
      </div>
    `;
  }

  override render() {
    return html`
      <h1>Copy Value</h1>
      <p class="description">Copy property values between content nodes using reusable mapping templates.</p>

      <uui-tab-group>
        <uui-tab label="Mapping Templates" ?active=${this._activeTab === "mappings"} @click=${() => (this._activeTab = "mappings")}>Mapping Templates</uui-tab>
        <uui-tab label="Execute Copy" ?active=${this._activeTab === "copy"} @click=${() => (this._activeTab = "copy")}>Execute Copy</uui-tab>
      </uui-tab-group>

      <div style="margin-top:16px;">
        ${this._activeTab === "mappings" ? this._renderMappingsTab() : this._renderCopyTab()}
      </div>
    `;
  }
}

export default CopyValueDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "copyvalue-dashboard": CopyValueDashboardElement;
  }
}

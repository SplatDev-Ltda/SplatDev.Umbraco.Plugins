import { LitElement as d, nothing as c, html as o, css as h, state as i, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, a = (e, s, r, p) => {
  for (var l = p > 1 ? void 0 : p ? _(s, r) : s, u = e.length - 1, n; u >= 0; u--)
    (n = e[u]) && (l = (p ? n(s, r, l) : n(l)) || l);
  return p && l && g(s, r, l), l;
};
let t = class extends b(d) {
  constructor() {
    super(...arguments), this._mappings = [], this._loading = !1, this._showForm = !1, this._saving = !1, this._activeTab = "mappings", this._form = this._emptyForm(), this._copyResult = null, this._selectedMappingId = "", this._sourceId = "", this._targetId = "", this._publish = !1, this._api = "/umbraco/api/copyvalue";
  }
  _emptyForm() {
    return { name: "", sourceDocTypeAlias: "", targetDocTypeAlias: "", propertyMappingsJson: "[]" };
  }
  connectedCallback() {
    super.connectedCallback(), this._load();
  }
  async _load() {
    this._loading = !0;
    try {
      const e = await fetch(`${this._api}/GetMappings`);
      e.ok && (this._mappings = await e.json());
    } catch {
      this._mappings = [];
    } finally {
      this._loading = !1;
    }
  }
  _edit(e) {
    this._form = { ...e }, this._showForm = !0;
  }
  async _delete(e) {
    confirm(`Delete mapping '${e.name}'?`) && (await fetch(`${this._api}/DeleteMapping?id=${e.id}`, { method: "DELETE" }), await this._load());
  }
  async _save() {
    this._saving = !0;
    try {
      await fetch(`${this._api}/SaveMapping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._form)
      }), this._showForm = !1, await this._load();
    } finally {
      this._saving = !1;
    }
  }
  async _executeCopy() {
    const e = this._mappings.find((u) => String(u.id) === this._selectedMappingId);
    if (!e) {
      alert("Select a mapping template.");
      return;
    }
    let s;
    try {
      s = JSON.parse(e.propertyMappingsJson);
    } catch {
      alert("Invalid JSON in mapping template.");
      return;
    }
    const r = await fetch(`${this._api}/CopyProperties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceContentId: parseInt(this._sourceId),
        targetContentId: parseInt(this._targetId),
        mappings: s,
        publish: this._publish
      })
    }), p = r.ok, l = await r.json().catch(() => ({ message: "Unknown error" }));
    this._copyResult = { success: p, message: l.message ?? (p ? "Success" : "Failed") };
  }
  _formatDate(e) {
    return new Date(e).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
  _renderMappingsTab() {
    return o`
      <div class="toolbar">
        <uui-button look="primary" label="Add Mapping Template" @click=${() => {
      this._form = this._emptyForm(), this._showForm = !0;
    }}>Add Mapping Template</uui-button>
      </div>

      ${this._showForm ? o`
        <div class="form-card">
          <h3>${this._form.id ? "Edit" : "New"} Mapping Template</h3>
          <div class="form-row">
            <label>Name</label>
            <uui-input .value=${this._form.name} @input=${(e) => this._form = { ...this._form, name: e.target.value }} placeholder="Blog → News copy"></uui-input>
          </div>
          <div class="form-row">
            <label>Source Document Type Alias</label>
            <uui-input .value=${this._form.sourceDocTypeAlias} @input=${(e) => this._form = { ...this._form, sourceDocTypeAlias: e.target.value }} placeholder="blogPost"></uui-input>
          </div>
          <div class="form-row">
            <label>Target Document Type Alias</label>
            <uui-input .value=${this._form.targetDocTypeAlias} @input=${(e) => this._form = { ...this._form, targetDocTypeAlias: e.target.value }} placeholder="newsArticle"></uui-input>
          </div>
          <div class="form-row">
            <label>Property Mappings (JSON)</label>
            <textarea .value=${this._form.propertyMappingsJson} @input=${(e) => this._form = { ...this._form, propertyMappingsJson: e.target.value }} placeholder='[{"source":"pageTitle","target":"headline"}]'></textarea>
            <p class="hint">Array of {"{"}"source": "srcAlias", "target": "tgtAlias"{"}"} pairs.</p>
          </div>
          <div class="form-actions">
            <uui-button look="primary" label="Save" ?disabled=${this._saving} @click=${this._save}>Save</uui-button>
            <uui-button look="secondary" label="Cancel" @click=${() => this._showForm = !1}>Cancel</uui-button>
          </div>
        </div>
      ` : c}

      ${this._loading ? o`<p>Loading mappings...</p>` : this._mappings.length === 0 ? o`<p class="empty">No mapping templates found.</p>` : o`
          <uui-box headline="Mapping Templates (${this._mappings.length})">
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Name</uui-table-head-cell>
                <uui-table-head-cell>Source Doc Type</uui-table-head-cell>
                <uui-table-head-cell>Target Doc Type</uui-table-head-cell>
                <uui-table-head-cell>Created</uui-table-head-cell>
                <uui-table-head-cell>Actions</uui-table-head-cell>
              </uui-table-head>
              ${this._mappings.map((e) => o`
                <uui-table-row>
                  <uui-table-cell><strong>${e.name}</strong></uui-table-cell>
                  <uui-table-cell><code>${e.sourceDocTypeAlias}</code></uui-table-cell>
                  <uui-table-cell><code>${e.targetDocTypeAlias}</code></uui-table-cell>
                  <uui-table-cell>${this._formatDate(e.createdAt)}</uui-table-cell>
                  <uui-table-cell>
                    <div class="actions">
                      <uui-button look="secondary" label="Edit" @click=${() => this._edit(e)}>Edit</uui-button>
                      <uui-button look="danger" label="Delete" @click=${() => this._delete(e)}>Delete</uui-button>
                    </div>
                  </uui-table-cell>
                </uui-table-row>
              `)}
            </uui-table>
          </uui-box>
        `}
    `;
  }
  _renderCopyTab() {
    return o`
      <div class="form-card">
        <h3>Execute Property Copy</h3>
        <div class="form-row">
          <label>Mapping Template</label>
          <select @change=${(e) => this._selectedMappingId = e.target.value}>
            <option value="">— Select a mapping —</option>
            ${this._mappings.map((e) => o`<option value="${e.id}">${e.name}</option>`)}
          </select>
        </div>
        <div class="form-row">
          <label>Source Content ID</label>
          <uui-input type="number" placeholder="1234" @input=${(e) => this._sourceId = e.target.value}></uui-input>
        </div>
        <div class="form-row">
          <label>Target Content ID</label>
          <uui-input type="number" placeholder="5678" @input=${(e) => this._targetId = e.target.value}></uui-input>
        </div>
        <div class="form-row">
          <uui-toggle .checked=${this._publish} @change=${(e) => this._publish = e.target.checked} label="Publish after copy"></uui-toggle>
        </div>
        <uui-button look="primary" label="Execute Copy" @click=${this._executeCopy}>Execute Copy</uui-button>
        ${this._copyResult ? o`<div class="${this._copyResult.success ? "result-ok" : "result-err"}">${this._copyResult.message}</div>` : c}
      </div>
    `;
  }
  render() {
    return o`
      <h1>Copy Value</h1>
      <p class="description">Copy property values between content nodes using reusable mapping templates.</p>

      <uui-tab-group>
        <uui-tab label="Mapping Templates" ?active=${this._activeTab === "mappings"} @click=${() => this._activeTab = "mappings"}>Mapping Templates</uui-tab>
        <uui-tab label="Execute Copy" ?active=${this._activeTab === "copy"} @click=${() => this._activeTab = "copy"}>Execute Copy</uui-tab>
      </uui-tab-group>

      <div style="margin-top:16px;">
        ${this._activeTab === "mappings" ? this._renderMappingsTab() : this._renderCopyTab()}
      </div>
    `;
  }
};
t.styles = h`
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
a([
  i()
], t.prototype, "_mappings", 2);
a([
  i()
], t.prototype, "_loading", 2);
a([
  i()
], t.prototype, "_showForm", 2);
a([
  i()
], t.prototype, "_saving", 2);
a([
  i()
], t.prototype, "_activeTab", 2);
a([
  i()
], t.prototype, "_form", 2);
a([
  i()
], t.prototype, "_copyResult", 2);
a([
  i()
], t.prototype, "_selectedMappingId", 2);
a([
  i()
], t.prototype, "_sourceId", 2);
a([
  i()
], t.prototype, "_targetId", 2);
a([
  i()
], t.prototype, "_publish", 2);
t = a([
  m("copyvalue-dashboard")
], t);
const v = t;
export {
  t as CopyValueDashboardElement,
  v as default
};

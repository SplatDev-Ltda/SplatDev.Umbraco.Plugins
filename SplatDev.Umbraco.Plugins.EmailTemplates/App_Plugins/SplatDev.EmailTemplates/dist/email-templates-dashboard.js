import { LitElement as p, html as l, css as h, state as s, customElement as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
var y = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, i = (e, a, o, r) => {
  for (var u = r > 1 ? void 0 : r ? _(a, o) : a, d = e.length - 1, n; d >= 0; d--)
    (n = e[d]) && (u = (r ? n(a, o, u) : n(u)) || u);
  return r && u && y(a, o, u), u;
};
const m = "/umbraco/management/api/v1/email-templates", c = "/umbraco/management/api/v1/email-style";
let t = class extends b(p) {
  constructor() {
    super(...arguments), this._templates = [], this._style = null, this._loading = !1, this._message = "", this._messageType = "", this._activeTab = "templates", this._showForm = !1, this._editingTemplate = null, this._form = {
      name: "",
      subject: "",
      htmlBody: "",
      textBody: "",
      variables: "",
      category: "transactional"
    }, this._showPreview = !1, this._previewHtml = "", this._previewVariables = "", this._showVariables = !1, this._variableList = [], this._styleForm = {
      logoUrl: "",
      primaryColor: "",
      companyName: "",
      headerHtml: "",
      footerHtml: "",
      globalCss: ""
    };
  }
  connectedCallback() {
    super.connectedCallback(), this._loadTemplates(), this._loadStyle();
  }
  _showMessage(e, a = "success") {
    this._message = e, this._messageType = a, setTimeout(() => {
      this._message = "", this._messageType = "";
    }, 4e3);
  }
  async _api(e, a, o) {
    try {
      const r = await fetch(`${e}${a}`, {
        headers: { "Content-Type": "application/json", ...o == null ? void 0 : o.headers },
        ...o
      });
      if (r.status === 204) return null;
      if ((r.headers.get("content-type") || "").includes("text/html"))
        return await r.text();
      if (r.ok) return r.json();
      const d = await r.text();
      return this._showMessage(d || `Request failed (${r.status})`, "error"), null;
    } catch {
      return this._showMessage("Network error", "error"), null;
    }
  }
  async _loadTemplates() {
    this._loading = !0;
    const e = await this._api(m, "");
    e && (this._templates = e), this._loading = !1;
  }
  async _loadStyle() {
    const e = await this._api(c, "");
    e && (this._style = e, this._styleForm = {
      logoUrl: e.logoUrl ?? "",
      primaryColor: e.primaryColor ?? "",
      companyName: e.companyName ?? "",
      headerHtml: e.headerHtml ?? "",
      footerHtml: e.footerHtml ?? "",
      globalCss: e.globalCss ?? ""
    });
  }
  _openCreateForm() {
    this._editingTemplate = null, this._form = {
      name: "",
      subject: "",
      htmlBody: "",
      textBody: "",
      variables: "",
      category: "transactional"
    }, this._showForm = !0;
  }
  _openEditForm(e) {
    this._editingTemplate = e, this._form = {
      name: e.name,
      subject: e.subject,
      htmlBody: e.htmlBody,
      textBody: e.textBody ?? "",
      variables: e.variables ?? "",
      category: e.category
    }, this._showForm = !0;
  }
  _closeForm() {
    this._showForm = !1, this._editingTemplate = null;
  }
  async _saveTemplate() {
    const e = {
      name: this._form.name.trim(),
      subject: this._form.subject.trim(),
      htmlBody: this._form.htmlBody.trim(),
      textBody: this._form.textBody.trim() || null,
      variables: this._form.variables.trim() || null,
      category: this._form.category.trim() || "transactional"
    };
    if (!e.name || !e.htmlBody) {
      this._showMessage("Name and HTML Body are required.", "error");
      return;
    }
    this._editingTemplate ? await this._api(
      m,
      `/${this._editingTemplate.id}`,
      { method: "PUT", body: JSON.stringify(e) }
    ) && (this._closeForm(), await this._loadTemplates(), this._showMessage(`Template "${e.name}" updated.`)) : await this._api(
      m,
      "/create",
      { method: "POST", body: JSON.stringify(e) }
    ) && (this._closeForm(), await this._loadTemplates(), this._showMessage(`Template "${e.name}" created.`));
  }
  async _deleteTemplate(e) {
    this._loading = !0, await this._api(m, `/${e}`, { method: "DELETE" }), await this._loadTemplates(), this._loading = !1, this._showMessage("Template deleted.");
  }
  async _previewTemplate(e) {
    this._showPreview = !0, this._previewHtml = "";
    const a = this._previewVariables.trim() ? `?variables=${encodeURIComponent(this._previewVariables.trim())}` : "", o = await this._api(
      m,
      `/${e.id}/preview${a}`
    );
    this._previewHtml = o ?? "";
  }
  async _showTemplateVariables(e) {
    this._showVariables = !0, this._variableList = [];
    const a = await this._api(
      m,
      `/${e.id}/variables`
    );
    this._variableList = a ?? [];
  }
  async _saveStyle() {
    const e = {
      id: 1,
      logoUrl: this._styleForm.logoUrl.trim() || null,
      primaryColor: this._styleForm.primaryColor.trim() || null,
      companyName: this._styleForm.companyName.trim() || null,
      headerHtml: this._styleForm.headerHtml.trim() || null,
      footerHtml: this._styleForm.footerHtml.trim() || null,
      globalCss: this._styleForm.globalCss.trim() || null,
      updatedAt: null
    }, a = await this._api(c, "", {
      method: "PUT",
      body: JSON.stringify(e)
    });
    a && (this._style = a, this._showMessage("Style settings saved."));
  }
  _formatDate(e) {
    return e ? new Date(e).toLocaleDateString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric"
    }) : "-";
  }
  _renderMessage() {
    return this._message ? l`
      <div class="message ${this._messageType}">${this._message}</div>
    ` : "";
  }
  // ── Templates tab ───────────────────────────────────────────────────────
  _renderTemplatesTable() {
    return this._loading ? l`<div class="loading">Loading...</div>` : this._templates.length === 0 ? l`
        <div class="empty">
          <p>No email templates yet.</p>
          <uui-button
            look="primary"
            color="default"
            label="Create your first template"
            @click=${this._openCreateForm}
          >
            Create your first template
          </uui-button>
        </div>
      ` : l`
      <uui-table>
        <uui-table-head>
          <uui-table-head-cell>Name</uui-table-head-cell>
          <uui-table-head-cell>Subject</uui-table-head-cell>
          <uui-table-head-cell>Category</uui-table-head-cell>
          <uui-table-head-cell>Updated</uui-table-head-cell>
          <uui-table-head-cell></uui-table-head-cell>
        </uui-table-head>
        ${this._templates.map(
      (e) => l`
            <uui-table-row>
              <uui-table-cell>${e.name}</uui-table-cell>
              <uui-table-cell>${e.subject}</uui-table-cell>
              <uui-table-cell>
                <uui-tag look="default">${e.category}</uui-tag>
              </uui-table-cell>
              <uui-table-cell>${this._formatDate(e.updatedAt)}</uui-table-cell>
              <uui-table-cell>
                <div class="row-actions">
                  <uui-button
                    look="primary"
                    label="Edit"
                    compact
                    @click=${() => this._openEditForm(e)}
                  >
                    Edit
                  </uui-button>
                  <uui-button
                    look="secondary"
                    label="Preview"
                    compact
                    @click=${() => this._previewTemplate(e)}
                  >
                    Preview
                  </uui-button>
                  <uui-button
                    look="secondary"
                    label="Variables"
                    compact
                    @click=${() => this._showTemplateVariables(e)}
                  >
                    Variables
                  </uui-button>
                  <uui-button
                    look="danger"
                    label="Delete"
                    compact
                    @click=${() => this._deleteTemplate(e.id)}
                  >
                    Delete
                  </uui-button>
                </div>
              </uui-table-cell>
            </uui-table-row>
          `
    )}
      </uui-table>
    `;
  }
  _renderTemplateForm() {
    return l`
      <uui-box
        headline=${this._editingTemplate ? "Edit Template" : "New Template"}
      >
        <div class="form-grid">
          <div class="form-field">
            <label for="tmpl-name">Name *</label>
            <uui-input
              id="tmpl-name"
              .value=${this._form.name}
              @input=${(e) => this._form.name = e.target.value}
            ></uui-input>
          </div>

          <div class="form-field">
            <label for="tmpl-subject">Subject</label>
            <uui-input
              id="tmpl-subject"
              .value=${this._form.subject}
              @input=${(e) => this._form.subject = e.target.value}
            ></uui-input>
          </div>

          <div class="form-field">
            <label for="tmpl-category">Category</label>
            <uui-select
              id="tmpl-category"
              .value=${this._form.category}
              @change=${(e) => this._form.category = e.target.value}
            >
              <uui-select-option value="transactional"
                >Transactional</uui-select-option
              >
              <uui-select-option value="newsletter"
                >Newsletter</uui-select-option
              >
              <uui-select-option value="marketing"
                >Marketing</uui-select-option
              >
              <uui-select-option value="notification"
                >Notification</uui-select-option
              >
            </uui-select>
          </div>

          <div class="form-field">
            <label for="tmpl-vars"
              >Variables (comma-separated, e.g. MemberName,ContractRef)</label
            >
            <uui-input
              id="tmpl-vars"
              .value=${this._form.variables}
              placeholder="MemberName,ContractRef"
              @input=${(e) => this._form.variables = e.target.value}
            ></uui-input>
          </div>

          <div class="form-field full-width">
            <label for="tmpl-html">HTML Body *</label>
            <uui-textarea
              id="tmpl-html"
              rows="16"
              .value=${this._form.htmlBody}
              @input=${(e) => this._form.htmlBody = e.target.value}
            ></uui-textarea>
            <small
              >Use {{VariableName}} for dynamic substitution.</small
            >
          </div>

          <div class="form-field full-width">
            <label for="tmpl-text">Plain Text Body</label>
            <uui-textarea
              id="tmpl-text"
              rows="8"
              .value=${this._form.textBody}
              @input=${(e) => this._form.textBody = e.target.value}
            ></uui-textarea>
          </div>
        </div>

        <div class="form-actions">
          <uui-button
            look="primary"
            color="positive"
            label="Save template"
            @click=${this._saveTemplate}
          >
            ${this._editingTemplate ? "Update" : "Create"}
          </uui-button>
          <uui-button
            look="secondary"
            label="Cancel"
            @click=${this._closeForm}
          >
            Cancel
          </uui-button>
        </div>
      </uui-box>
    `;
  }
  _renderPreviewModal() {
    return this._showPreview ? l`
      <div class="modal-overlay" @click=${() => this._showPreview = !1}>
        <div class="modal" @click=${(e) => e.stopPropagation()}>
          <div class="modal-header">
            <h2>Preview</h2>
            <uui-button
              look="secondary"
              label="Close"
              @click=${() => this._showPreview = !1}
            >
              Close
            </uui-button>
          </div>
          <div class="modal-body">
            <div class="form-field">
              <label for="preview-vars"
                >Variables (key=value; separated)</label
              >
              <uui-input
                id="preview-vars"
                .value=${this._previewVariables}
                placeholder="MemberName=John;ContractRef=C-001"
                @input=${(e) => this._previewVariables = e.target.value}
              ></uui-input>
              <small
                >Format: key1=value1;key2=value2</small
              >
            </div>
            <iframe
              class="preview-frame"
              srcdoc=${this._previewHtml || "<p>Loading...</p>"}
            ></iframe>
          </div>
        </div>
      </div>
    ` : "";
  }
  _renderVariablesModal() {
    return this._showVariables ? l`
      <div class="modal-overlay" @click=${() => this._showVariables = !1}>
        <div class="modal modal-sm" @click=${(e) => e.stopPropagation()}>
          <div class="modal-header">
            <h2>Template Variables</h2>
            <uui-button
              look="secondary"
              label="Close"
              @click=${() => this._showVariables = !1}
            >
              Close
            </uui-button>
          </div>
          <div class="modal-body">
            ${this._variableList.length === 0 ? l`<p>No variables found in this template.</p>` : l`
                  <div class="variable-list">
                    ${this._variableList.map(
      (e) => l`<uui-tag look="primary">{{${e}}}</uui-tag>`
    )}
                  </div>
                `}
          </div>
        </div>
      </div>
    ` : "";
  }
  _renderTemplatesTab() {
    return l`
      <uui-box headline="Email Templates">
        <div class="toolbar" slot="header-actions">
          <uui-button
            look="primary"
            color="positive"
            label="Create Template"
            @click=${this._openCreateForm}
          >
            Create Template
          </uui-button>
        </div>
        ${this._renderTemplatesTable()}
      </uui-box>

      ${this._showForm ? this._renderTemplateForm() : ""}
      ${this._renderPreviewModal()}
      ${this._renderVariablesModal()}
    `;
  }
  // ── Style settings tab ──────────────────────────────────────────────────
  _renderStyleTab() {
    return l`
      <uui-box headline="Global Email Style">
        <p class="description">
          These settings apply to all email previews. Header and footer HTML
          wrap every rendered template.
        </p>
        <div class="form-grid">
          <div class="form-field">
            <label for="style-company">Company Name</label>
            <uui-input
              id="style-company"
              .value=${this._styleForm.companyName}
              @input=${(e) => this._styleForm.companyName = e.target.value}
            ></uui-input>
          </div>

          <div class="form-field">
            <label for="style-logo">Logo URL</label>
            <uui-input
              id="style-logo"
              .value=${this._styleForm.logoUrl}
              placeholder="https://example.com/logo.png"
              @input=${(e) => this._styleForm.logoUrl = e.target.value}
            ></uui-input>
          </div>

          <div class="form-field">
            <label for="style-color">Primary Color</label>
            <uui-input
              id="style-color"
              .value=${this._styleForm.primaryColor}
              placeholder="#333333"
              @input=${(e) => this._styleForm.primaryColor = e.target.value}
            ></uui-input>
            ${this._styleForm.primaryColor ? l`
                  <span
                    class="color-swatch"
                    style="background:${this._styleForm.primaryColor}"
                  ></span>
                ` : ""}
          </div>

          <div class="form-field full-width">
            <label for="style-header">Header HTML</label>
            <uui-textarea
              id="style-header"
              rows="6"
              .value=${this._styleForm.headerHtml}
              @input=${(e) => this._styleForm.headerHtml = e.target.value}
            ></uui-textarea>
            <small
              >Injected after the logo and before the main content.</small
            >
          </div>

          <div class="form-field full-width">
            <label for="style-footer">Footer HTML</label>
            <uui-textarea
              id="style-footer"
              rows="6"
              .value=${this._styleForm.footerHtml}
              @input=${(e) => this._styleForm.footerHtml = e.target.value}
            ></uui-textarea>
            <small>Injected after the main content.</small>
          </div>

          <div class="form-field full-width">
            <label for="style-css">Global CSS</label>
            <uui-textarea
              id="style-css"
              rows="8"
              .value=${this._styleForm.globalCss}
              placeholder="body { font-family: Arial, sans-serif; }"
              @input=${(e) => this._styleForm.globalCss = e.target.value}
            ></uui-textarea>
          </div>
        </div>

        <div class="form-actions">
          <uui-button
            look="primary"
            color="positive"
            label="Save style settings"
            @click=${this._saveStyle}
          >
            Save Settings
          </uui-button>
        </div>
      </uui-box>
    `;
  }
  // ── Main render ─────────────────────────────────────────────────────────
  render() {
    return l`
      <div class="dashboard">
        ${this._renderMessage()}

        <uui-tab-group>
          <uui-tab
            ?active=${this._activeTab === "templates"}
            label="Templates"
            @click=${() => this._activeTab = "templates"}
          >
            Templates
          </uui-tab>
          <uui-tab
            ?active=${this._activeTab === "style"}
            label="Style Settings"
            @click=${() => this._activeTab = "style"}
          >
            Style Settings
          </uui-tab>
        </uui-tab-group>

        <div class="tab-content">
          ${this._activeTab === "templates" ? this._renderTemplatesTab() : ""}
          ${this._activeTab === "style" ? this._renderStyleTab() : ""}
        </div>
      </div>
    `;
  }
};
t.styles = h`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .dashboard {
      max-width: 1200px;
    }

    .message {
      padding: var(--uui-size-space-3) var(--uui-size-space-4);
      border-radius: var(--uui-border-radius);
      margin-bottom: var(--uui-size-space-4);
      font-weight: 500;
    }

    .message.success {
      background-color: var(--uui-color-positive);
      color: var(--uui-color-positive-contrast);
    }

    .message.error {
      background-color: var(--uui-color-danger);
      color: var(--uui-color-danger-contrast);
    }

    uui-tab-group {
      margin-bottom: var(--uui-size-space-5);
    }

    .tab-content {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-5);
    }

    .toolbar {
      display: flex;
      gap: var(--uui-size-space-3);
      align-items: center;
    }

    .row-actions {
      display: flex;
      gap: var(--uui-size-space-2);
      flex-wrap: wrap;
    }

    .loading {
      padding: var(--uui-size-space-6);
      text-align: center;
      color: var(--uui-color-text-alt);
    }

    .empty {
      padding: var(--uui-size-space-8);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--uui-size-space-4);
      color: var(--uui-color-text-alt);
    }

    .description {
      color: var(--uui-color-text-alt);
      margin-bottom: var(--uui-size-space-4);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-space-4);
      margin-bottom: var(--uui-size-space-4);
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field label {
      font-weight: 600;
      font-size: var(--uui-size-font-small);
      color: var(--uui-color-text);
    }

    .form-field small {
      color: var(--uui-color-text-alt);
      font-size: var(--uui-size-font-tiny);
    }

    .form-actions {
      display: flex;
      gap: var(--uui-size-space-3);
      margin-top: var(--uui-size-space-2);
    }

    .color-swatch {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: var(--uui-border-radius);
      border: 1px solid var(--uui-color-border);
      margin-top: var(--uui-size-space-1);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: var(--uui-color-surface);
      border-radius: var(--uui-border-radius);
      box-shadow: var(--uui-shadow-depth-3);
      width: 90vw;
      max-width: 960px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal.modal-sm {
      max-width: 480px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--uui-size-space-4) var(--uui-size-space-5);
      border-bottom: 1px solid var(--uui-color-border);
    }

    .modal-header h2 {
      margin: 0;
      font-size: var(--uui-size-font-large);
    }

    .modal-body {
      padding: var(--uui-size-space-5);
      overflow-y: auto;
      flex: 1;
    }

    .preview-frame {
      width: 100%;
      height: 500px;
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      margin-top: var(--uui-size-space-4);
      background: #fff;
    }

    .variable-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--uui-size-space-2);
      padding: var(--uui-size-space-4) 0;
    }
  `;
i([
  s()
], t.prototype, "_templates", 2);
i([
  s()
], t.prototype, "_style", 2);
i([
  s()
], t.prototype, "_loading", 2);
i([
  s()
], t.prototype, "_message", 2);
i([
  s()
], t.prototype, "_messageType", 2);
i([
  s()
], t.prototype, "_activeTab", 2);
i([
  s()
], t.prototype, "_showForm", 2);
i([
  s()
], t.prototype, "_editingTemplate", 2);
i([
  s()
], t.prototype, "_form", 2);
i([
  s()
], t.prototype, "_showPreview", 2);
i([
  s()
], t.prototype, "_previewHtml", 2);
i([
  s()
], t.prototype, "_previewVariables", 2);
i([
  s()
], t.prototype, "_showVariables", 2);
i([
  s()
], t.prototype, "_variableList", 2);
i([
  s()
], t.prototype, "_styleForm", 2);
t = i([
  v("email-templates-dashboard")
], t);
export {
  t as EmailTemplatesDashboardElement
};
//# sourceMappingURL=email-templates-dashboard.js.map

import {
  LitElement,
  css,
  html,
  customElement,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string | null;
  variables: string | null;
  category: string;
  createdAt: string;
  updatedAt: string | null;
}

interface EmailStyle {
  id: number;
  headerHtml: string | null;
  footerHtml: string | null;
  globalCss: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  companyName: string | null;
  updatedAt: string | null;
}

const API_TEMPLATES = "/umbraco/management/api/v1/email-templates";
const API_STYLE = "/umbraco/management/api/v1/email-style";

@customElement("email-templates-dashboard")
export class EmailTemplatesDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  @state() private _templates: EmailTemplate[] = [];
  @state() private _style: EmailStyle | null = null;
  @state() private _loading = false;
  @state() private _message = "";
  @state() private _messageType: "success" | "error" | "" = "";
  @state() private _activeTab: "templates" | "style" = "templates";

  @state() private _showForm = false;
  @state() private _editingTemplate: EmailTemplate | null = null;
  @state() private _form = {
    name: "",
    subject: "",
    htmlBody: "",
    textBody: "",
    variables: "",
    category: "transactional",
  };

  @state() private _showPreview = false;
  @state() private _previewHtml = "";
  @state() private _previewVariables = "";

  @state() private _showVariables = false;
  @state() private _variableList: string[] = [];

  @state() private _styleForm = {
    logoUrl: "",
    primaryColor: "",
    companyName: "",
    headerHtml: "",
    footerHtml: "",
    globalCss: "",
  };

  @state() private _loadError: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._loadTemplates();
    this._loadStyle();
  }

  private _showMessage(text: string, type: "success" | "error" = "success") {
    this._message = text;
    this._messageType = type;
    setTimeout(() => {
      this._message = "";
      this._messageType = "";
    }, 4000);
  }

  private async _api<T>(
    baseUrl: string,
    path: string,
    init?: RequestInit
  ): Promise<T | null> {
    try {
      const r = await this.#fetch(`${baseUrl}${path}`, {
        headers: { "Content-Type": "application/json", ...init?.headers },
        ...init,
      });
      if (r.status === 204) return null;
      const contentType = r.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        return (await r.text()) as unknown as T;
      }
      if (this.#responseOk(r)) return r.json();
      const err = await r.text();
      this._showMessage(err || `Request failed (${r.status})`, "error");
      return null;
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
      this._showMessage("Network error", "error");
      return null;
    }
  }

  private async _loadTemplates() {
    this._loading = true;
    const templates = await this._api<EmailTemplate[]>(API_TEMPLATES, "");
    if (templates) this._templates = templates;
    this._loading = false;
  }

  private async _loadStyle() {
    const style = await this._api<EmailStyle>(API_STYLE, "");
    if (style) {
      this._style = style;
      this._styleForm = {
        logoUrl: style.logoUrl ?? "",
        primaryColor: style.primaryColor ?? "",
        companyName: style.companyName ?? "",
        headerHtml: style.headerHtml ?? "",
        footerHtml: style.footerHtml ?? "",
        globalCss: style.globalCss ?? "",
      };
    }
  }

  private _openCreateForm() {
    this._editingTemplate = null;
    this._form = {
      name: "",
      subject: "",
      htmlBody: "",
      textBody: "",
      variables: "",
      category: "transactional",
    };
    this._showForm = true;
  }

  private _openEditForm(t: EmailTemplate) {
    this._editingTemplate = t;
    this._form = {
      name: t.name,
      subject: t.subject,
      htmlBody: t.htmlBody,
      textBody: t.textBody ?? "",
      variables: t.variables ?? "",
      category: t.category,
    };
    this._showForm = true;
  }

  private _closeForm() {
    this._showForm = false;
    this._editingTemplate = null;
  }

  private async _saveTemplate() {
    const payload = {
      name: this._form.name.trim(),
      subject: this._form.subject.trim(),
      htmlBody: this._form.htmlBody.trim(),
      textBody: this._form.textBody.trim() || null,
      variables: this._form.variables.trim() || null,
      category: this._form.category.trim() || "transactional",
    };

    if (!payload.name || !payload.htmlBody) {
      this._showMessage("Name and HTML Body are required.", "error");
      return;
    }

    if (this._editingTemplate) {
      const updated = await this._api<EmailTemplate>(
        API_TEMPLATES,
        `/${this._editingTemplate.id}`,
        { method: "PUT", body: JSON.stringify(payload) }
      );
      if (updated) {
        this._closeForm();
        await this._loadTemplates();
        this._showMessage(`Template "${payload.name}" updated.`);
      }
    } else {
      const created = await this._api<EmailTemplate>(
        API_TEMPLATES,
        "/create",
        { method: "POST", body: JSON.stringify(payload) }
      );
      if (created) {
        this._closeForm();
        await this._loadTemplates();
        this._showMessage(`Template "${payload.name}" created.`);
      }
    }
  }

  private async _deleteTemplate(id: number) {
    this._loading = true;
    await this._api<void>(API_TEMPLATES, `/${id}`, { method: "DELETE" });
    await this._loadTemplates();
    this._loading = false;
    this._showMessage("Template deleted.");
  }

  private async _previewTemplate(t: EmailTemplate) {
    this._showPreview = true;
    this._previewHtml = "";
    const query = this._previewVariables.trim()
      ? `?variables=${encodeURIComponent(this._previewVariables.trim())}`
      : "";
    const html = await this._api<string>(
      API_TEMPLATES,
      `/${t.id}/preview${query}`
    );
    this._previewHtml = html ?? "";
  }

  private async _showTemplateVariables(t: EmailTemplate) {
    this._showVariables = true;
    this._variableList = [];
    const vars = await this._api<string[]>(
      API_TEMPLATES,
      `/${t.id}/variables`
    );
    this._variableList = vars ?? [];
  }

  private async _saveStyle() {
    const payload = {
      id: 1,
      logoUrl: this._styleForm.logoUrl.trim() || null,
      primaryColor: this._styleForm.primaryColor.trim() || null,
      companyName: this._styleForm.companyName.trim() || null,
      headerHtml: this._styleForm.headerHtml.trim() || null,
      footerHtml: this._styleForm.footerHtml.trim() || null,
      globalCss: this._styleForm.globalCss.trim() || null,
      updatedAt: null,
    };

    const saved = await this._api<EmailStyle>(API_STYLE, "", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (saved) {
      this._style = saved;
      this._showMessage("Style settings saved.");
    }
  }

  private _formatDate(dateStr: string | null): string {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  private _renderMessage() {
    if (!this._message) return "";
    return html`
      <div class="message ${this._messageType}">${this._message}</div>
    `;
  }

  // ── Templates tab ───────────────────────────────────────────────────────

  private _renderTemplatesTable() {
    if (this._loading) {
      return html`<div class="loading">Loading...</div>`;
    }

    if (this._templates.length === 0) {
      return html`
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
      `;
    }

    return html`
      <uui-table>
        <uui-table-head>
          <uui-table-head-cell>Name</uui-table-head-cell>
          <uui-table-head-cell>Subject</uui-table-head-cell>
          <uui-table-head-cell>Category</uui-table-head-cell>
          <uui-table-head-cell>Updated</uui-table-head-cell>
          <uui-table-head-cell></uui-table-head-cell>
        </uui-table-head>
        ${this._templates.map(
          (t) => html`
            <uui-table-row>
              <uui-table-cell>${t.name}</uui-table-cell>
              <uui-table-cell>${t.subject}</uui-table-cell>
              <uui-table-cell>
                <uui-tag look="default">${t.category}</uui-tag>
              </uui-table-cell>
              <uui-table-cell>${this._formatDate(t.updatedAt)}</uui-table-cell>
              <uui-table-cell>
                <div class="row-actions">
                  <uui-button
                    look="primary"
                    label="Edit"
                    compact
                    @click=${() => this._openEditForm(t)}
                  >
                    Edit
                  </uui-button>
                  <uui-button
                    look="secondary"
                    label="Preview"
                    compact
                    @click=${() => this._previewTemplate(t)}
                  >
                    Preview
                  </uui-button>
                  <uui-button
                    look="secondary"
                    label="Variables"
                    compact
                    @click=${() => this._showTemplateVariables(t)}
                  >
                    Variables
                  </uui-button>
                  <uui-button
                    look="danger"
                    label="Delete"
                    compact
                    @click=${() => this._deleteTemplate(t.id)}
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

  private _renderTemplateForm() {
    return html`
      <uui-box
        headline=${this._editingTemplate
          ? "Edit Template"
          : "New Template"}
      >
        <div class="form-grid">
          <div class="form-field">
            <label for="tmpl-name">Name *</label>
            <uui-input
              id="tmpl-name"
              .value=${this._form.name}
              @input=${(e: InputEvent) =>
                (this._form.name = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>

          <div class="form-field">
            <label for="tmpl-subject">Subject</label>
            <uui-input
              id="tmpl-subject"
              .value=${this._form.subject}
              @input=${(e: InputEvent) =>
                (this._form.subject = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>

          <div class="form-field">
            <label for="tmpl-category">Category</label>
            <uui-select
              id="tmpl-category"
              .value=${this._form.category}
              @change=${(e: Event) =>
                (this._form.category = (e.target as HTMLSelectElement).value)}
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
              @input=${(e: InputEvent) =>
                (this._form.variables = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>

          <div class="form-field full-width">
            <label for="tmpl-html">HTML Body *</label>
            <uui-textarea
              id="tmpl-html"
              rows="16"
              .value=${this._form.htmlBody}
              @input=${(e: InputEvent) =>
                (this._form.htmlBody = (e.target as HTMLTextAreaElement).value)}
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
              @input=${(e: InputEvent) =>
                (this._form.textBody = (
                  e.target as HTMLTextAreaElement
                ).value)}
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

  private _renderPreviewModal() {
    if (!this._showPreview) return "";
    return html`
      <div class="modal-overlay" @click=${() => (this._showPreview = false)}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h2>Preview</h2>
            <uui-button
              look="secondary"
              label="Close"
              @click=${() => (this._showPreview = false)}
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
                @input=${(e: InputEvent) =>
                  (this._previewVariables = (
                    e.target as HTMLInputElement
                  ).value)}
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
    `;
  }

  private _renderVariablesModal() {
    if (!this._showVariables) return "";
    return html`
      <div class="modal-overlay" @click=${() => (this._showVariables = false)}>
        <div class="modal modal-sm" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h2>Template Variables</h2>
            <uui-button
              look="secondary"
              label="Close"
              @click=${() => (this._showVariables = false)}
            >
              Close
            </uui-button>
          </div>
          <div class="modal-body">
            ${this._variableList.length === 0
              ? html`<p>No variables found in this template.</p>`
              : html`
                  <div class="variable-list">
                    ${this._variableList.map(
                      (v) => html`<uui-tag look="primary">{{${v}}}</uui-tag>`
                    )}
                  </div>
                `}
          </div>
        </div>
      </div>
    `;
  }

  private _renderTemplatesTab() {
    return html`
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

  private _renderStyleTab() {
    return html`
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
              @input=${(e: InputEvent) =>
                (this._styleForm.companyName = (
                  e.target as HTMLInputElement
                ).value)}
            ></uui-input>
          </div>

          <div class="form-field">
            <label for="style-logo">Logo URL</label>
            <uui-input
              id="style-logo"
              .value=${this._styleForm.logoUrl}
              placeholder="https://example.com/logo.png"
              @input=${(e: InputEvent) =>
                (this._styleForm.logoUrl = (
                  e.target as HTMLInputElement
                ).value)}
            ></uui-input>
          </div>

          <div class="form-field">
            <label for="style-color">Primary Color</label>
            <uui-input
              id="style-color"
              .value=${this._styleForm.primaryColor}
              placeholder="#333333"
              @input=${(e: InputEvent) =>
                (this._styleForm.primaryColor = (
                  e.target as HTMLInputElement
                ).value)}
            ></uui-input>
            ${this._styleForm.primaryColor
              ? html`
                  <span
                    class="color-swatch"
                    style="background:${this._styleForm.primaryColor}"
                  ></span>
                `
              : ""}
          </div>

          <div class="form-field full-width">
            <label for="style-header">Header HTML</label>
            <uui-textarea
              id="style-header"
              rows="6"
              .value=${this._styleForm.headerHtml}
              @input=${(e: InputEvent) =>
                (this._styleForm.headerHtml = (
                  e.target as HTMLTextAreaElement
                ).value)}
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
              @input=${(e: InputEvent) =>
                (this._styleForm.footerHtml = (
                  e.target as HTMLTextAreaElement
                ).value)}
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
              @input=${(e: InputEvent) =>
                (this._styleForm.globalCss = (
                  e.target as HTMLTextAreaElement
                ).value)}
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

  /**
   * Guards a response and records why it failed.
   *
   * This used to be a bare `response.ok` check with no else branch, so a failed request
   * left the previous (usually empty) state on screen and read as "there is no data"
   * rather than "the request did not succeed".
   */
  #responseOk(response: Response): boolean {
    if (response.ok) {
      this._loadError = null;
      return true;
    }

    this._loadError =
      response.status === 401 || response.status === 403
        ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }


  override render() {
    return html`
      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : ""}
      <div class="dashboard">
        ${this._renderMessage()}

        <uui-tab-group>
          <uui-tab
            ?active=${this._activeTab === "templates"}
            label="Templates"
            @click=${() => (this._activeTab = "templates")}
          >
            Templates
          </uui-tab>
          <uui-tab
            ?active=${this._activeTab === "style"}
            label="Style Settings"
            @click=${() => (this._activeTab = "style")}
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

  static override styles = css`
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
  
    .splatdev-load-error {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0 0 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem;
      border-radius: 3px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "email-templates-dashboard": EmailTemplatesDashboardElement;
  }
}

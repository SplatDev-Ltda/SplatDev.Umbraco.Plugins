import { LitElement as x, html as s, css as k, state as r, customElement as C } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as F } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as z } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as E } from "@umbraco-cms/backoffice/notification";
function S(e) {
  let t = null, a = null;
  const o = e.consumeContext.bind(e), n = new Promise((u) => {
    o(z, async (d) => {
      var c;
      try {
        t = await ((c = d == null ? void 0 : d.getLatestToken) == null ? void 0 : c.call(d)) ?? null;
      } catch {
        t = null;
      }
      u();
    }), setTimeout(u, 3e3);
  });
  return o(E, (u) => {
    a = u;
  }), async (u, d = {}) => {
    await n;
    const c = new Headers(d.headers);
    t && !c.has("Authorization") && c.set("Authorization", `Bearer ${t}`);
    const m = await fetch(u, { ...d, credentials: "same-origin", headers: c });
    if (!m.ok) {
      const b = m.status === 401 || m.status === 403, $ = b ? "Not authorised" : "Could not load data", f = b ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${m.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${m.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${m.status} from ${String(u)} — ${f}`), a == null || a.peek("danger", { data: { headline: $, message: f } });
    }
    return m;
  };
}
var M = Object.defineProperty, N = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, l = (e, t, a, o) => {
  for (var n = o > 1 ? void 0 : o ? N(t, a) : t, u = e.length - 1, d; u >= 0; u--)
    (d = e[u]) && (n = (o ? d(t, a, n) : d(n)) || n);
  return o && n && M(t, a, n), n;
}, w = (e, t, a) => t.has(e) || g("Cannot " + a), H = (e, t, a) => (w(e, t, "read from private field"), a ? a.call(e) : t.get(e)), y = (e, t, a) => t.has(e) ? g("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), P = (e, t, a) => (w(e, t, "access private method"), a), h, v, T;
const p = "/umbraco/management/api/v1/email-templates", _ = "/umbraco/management/api/v1/email-style";
let i = class extends F(x) {
  constructor() {
    super(...arguments), y(this, v), y(this, h, S(this)), this._templates = [], this._style = null, this._loading = !1, this._message = "", this._messageType = "", this._activeTab = "templates", this._showForm = !1, this._editingTemplate = null, this._form = {
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
    }, this._loadError = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadTemplates(), this._loadStyle();
  }
  _showMessage(e, t = "success") {
    this._message = e, this._messageType = t, setTimeout(() => {
      this._message = "", this._messageType = "";
    }, 4e3);
  }
  async _api(e, t, a) {
    try {
      const o = await H(this, h).call(this, `${e}${t}`, {
        headers: { "Content-Type": "application/json", ...a == null ? void 0 : a.headers },
        ...a
      });
      if (o.status === 204) return null;
      if ((o.headers.get("content-type") || "").includes("text/html"))
        return await o.text();
      if (P(this, v, T).call(this, o)) return o.json();
      const u = await o.text();
      return this._showMessage(u || `Request failed (${o.status})`, "error"), null;
    } catch {
      return this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._showMessage("Network error", "error"), null;
    }
  }
  async _loadTemplates() {
    this._loading = !0;
    const e = await this._api(p, "");
    e && (this._templates = e), this._loading = !1;
  }
  async _loadStyle() {
    const e = await this._api(_, "");
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
      p,
      `/${this._editingTemplate.id}`,
      { method: "PUT", body: JSON.stringify(e) }
    ) && (this._closeForm(), await this._loadTemplates(), this._showMessage(`Template "${e.name}" updated.`)) : await this._api(
      p,
      "/create",
      { method: "POST", body: JSON.stringify(e) }
    ) && (this._closeForm(), await this._loadTemplates(), this._showMessage(`Template "${e.name}" created.`));
  }
  async _deleteTemplate(e) {
    this._loading = !0, await this._api(p, `/${e}`, { method: "DELETE" }), await this._loadTemplates(), this._loading = !1, this._showMessage("Template deleted.");
  }
  async _previewTemplate(e) {
    this._showPreview = !0, this._previewHtml = "";
    const t = this._previewVariables.trim() ? `?variables=${encodeURIComponent(this._previewVariables.trim())}` : "", a = await this._api(
      p,
      `/${e.id}/preview${t}`
    );
    this._previewHtml = a ?? "";
  }
  async _showTemplateVariables(e) {
    this._showVariables = !0, this._variableList = [];
    const t = await this._api(
      p,
      `/${e.id}/variables`
    );
    this._variableList = t ?? [];
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
    }, t = await this._api(_, "", {
      method: "PUT",
      body: JSON.stringify(e)
    });
    t && (this._style = t, this._showMessage("Style settings saved."));
  }
  _formatDate(e) {
    return e ? new Date(e).toLocaleDateString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric"
    }) : "-";
  }
  _renderMessage() {
    return this._message ? s`
      <div class="message ${this._messageType}">${this._message}</div>
    ` : "";
  }
  // ── Templates tab ───────────────────────────────────────────────────────
  _renderTemplatesTable() {
    return this._loading ? s`<div class="loading">Loading...</div>` : this._templates.length === 0 ? s`
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
      ` : s`
      <uui-table>
        <uui-table-head>
          <uui-table-head-cell>Name</uui-table-head-cell>
          <uui-table-head-cell>Subject</uui-table-head-cell>
          <uui-table-head-cell>Category</uui-table-head-cell>
          <uui-table-head-cell>Updated</uui-table-head-cell>
          <uui-table-head-cell></uui-table-head-cell>
        </uui-table-head>
        ${this._templates.map(
      (e) => s`
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
    return s`
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
    return this._showPreview ? s`
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
    return this._showVariables ? s`
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
            ${this._variableList.length === 0 ? s`<p>No variables found in this template.</p>` : s`
                  <div class="variable-list">
                    ${this._variableList.map(
      (e) => s`<uui-tag look="primary">{{${e}}}</uui-tag>`
    )}
                  </div>
                `}
          </div>
        </div>
      </div>
    ` : "";
  }
  _renderTemplatesTab() {
    return s`
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
    return s`
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
            ${this._styleForm.primaryColor ? s`
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
  render() {
    return s`
      ${this._loadError ? s`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
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
h = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakSet();
T = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
i.styles = k`
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
l([
  r()
], i.prototype, "_templates", 2);
l([
  r()
], i.prototype, "_style", 2);
l([
  r()
], i.prototype, "_loading", 2);
l([
  r()
], i.prototype, "_message", 2);
l([
  r()
], i.prototype, "_messageType", 2);
l([
  r()
], i.prototype, "_activeTab", 2);
l([
  r()
], i.prototype, "_showForm", 2);
l([
  r()
], i.prototype, "_editingTemplate", 2);
l([
  r()
], i.prototype, "_form", 2);
l([
  r()
], i.prototype, "_showPreview", 2);
l([
  r()
], i.prototype, "_previewHtml", 2);
l([
  r()
], i.prototype, "_previewVariables", 2);
l([
  r()
], i.prototype, "_showVariables", 2);
l([
  r()
], i.prototype, "_variableList", 2);
l([
  r()
], i.prototype, "_styleForm", 2);
l([
  r()
], i.prototype, "_loadError", 2);
i = l([
  C("email-templates-dashboard")
], i);
export {
  i as EmailTemplatesDashboardElement
};
//# sourceMappingURL=email-templates-dashboard.js.map

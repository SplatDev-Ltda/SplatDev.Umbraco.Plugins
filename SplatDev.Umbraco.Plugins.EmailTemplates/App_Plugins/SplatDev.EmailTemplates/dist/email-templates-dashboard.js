import { LitElement as C, html as c, css as k, state as n, customElement as F } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as z } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as S } from "@umbraco-cms/backoffice/notification";
function M(e) {
  let t = null, a = null;
  const i = e.consumeContext.bind(e), d = new Promise((s) => {
    i(z, async (o) => {
      var m;
      try {
        t = await ((m = o == null ? void 0 : o.getLatestToken) == null ? void 0 : m.call(o)) ?? null;
      } catch {
        t = null;
      }
      s();
    }), setTimeout(s, 3e3);
  });
  return i(S, (s) => {
    a = s;
  }), async (s, o = {}) => {
    await d;
    const m = new Headers(o.headers);
    t && !m.has("Authorization") && m.set("Authorization", `Bearer ${t}`);
    const r = await fetch(s, { ...o, credentials: "same-origin", headers: m });
    if (!r.ok) {
      const p = r.status === 401 || r.status === 403, v = p ? "Not authorised" : "Could not load data", b = p ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${r.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${r.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${r.status} from ${String(s)} — ${b}`), a == null || a.peek("danger", { data: { headline: v, message: b } });
    }
    return r;
  };
}
async function P(e, t) {
  var a, i, d, s, o;
  try {
    const m = await e(`/umbraco/management/api/v1/media/${encodeURIComponent(t)}`);
    if (m.ok) {
      const p = (i = (a = (await m.json()).values) == null ? void 0 : a.find((b) => b.alias === "umbracoFile")) == null ? void 0 : i.value, v = typeof p == "string" ? p : p == null ? void 0 : p.src;
      if (v) return v;
    }
  } catch {
  }
  try {
    const m = await e(
      `/umbraco/management/api/v1/media/urls?id=${encodeURIComponent(t)}`
    );
    if (!m.ok) return null;
    const r = await m.json();
    return ((o = (s = (d = r == null ? void 0 : r[0]) == null ? void 0 : d.urlInfos) == null ? void 0 : s[0]) == null ? void 0 : o.url) ?? null;
  } catch {
    return null;
  }
}
async function H(e, t) {
  var i, d, s;
  try {
    const o = await e(
      `/umbraco/management/api/v1/media/urls?id=${encodeURIComponent(t)}`
    );
    if (o.ok) {
      const m = await o.json(), r = (s = (d = (i = m == null ? void 0 : m[0]) == null ? void 0 : i.urlInfos) == null ? void 0 : d[0]) == null ? void 0 : s.url;
      if (r && /^https?:\/\//i.test(r)) return r;
      if (r) return new URL(r, window.location.origin).toString();
    }
  } catch {
  }
  const a = await P(e, t);
  if (!a) return null;
  try {
    return new URL(a, window.location.origin).toString();
  } catch {
    return a;
  }
}
var N = Object.defineProperty, B = Object.getOwnPropertyDescriptor, T = (e) => {
  throw TypeError(e);
}, u = (e, t, a, i) => {
  for (var d = i > 1 ? void 0 : i ? B(t, a) : t, s = e.length - 1, o; s >= 0; s--)
    (o = e[s]) && (d = (i ? o(t, a, d) : o(d)) || d);
  return i && d && N(t, a, d), d;
}, $ = (e, t, a) => t.has(e) || T("Cannot " + a), f = (e, t, a) => ($(e, t, "read from private field"), a ? a.call(e) : t.get(e)), g = (e, t, a) => t.has(e) ? T("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), U = (e, t, a) => ($(e, t, "access private method"), a), y, _, x;
const h = "/umbraco/management/api/v1/email-templates", w = "/umbraco/management/api/v1/email-style", L = "CC07B313-0843-4AA8-BBDA-871C8DA728C8", A = "C4B1EFCF-A9D5-41C4-9621-E9D273B52A9C";
let l = class extends E(C) {
  constructor() {
    super(...arguments), g(this, _), g(this, y, M(this)), this._templates = [], this._style = null, this._loading = !1, this._message = "", this._messageType = "", this._activeTab = "templates", this._showForm = !1, this._editingTemplate = null, this._form = {
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
    }, this._loadError = null, this._logoKeys = [], this._pickLogo = async (e) => {
      const t = e.target;
      this._logoKeys = t.selection ?? [];
      const a = this._logoKeys[0];
      if (!a) {
        this._styleForm = { ...this._styleForm, logoUrl: "" };
        return;
      }
      const i = await H(f(this, y), a);
      i && (this._styleForm = { ...this._styleForm, logoUrl: i });
    };
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
      const i = await f(this, y).call(this, `${e}${t}`, {
        headers: { "Content-Type": "application/json", ...a == null ? void 0 : a.headers },
        ...a
      });
      if (i.status === 204) return null;
      if ((i.headers.get("content-type") || "").includes("text/html"))
        return await i.text();
      if (U(this, _, x).call(this, i)) return i.json();
      const s = await i.text();
      return this._showMessage(s || `Request failed (${i.status})`, "error"), null;
    } catch {
      return this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._showMessage("Network error", "error"), null;
    }
  }
  async _loadTemplates() {
    this._loading = !0;
    const e = await this._api(h, "");
    e && (this._templates = e), this._loading = !1;
  }
  async _loadStyle() {
    const e = await this._api(w, "");
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
      h,
      `/${this._editingTemplate.id}`,
      { method: "PUT", body: JSON.stringify(e) }
    ) && (this._closeForm(), await this._loadTemplates(), this._showMessage(`Template "${e.name}" updated.`)) : await this._api(
      h,
      "/create",
      { method: "POST", body: JSON.stringify(e) }
    ) && (this._closeForm(), await this._loadTemplates(), this._showMessage(`Template "${e.name}" created.`));
  }
  async _deleteTemplate(e) {
    this._loading = !0, await this._api(h, `/${e}`, { method: "DELETE" }), await this._loadTemplates(), this._loading = !1, this._showMessage("Template deleted.");
  }
  async _previewTemplate(e) {
    this._showPreview = !0, this._previewHtml = "";
    const t = this._previewVariables.trim() ? `?variables=${encodeURIComponent(this._previewVariables.trim())}` : "", a = await this._api(
      h,
      `/${e.id}/preview${t}`
    );
    this._previewHtml = a ?? "";
  }
  async _showTemplateVariables(e) {
    this._showVariables = !0, this._variableList = [];
    const t = await this._api(
      h,
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
    }, t = await this._api(w, "", {
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
    return this._message ? c`
      <div class="message ${this._messageType}">${this._message}</div>
    ` : "";
  }
  // ── Templates tab ───────────────────────────────────────────────────────
  _renderTemplatesTable() {
    return this._loading ? c`<div class="loading">Loading...</div>` : this._templates.length === 0 ? c`
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
      ` : c`
      <uui-table>
        <uui-table-head>
          <uui-table-head-cell>Name</uui-table-head-cell>
          <uui-table-head-cell>Subject</uui-table-head-cell>
          <uui-table-head-cell>Category</uui-table-head-cell>
          <uui-table-head-cell>Updated</uui-table-head-cell>
          <uui-table-head-cell></uui-table-head-cell>
        </uui-table-head>
        ${this._templates.map(
      (e) => c`
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
    return c`
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
    return this._showPreview ? c`
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
    return this._showVariables ? c`
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
            ${this._variableList.length === 0 ? c`<p>No variables found in this template.</p>` : c`
                  <div class="variable-list">
                    ${this._variableList.map(
      (e) => c`<uui-tag look="primary">{{${e}}}</uui-tag>`
    )}
                  </div>
                `}
          </div>
        </div>
      </div>
    ` : "";
  }
  _renderTemplatesTab() {
    return c`
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
    return c`
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
            <label for="style-logo">Logo</label>
            <umb-input-media
              .selection=${this._logoKeys}
              .allowedContentTypeIds=${[L, A]}
              max="1"
              @change=${this._pickLogo}
            ></umb-input-media>
            <uui-input
              id="style-logo"
              .value=${this._styleForm.logoUrl}
              placeholder="https://example.com/logo.png"
              @input=${(e) => {
      this._logoKeys = [], this._styleForm.logoUrl = e.target.value;
    }}
            ></uui-input>
            <small>
              Pick from the media library, or paste a URL if the image is hosted
              elsewhere. It must be absolute — a mail client renders this on someone
              else's machine and has no site to resolve a relative path against.
            </small>
          </div>

          <div class="form-field">
            <label for="style-color">Primary Color</label>
            <uui-input
              id="style-color"
              .value=${this._styleForm.primaryColor}
              placeholder="#333333"
              @input=${(e) => this._styleForm.primaryColor = e.target.value}
            ></uui-input>
            ${this._styleForm.primaryColor ? c`
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
    return c`
      ${this._loadError ? c`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
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
y = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakSet();
x = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
l.styles = k`
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
u([
  n()
], l.prototype, "_templates", 2);
u([
  n()
], l.prototype, "_style", 2);
u([
  n()
], l.prototype, "_loading", 2);
u([
  n()
], l.prototype, "_message", 2);
u([
  n()
], l.prototype, "_messageType", 2);
u([
  n()
], l.prototype, "_activeTab", 2);
u([
  n()
], l.prototype, "_showForm", 2);
u([
  n()
], l.prototype, "_editingTemplate", 2);
u([
  n()
], l.prototype, "_form", 2);
u([
  n()
], l.prototype, "_showPreview", 2);
u([
  n()
], l.prototype, "_previewHtml", 2);
u([
  n()
], l.prototype, "_previewVariables", 2);
u([
  n()
], l.prototype, "_showVariables", 2);
u([
  n()
], l.prototype, "_variableList", 2);
u([
  n()
], l.prototype, "_styleForm", 2);
u([
  n()
], l.prototype, "_loadError", 2);
u([
  n()
], l.prototype, "_logoKeys", 2);
l = u([
  F("email-templates-dashboard")
], l);
export {
  l as EmailTemplatesDashboardElement
};
//# sourceMappingURL=email-templates-dashboard.js.map

import { LitElement as f, html as r, nothing as d, repeat as h, css as g, state as u, customElement as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT as _ } from "@umbraco-cms/backoffice/notification";
const y = [
  { value: "TextBox", label: "Text" },
  { value: "Textarea", label: "Text Area" },
  { value: "Number", label: "Number" },
  { value: "Email", label: "Email" },
  { value: "Password", label: "Password" },
  { value: "Date", label: "Date" },
  { value: "Checkbox", label: "Checkbox" },
  { value: "Dropdown", label: "Dropdown" },
  { value: "RadioButtonList", label: "Radio Button List" },
  { value: "FileUpload", label: "File Upload" },
  { value: "Hidden", label: "Hidden" }
], x = "/umbraco/backoffice/formbuilderextension/api/v1";
async function n(e, t) {
  const i = await fetch(`${x}${e}`, {
    headers: { "Content-Type": "application/json" },
    ...t
  });
  if (!i.ok) {
    const a = await i.json().catch(() => ({ message: i.statusText }));
    throw new Error(a.message || `Request failed: ${i.status}`);
  }
  if (i.status !== 204)
    return i.json();
}
const c = {
  getForms() {
    return n("/forms");
  },
  getForm(e) {
    return n(`/forms/${e}`);
  },
  createForm(e) {
    return n("/forms", {
      method: "POST",
      body: JSON.stringify(e)
    });
  },
  updateForm(e, t) {
    return n(`/forms/${e}`, {
      method: "PUT",
      body: JSON.stringify(t)
    });
  },
  deleteForm(e) {
    return n(`/forms/${e}`, { method: "DELETE" });
  },
  reorderFields(e, t) {
    return n(`/forms/${e}/fields/order`, {
      method: "PUT",
      body: JSON.stringify(t)
    });
  }
};
var w = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, s = (e, t, i, a) => {
  for (var l = a > 1 ? void 0 : a ? $(t, i) : t, p = e.length - 1, m; p >= 0; p--)
    (m = e[p]) && (l = (a ? m(t, i, l) : m(l)) || l);
  return a && l && w(t, i, l), l;
};
let o = class extends b(f) {
  constructor() {
    super(), this._view = "list", this._forms = [], this._loadState = "idle", this._error = "", this._editingForm = null, this._formName = "", this._formCategory = "", this._fields = [], this._selectedFormId = null, this.consumeContext(_, (e) => {
      this._notificationCtx = e;
    });
  }
  connectedCallback() {
    super.connectedCallback(), this._loadForms();
  }
  render() {
    switch (this._view) {
      case "editor":
        return this._renderEditor();
      case "submissions":
        return this._renderSubmissions();
      default:
        return this._renderList();
    }
  }
  _renderList() {
    return this._loadState === "loading" ? r`<uui-loader-bar></uui-loader-bar>` : r`
      <div class="header">
        <div>
          <h1>Form Builder</h1>
          <p class="description">Create and manage custom forms for your website</p>
        </div>
        <uui-button
          look="primary"
          color="positive"
          label="Create new form"
          @click=${this._startCreate}
        >
          <uui-icon name="icon-add"></uui-icon>
          New Form
        </uui-button>
      </div>

      ${this._error && this._view === "list" ? r`<uui-ref-node
              name="Error loading forms"
              detail=${this._error}
              style="margin-bottom: var(--uui-size-space-4, 12px);"
            >
              <uui-icon slot="icon" name="icon-alert"></uui-icon>
              <uui-button
                slot="actions"
                look="primary"
                label="Retry"
                @click=${this._loadForms}
              >Retry</uui-button>
            </uui-ref-node>` : d}

      ${this._forms.length === 0 ? this._renderEmpty() : r`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Name</uui-table-head-cell>
                <uui-table-head-cell>Category</uui-table-head-cell>
                <uui-table-head-cell>Fields</uui-table-head-cell>
                <uui-table-head-cell>Created</uui-table-head-cell>
                <uui-table-head-cell>Actions</uui-table-head-cell>
              </uui-table-head>
              ${h(
      this._forms,
      (e) => e.id,
      (e) => r`
                  <uui-table-row>
                    <uui-table-cell>
                      <strong>${e.name}</strong>
                    </uui-table-cell>
                    <uui-table-cell>${e.category || "—"}</uui-table-cell>
                    <uui-table-cell>${e.fieldCount}</uui-table-cell>
                    <uui-table-cell>
                      ${new Date(e.createdDate).toLocaleDateString()}
                    </uui-table-cell>
                    <uui-table-cell>
                      <div class="actions">
                        <uui-button
                          look="secondary"
                          label="Edit"
                          @click=${() => this._startEdit(e.id)}
                        >
                          <uui-icon name="icon-edit"></uui-icon>
                        </uui-button>
                        <uui-button
                          look="secondary"
                          label="Submissions"
                          @click=${() => this._openSubmissions(e.id)}
                        >
                          <uui-icon name="icon-document"></uui-icon>
                        </uui-button>
                        <uui-button
                          look="secondary"
                          color="danger"
                          label="Delete"
                          @click=${() => this._confirmDelete(e)}
                        >
                          <uui-icon name="icon-delete"></uui-icon>
                        </uui-button>
                      </div>
                    </uui-table-cell>
                  </uui-table-row>
                `
    )}
            </uui-table>
          `}
    `;
  }
  _renderEmpty() {
    return r`
      <div class="empty-state">
        <uui-icon
          name="icon-document"
          style="font-size: 3rem; color: var(--uui-color-border-emphasis); margin-bottom: var(--uui-size-space-4, 12px);"
        ></uui-icon>
        <h2>No forms yet</h2>
        <p>Create your first form to start collecting data from your visitors.</p>
        <uui-button
          look="primary"
          color="positive"
          label="Create your first form"
          @click=${this._startCreate}
        >
          <uui-icon name="icon-add"></uui-icon>
          Create Form
        </uui-button>
      </div>
    `;
  }
  _renderEditor() {
    const e = !this._editingForm, t = this._loadState === "saving";
    return r`
      <div class="breadcrumb">
        <uui-button
          look="secondary"
          label="Back to forms list"
          @click=${this._goToList}
          style="font-size: 0.8125rem;"
        >
          <uui-icon name="icon-arrow-left"></uui-icon>
        </uui-button>
        <span>/</span>
        <span>${e ? "New Form" : `Edit: ${this._formName}`}</span>
      </div>

      <div class="header">
        <h1>${e ? "Create Form" : "Edit Form"}</h1>
        <uui-button
          look="primary"
          color="positive"
          label="Save form"
          .disabled=${t || !this._formName.trim()}
          @click=${this._saveForm}
        >
          ${t ? r`<uui-loader-circle></uui-loader-circle>` : r`<uui-icon name="icon-check"></uui-icon>`}
          ${t ? "Saving..." : "Save Form"}
        </uui-button>
      </div>

      ${this._error ? r`<uui-ref-node
              name="Error"
              detail=${this._error}
              style="margin-bottom: var(--uui-size-space-4, 12px);"
            >
              <uui-icon slot="icon" name="icon-alert"></uui-icon>
            </uui-ref-node>` : d}

      <div class="editor-grid">
        <div class="form-group">
          <label for="form-name">Form Name *</label>
          <uui-input
            id="form-name"
            .value=${this._formName}
            placeholder="e.g. Contact Form"
            @input=${(i) => this._formName = i.target.value}
          ></uui-input>
        </div>
        <div class="form-group">
          <label for="form-category">Category</label>
          <uui-input
            id="form-category"
            .value=${this._formCategory}
            placeholder="e.g. General, Sales"
            @input=${(i) => this._formCategory = i.target.value}
          ></uui-input>
        </div>
      </div>

      <div class="section">
        <div class="fields-header">
          <h3>Form Fields</h3>
          <uui-button
            look="secondary"
            label="Add field"
            @click=${this._addField}
          >
            <uui-icon name="icon-add"></uui-icon>
            Add Field
          </uui-button>
        </div>

        ${this._fields.length === 0 ? r`
              <div class="empty-state" style="padding: var(--uui-size-layout-2, 24px);">
                <p>No fields added yet. Click "Add Field" to start building your form.</p>
              </div>
            ` : h(
      this._fields,
      (i, a) => `${i.type || ""}-${a}`,
      (i, a) => this._renderFieldCard(i, a)
    )}
      </div>
    `;
  }
  _renderFieldCard(e, t) {
    const i = e.type === "Dropdown" || e.type === "RadioButtonList" || e.type === "Checkbox";
    return r`
      <div class="field-card">
        <div class="drag-handle" title="Drag to reorder">
          <uui-icon name="icon-navigation"></uui-icon>
        </div>
        <div class="field-content">
          <div class="wide" style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:600; color:var(--uui-color-text-alt);">
              #${t + 1}
            </span>
            <uui-input
              .value=${e.label || ""}
              placeholder="Field label *"
              @input=${(a) => this._fields[t] = {
      ...e,
      label: a.target.value
    }}
              style="flex:1;"
            ></uui-input>
            <uui-select
              .value=${e.type || "TextBox"}
              @change=${(a) => this._fields[t] = {
      ...e,
      type: a.target.value
    }}
              style="min-width:140px;"
            >
              ${y.map(
      (a) => r`<uui-select-option .value=${a.value}
                    >${a.label}</uui-select-option
                  >`
    )}
            </uui-select>
          </div>

          <div class="form-group">
            <label>Placeholder</label>
            <uui-input
              .value=${e.placeholder || ""}
              placeholder="Placeholder text"
              @input=${(a) => this._fields[t] = {
      ...e,
      placeholder: a.target.value
    }}
            ></uui-input>
          </div>

          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <uui-checkbox
              .checked=${e.isRequired || !1}
              label="Required"
              @change=${(a) => this._fields[t] = {
      ...e,
      isRequired: a.target.checked
    }}
            ></uui-checkbox>

            <div style="display:flex; gap:4px; align-items:center;">
              <label style="font-size:0.75rem;">Min length</label>
              <uui-input
                type="number"
                .value=${String(e.minLength || 0)}
                style="width:60px;"
                @input=${(a) => this._fields[t] = {
      ...e,
      minLength: parseInt(a.target.value) || 0
    }}
              ></uui-input>
            </div>
          </div>

          ${i ? r`
                <div class="wide form-group">
                  <label>Options (one per line)</label>
                  <uui-textarea
                    .value=${(e.dropdownValues || []).join(`
`)}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows="3"
                    @input=${(a) => this._fields[t] = {
      ...e,
      dropdownValues: a.target.value.split(`
`).filter((l) => l.trim())
    }}
                  ></uui-textarea>
                </div>
              ` : d}

          ${e.regex ? r`
                <div class="wide form-group">
                  <label>Validation Pattern</label>
                  <uui-input
                    .value=${e.regex}
                    placeholder="Regex pattern"
                    @input=${(a) => this._fields[t] = {
      ...e,
      regex: a.target.value
    }}
                  ></uui-input>
                </div>
              ` : d}

          <div
            class="wide"
            style="display:flex; justify-content:flex-end; gap:6px; margin-top:4px;"
          >
            ${e.regex ? d : r`<uui-button
                  look="secondary"
                  label="Add validation"
                  style="font-size:0.75rem;"
                  @click=${() => this._fields[t] = { ...e, regex: "" }}
                >
                  <uui-icon name="icon-filter"></uui-icon>
                  Validation
                </uui-button>`}
          </div>
        </div>
        <div class="field-actions">
          <uui-button
            look="secondary"
            color="danger"
            label="Remove field"
            @click=${() => this._removeField(t)}
          >
            <uui-icon name="icon-remove"></uui-icon>
          </uui-button>
        </div>
      </div>
    `;
  }
  _renderSubmissions() {
    return r`
      <div class="breadcrumb">
        <uui-button
          look="secondary"
          label="Back to forms list"
          @click=${this._goToList}
          style="font-size: 0.8125rem;"
        >
          <uui-icon name="icon-arrow-left"></uui-icon>
        </uui-button>
      </div>

      <div class="header">
        <h1>Form Submissions</h1>
      </div>

      <uui-ref-node name="Submissions tracking" detail="The submissions view will display form entry data once the submissions storage is fully implemented.">
        <uui-icon slot="icon" name="icon-document"></uui-icon>
      </uui-ref-node>
    `;
  }
  async _loadForms() {
    this._loadState = "loading", this._error = "";
    try {
      this._forms = await c.getForms(), this._loadState = "idle";
    } catch (e) {
      this._error = e.message || "Failed to load forms", this._loadState = "error";
    }
  }
  _startCreate() {
    this._editingForm = null, this._formName = "", this._formCategory = "", this._fields = [], this._error = "", this._view = "editor";
  }
  async _startEdit(e) {
    this._loadState = "loading", this._error = "";
    try {
      const t = await c.getForm(e);
      this._editingForm = t, this._formName = t.name, this._formCategory = t.category, this._fields = t.fields.map((i) => ({
        id: i.id,
        alias: i.alias,
        label: i.label,
        placeholder: i.placeholder,
        type: i.type,
        isRequired: i.isRequired,
        minLength: i.minLength,
        regex: i.regex,
        dropdownValues: (i.dropdownValues || []).map((a) => a.value)
      })), this._loadState = "idle", this._view = "editor";
    } catch (t) {
      this._error = t.message || "Failed to load form", this._loadState = "error", this._notify("Failed to load form", "danger");
    }
  }
  async _saveForm() {
    if (this._formName.trim()) {
      this._loadState = "saving", this._error = "";
      try {
        this._editingForm ? (await c.updateForm(this._editingForm.id, {
          name: this._formName,
          category: this._formCategory,
          fields: this._fields
        }), this._notify("Form updated successfully", "positive")) : (await c.createForm({
          name: this._formName,
          category: this._formCategory,
          fields: this._fields
        }), this._notify("Form created successfully", "positive")), this._loadState = "idle", this._goToList();
      } catch (e) {
        this._error = e.message || "Failed to save form", this._loadState = "error", this._notify("Failed to save form", "danger");
      }
    }
  }
  async _confirmDelete(e) {
    if (window.confirm(
      `Are you sure you want to delete "${e.name}"?`
    ))
      try {
        await c.deleteForm(e.id), this._forms = this._forms.filter((i) => i.id !== e.id), this._notify(`"${e.name}" deleted`, "positive"), this.requestUpdate();
      } catch (i) {
        this._notify(i.message || "Failed to delete form", "danger");
      }
  }
  _openSubmissions(e) {
    this._selectedFormId = e, this._view = "submissions";
  }
  _goToList() {
    this._view = "list", this._editingForm = null, this._error = "", this._loadForms();
  }
  _addField() {
    this._fields = [
      ...this._fields,
      {
        label: "",
        type: "TextBox",
        isRequired: !1,
        minLength: 0,
        placeholder: ""
      }
    ];
  }
  _removeField(e) {
    this._fields = this._fields.filter((t, i) => i !== e);
  }
  _notify(e, t = "positive") {
    var i;
    (i = this._notificationCtx) == null || i.peek(e, {
      color: t === "positive" ? "positive" : "danger"
    });
  }
};
o.styles = g`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
      max-width: 1200px;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--uui-size-layout-2, 24px);
      flex-wrap: wrap;
      gap: var(--uui-size-space-4, 12px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }

    .description {
      color: var(--uui-color-text-alt);
      margin: 0 0 var(--uui-size-space-5, 16px);
      font-size: 0.875rem;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3, 8px);
      margin-bottom: var(--uui-size-space-5, 16px);
      flex-wrap: wrap;
    }

    .search-box {
      min-width: 240px;
      flex: 1;
      max-width: 360px;
    }

    uui-table {
      width: 100%;
    }

    .actions {
      display: flex;
      gap: var(--uui-size-space-2, 6px);
    }

    .empty-state {
      text-align: center;
      padding: var(--uui-size-layout-4, 48px) var(--uui-size-layout-1, 24px);
      color: var(--uui-color-text-alt);
    }

    .empty-state h2 {
      font-size: 1.125rem;
      margin: 0 0 var(--uui-size-space-2, 6px);
      color: var(--uui-color-text);
    }

    .editor-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-space-5, 16px);
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .editor-grid.full {
      grid-template-columns: 1fr;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1, 4px);
    }

    .form-group label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--uui-color-text);
    }

    .field-card {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 6px);
      padding: var(--uui-size-space-4, 12px);
      margin-bottom: var(--uui-size-space-3, 8px);
      display: flex;
      align-items: flex-start;
      gap: var(--uui-size-space-3, 8px);
      transition: box-shadow 0.15s;
    }

    .field-card:hover {
      box-shadow: var(--uui-shadow-depth-1, 0 1px 3px rgba(0,0,0,0.1));
    }

    .field-card .drag-handle {
      cursor: grab;
      color: var(--uui-color-text-alt);
      padding-top: var(--uui-size-space-2, 6px);
      user-select: none;
    }

    .field-card .field-content {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-space-3, 8px);
    }

    .field-card .field-content .wide {
      grid-column: 1 / -1;
    }

    .field-card .field-actions {
      display: flex;
      gap: var(--uui-size-space-1, 4px);
      align-items: flex-start;
      padding-top: var(--uui-size-space-1, 4px);
    }

    .fields-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: var(--uui-size-space-5, 16px) 0 var(--uui-size-space-3, 8px);
    }

    .fields-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .section {
      margin-top: var(--uui-size-layout-2, 24px);
      padding-top: var(--uui-size-layout-2, 24px);
      border-top: 1px solid var(--uui-color-border);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--uui-size-space-4, 12px);
      margin-bottom: var(--uui-size-layout-2, 24px);
    }

    .stat-card {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 6px);
      padding: var(--uui-size-space-5, 16px);
      text-align: center;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--uui-color-primary);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt);
      margin-top: var(--uui-size-space-1, 4px);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2, 6px);
      margin-bottom: var(--uui-size-space-5, 16px);
      font-size: 0.8125rem;
      color: var(--uui-color-text-alt);
    }
  `;
s([
  u()
], o.prototype, "_view", 2);
s([
  u()
], o.prototype, "_forms", 2);
s([
  u()
], o.prototype, "_loadState", 2);
s([
  u()
], o.prototype, "_error", 2);
s([
  u()
], o.prototype, "_editingForm", 2);
s([
  u()
], o.prototype, "_formName", 2);
s([
  u()
], o.prototype, "_formCategory", 2);
s([
  u()
], o.prototype, "_fields", 2);
s([
  u()
], o.prototype, "_selectedFormId", 2);
o = s([
  v("form-builder-dashboard")
], o);
export {
  o as FormBuilderDashboardElement
};
//# sourceMappingURL=form-builder-dashboard.element.js.map

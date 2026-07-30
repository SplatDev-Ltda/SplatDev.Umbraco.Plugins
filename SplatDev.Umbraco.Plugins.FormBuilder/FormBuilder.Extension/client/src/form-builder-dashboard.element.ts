import {
  LitElement,
  html,
  css,
  nothing,
  repeat,
} from "@umbraco-cms/backoffice/external/lit";
import { customElement, state, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  UmbNotificationContext,
  UMB_NOTIFICATION_CONTEXT,
} from "@umbraco-cms/backoffice/notification";
import type {
  FormListItem,
  Form,
  FormField,
  FieldRequest,
} from "./types";
import { FIELD_TYPES } from "./types";
import { formBuilderApi } from "./api";

type View = "list" | "editor" | "submissions";
type LoadingState = "idle" | "loading" | "error" | "saving";

@customElement("form-builder-dashboard")
export class FormBuilderDashboardElement extends UmbElementMixin(LitElement) {
  @state() private _view: View = "list";
  @state() private _forms: FormListItem[] = [];
  @state() private _loadState: LoadingState = "idle";
  @state() private _error: string = "";
  @state() private _editingForm: Form | null = null;
  @state() private _formName: string = "";
  @state() private _formCategory: string = "";
  @state() private _fields: FieldRequest[] = [];
  @state() private _selectedFormId: number | null = null;

  private _notificationCtx?: UmbNotificationContext;

  constructor() {
    super();
    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (ctx) => {
      this._notificationCtx = ctx;
    });
  }

  override connectedCallback() {
    super.connectedCallback();
    this._loadForms();
  }

  static override styles = css`
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

  private _renderList() {
    if (this._loadState === "loading") {
      return html`<uui-loader-bar></uui-loader-bar>`;
    }

    return html`
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

      ${this._error && this._view === "list"
        ? html`<uui-ref-node
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
            </uui-ref-node>`
        : nothing}

      ${this._forms.length === 0
        ? this._renderEmpty()
        : html`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Name</uui-table-head-cell>
                <uui-table-head-cell>Category</uui-table-head-cell>
                <uui-table-head-cell>Fields</uui-table-head-cell>
                <uui-table-head-cell>Created</uui-table-head-cell>
                <uui-table-head-cell>Actions</uui-table-head-cell>
              </uui-table-head>
              ${repeat(
                this._forms,
                (f) => f.id,
                (form) => html`
                  <uui-table-row>
                    <uui-table-cell>
                      <strong>${form.name}</strong>
                    </uui-table-cell>
                    <uui-table-cell>${form.category || "—"}</uui-table-cell>
                    <uui-table-cell>${form.fieldCount}</uui-table-cell>
                    <uui-table-cell>
                      ${new Date(form.createdDate).toLocaleDateString()}
                    </uui-table-cell>
                    <uui-table-cell>
                      <div class="actions">
                        <uui-button
                          look="secondary"
                          label="Edit"
                          @click=${() => this._startEdit(form.id)}
                        >
                          <uui-icon name="icon-edit"></uui-icon>
                        </uui-button>
                        <uui-button
                          look="secondary"
                          label="Submissions"
                          @click=${() => this._openSubmissions(form.id)}
                        >
                          <uui-icon name="icon-document"></uui-icon>
                        </uui-button>
                        <uui-button
                          look="secondary"
                          color="danger"
                          label="Delete"
                          @click=${() => this._confirmDelete(form)}
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

  private _renderEmpty() {
    return html`
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

  private _renderEditor() {
    const isNew = !this._editingForm;
    const saving = this._loadState === "saving";

    return html`
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
        <span>${isNew ? "New Form" : `Edit: ${this._formName}`}</span>
      </div>

      <div class="header">
        <h1>${isNew ? "Create Form" : "Edit Form"}</h1>
        <uui-button
          look="primary"
          color="positive"
          label="Save form"
          .disabled=${saving || !this._formName.trim()}
          @click=${this._saveForm}
        >
          ${saving
            ? html`<uui-loader-circle></uui-loader-circle>`
            : html`<uui-icon name="icon-check"></uui-icon>`}
          ${saving ? "Saving..." : "Save Form"}
        </uui-button>
      </div>

      ${this._error
        ? html`<uui-ref-node
              name="Error"
              detail=${this._error}
              style="margin-bottom: var(--uui-size-space-4, 12px);"
            >
              <uui-icon slot="icon" name="icon-alert"></uui-icon>
            </uui-ref-node>`
        : nothing}

      <div class="editor-grid">
        <div class="form-group">
          <label for="form-name">Form Name *</label>
          <uui-input
            id="form-name"
            .value=${this._formName}
            placeholder="e.g. Contact Form"
            @input=${(e: InputEvent) =>
              (this._formName = (e.target as HTMLInputElement).value)}
          ></uui-input>
        </div>
        <div class="form-group">
          <label for="form-category">Category</label>
          <uui-input
            id="form-category"
            .value=${this._formCategory}
            placeholder="e.g. General, Sales"
            @input=${(e: InputEvent) =>
              (this._formCategory = (e.target as HTMLInputElement).value)}
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

        ${this._fields.length === 0
          ? html`
              <div class="empty-state" style="padding: var(--uui-size-layout-2, 24px);">
                <p>No fields added yet. Click "Add Field" to start building your form.</p>
              </div>
            `
          : repeat(
              this._fields,
              (f, idx) => `${f.type || ""}-${idx}`,
              (field, idx) => this._renderFieldCard(field, idx)
            )}
      </div>
    `;
  }

  private _renderFieldCard(field: FieldRequest, idx: number) {
    const isDropdownType =
      field.type === "Dropdown" ||
      field.type === "RadioButtonList" ||
      field.type === "Checkbox";

    return html`
      <div class="field-card">
        <div class="drag-handle" title="Drag to reorder">
          <uui-icon name="icon-navigation"></uui-icon>
        </div>
        <div class="field-content">
          <div class="wide" style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:600; color:var(--uui-color-text-alt);">
              #${idx + 1}
            </span>
            <uui-input
              .value=${field.label || ""}
              placeholder="Field label *"
              @input=${(e: InputEvent) =>
                (this._fields[idx] = {
                  ...field,
                  label: (e.target as HTMLInputElement).value,
                })}
              style="flex:1;"
            ></uui-input>
            <uui-select
              .value=${field.type || "TextBox"}
              @change=${(e: Event) =>
                (this._fields[idx] = {
                  ...field,
                  type: (e.target as HTMLSelectElement).value,
                })}
              style="min-width:140px;"
            >
              ${FIELD_TYPES.map(
                (t) =>
                  html`<uui-select-option .value=${t.value}
                    >${t.label}</uui-select-option
                  >`
              )}
            </uui-select>
          </div>

          <div class="form-group">
            <label>Placeholder</label>
            <uui-input
              .value=${field.placeholder || ""}
              placeholder="Placeholder text"
              @input=${(e: InputEvent) =>
                (this._fields[idx] = {
                  ...field,
                  placeholder: (e.target as HTMLInputElement).value,
                })}
            ></uui-input>
          </div>

          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <uui-checkbox
              .checked=${field.isRequired || false}
              label="Required"
              @change=${(e: Event) =>
                (this._fields[idx] = {
                  ...field,
                  isRequired: (e.target as HTMLInputElement).checked,
                })}
            ></uui-checkbox>

            <div style="display:flex; gap:4px; align-items:center;">
              <label style="font-size:0.75rem;">Min length</label>
              <uui-input
                type="number"
                .value=${String(field.minLength || 0)}
                style="width:60px;"
                @input=${(e: InputEvent) =>
                  (this._fields[idx] = {
                    ...field,
                    minLength: parseInt((e.target as HTMLInputElement).value) || 0,
                  })}
              ></uui-input>
            </div>
          </div>

          ${isDropdownType
            ? html`
                <div class="wide form-group">
                  <label>Options (one per line)</label>
                  <uui-textarea
                    .value=${(field.dropdownValues || []).join("\n")}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows="3"
                    @input=${(e: InputEvent) =>
                      (this._fields[idx] = {
                        ...field,
                        dropdownValues: (e.target as HTMLTextAreaElement).value
                          .split("\n")
                          .filter((v) => v.trim()),
                      })}
                  ></uui-textarea>
                </div>
              `
            : nothing}

          ${field.regex
            ? html`
                <div class="wide form-group">
                  <label>Validation Pattern</label>
                  <uui-input
                    .value=${field.regex}
                    placeholder="Regex pattern"
                    @input=${(e: InputEvent) =>
                      (this._fields[idx] = {
                        ...field,
                        regex: (e.target as HTMLInputElement).value,
                      })}
                  ></uui-input>
                </div>
              `
            : nothing}

          <div
            class="wide"
            style="display:flex; justify-content:flex-end; gap:6px; margin-top:4px;"
          >
            ${!field.regex
              ? html`<uui-button
                  look="secondary"
                  label="Add validation"
                  style="font-size:0.75rem;"
                  @click=${() =>
                    (this._fields[idx] = { ...field, regex: "" })}
                >
                  <uui-icon name="icon-filter"></uui-icon>
                  Validation
                </uui-button>`
              : nothing}
          </div>
        </div>
        <div class="field-actions">
          <uui-button
            look="secondary"
            color="danger"
            label="Remove field"
            @click=${() => this._removeField(idx)}
          >
            <uui-icon name="icon-remove"></uui-icon>
          </uui-button>
        </div>
      </div>
    `;
  }

  private _renderSubmissions() {
    return html`
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

  private async _loadForms() {
    this._loadState = "loading";
    this._error = "";
    try {
      this._forms = await formBuilderApi.getForms();
      this._loadState = "idle";
    } catch (e: any) {
      this._error = e.message || "Failed to load forms";
      this._loadState = "error";
    }
  }

  private _startCreate() {
    this._editingForm = null;
    this._formName = "";
    this._formCategory = "";
    this._fields = [];
    this._error = "";
    this._view = "editor";
  }

  private async _startEdit(formId: number) {
    this._loadState = "loading";
    this._error = "";
    try {
      const form = await formBuilderApi.getForm(formId);
      this._editingForm = form;
      this._formName = form.name;
      this._formCategory = form.category;
      this._fields = form.fields.map((f) => ({
        id: f.id,
        alias: f.alias,
        label: f.label,
        placeholder: f.placeholder,
        type: f.type,
        isRequired: f.isRequired,
        minLength: f.minLength,
        regex: f.regex,
        dropdownValues: (f.dropdownValues || []).map((dv) => dv.value),
      }));
      this._loadState = "idle";
      this._view = "editor";
    } catch (e: any) {
      this._error = e.message || "Failed to load form";
      this._loadState = "error";
      this._notify("Failed to load form", "danger");
    }
  }

  private async _saveForm() {
    if (!this._formName.trim()) return;

    this._loadState = "saving";
    this._error = "";
    try {
      if (this._editingForm) {
        await formBuilderApi.updateForm(this._editingForm.id, {
          name: this._formName,
          category: this._formCategory,
          fields: this._fields,
        });
        this._notify("Form updated successfully", "positive");
      } else {
        await formBuilderApi.createForm({
          name: this._formName,
          category: this._formCategory,
          fields: this._fields,
        });
        this._notify("Form created successfully", "positive");
      }
      this._loadState = "idle";
      this._goToList();
    } catch (e: any) {
      this._error = e.message || "Failed to save form";
      this._loadState = "error";
      this._notify("Failed to save form", "danger");
    }
  }

  private async _confirmDelete(form: FormListItem) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${form.name}"?`
    );
    if (!confirmed) return;

    try {
      await formBuilderApi.deleteForm(form.id);
      this._forms = this._forms.filter((f) => f.id !== form.id);
      this._notify(`"${form.name}" deleted`, "positive");
      this.requestUpdate();
    } catch (e: any) {
      this._notify(e.message || "Failed to delete form", "danger");
    }
  }

  private _openSubmissions(formId: number) {
    this._selectedFormId = formId;
    this._view = "submissions";
  }

  private _goToList() {
    this._view = "list";
    this._editingForm = null;
    this._error = "";
    this._loadForms();
  }

  private _addField() {
    this._fields = [
      ...this._fields,
      {
        label: "",
        type: "TextBox",
        isRequired: false,
        minLength: 0,
        placeholder: "",
      },
    ];
  }

  private _removeField(idx: number) {
    this._fields = this._fields.filter((_, i) => i !== idx);
  }

  private _notify(message: string, color: "positive" | "danger" = "positive") {
    this._notificationCtx?.peek(message, {
      color: color === "positive" ? "positive" : "danger",
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "form-builder-dashboard": FormBuilderDashboardElement;
  }
}

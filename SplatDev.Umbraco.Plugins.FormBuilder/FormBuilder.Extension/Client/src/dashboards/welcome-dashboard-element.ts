import {
  LitElement,
  html,
  css,
  customElement,
  state,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

interface FormEntity {
  id: number;
  name: string;
  category: string;
  createdDate: string;
  updatedDate: string;
  fields: FormField[];
  workflows: Workflow[];
}

interface FormField {
  id: number;
  formId: number;
  alias: string;
  label: string;
  placeholder: string;
  type: string;
  isRequired: boolean;
  minLength: number;
  regex: string | null;
  sortOrder: number;
  dropdownValues: DropdownValue[];
}

interface DropdownValue {
  id: number;
  fieldId: number;
  value: string;
}

interface Workflow {
  id: number;
  formId: number;
  name: string;
  description: string;
  isActive: boolean;
  workflowType: number;
}

interface FormStats {
  id: number;
  name: string;
  fieldCount: number;
  workflowCount: number;
  hasSubmissions: boolean;
}

type MessageType = "" | "success" | "error";
type ViewMode = "list" | "editor";

const API_BASE = "/umbraco/backoffice/formbuilderextension/api/v1/formbuilderextension";
const FIELD_TYPES = [
  { value: "TextBox", label: "Text Box" },
  { value: "TextArea", label: "Text Area" },
  { value: "Email", label: "Email" },
  { value: "Number", label: "Number" },
  { value: "Date", label: "Date" },
  { value: "Dropdown", label: "Dropdown" },
  { value: "Checkbox", label: "Checkbox" },
  { value: "Radio", label: "Radio Button List" },
];
const OPTION_FIELD_TYPES = ["Dropdown", "Checkbox", "Radio"];

@customElement("formbuilder-dashboard")
export class FormBuilderDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 20px);
      color: var(--uui-color-text);
      font-family: var(--uui-font-family);
      font-size: 0.875rem;
      max-width: 1200px;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--uui-size-layout-1, 20px);
    }
    .page-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: var(--uui-size-layout-1, 16px);
      flex-wrap: wrap;
    }
    .search-box {
      flex: 1;
      min-width: 200px;
      max-width: 360px;
      padding: 8px 12px;
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 6px);
      background: var(--uui-color-surface);
      color: var(--uui-color-text);
      font-size: 0.875rem;
    }
    .search-box::placeholder {
      color: var(--uui-color-text-alt);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: none;
      border-radius: var(--uui-border-radius, 6px);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      line-height: 1.4;
      transition: background 0.15s;
    }
    .btn-primary {
      background: var(--uui-color-current-emphasis, #3b82f6);
      color: #fff;
    }
    .btn-primary:hover {
      background: var(--uui-color-current, #2563eb);
    }
    .btn-secondary {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      color: var(--uui-color-text);
    }
    .btn-secondary:hover {
      background: var(--uui-color-surface-alt);
    }
    .btn-danger {
      background: var(--uui-color-danger-emphasis, #ef4444);
      color: #fff;
    }
    .btn-danger:hover {
      background: #dc2626;
    }
    .btn-sm {
      padding: 4px 10px;
      font-size: 0.8125rem;
    }

    .message {
      padding: 10px 16px;
      border-radius: var(--uui-border-radius, 6px);
      margin-bottom: 16px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .message.success {
      background: var(--uui-color-positive, #ecfdf5);
      color: var(--uui-color-positive-emphasis, #10b981);
    }
    .message.error {
      background: var(--uui-color-danger, #fef2f2);
      color: var(--uui-color-danger-emphasis, #ef4444);
    }

    .table-wrap {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 6px);
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      padding: 10px 16px;
      text-align: left;
      border-bottom: 1px solid var(--uui-color-border);
      font-size: 0.875rem;
    }
    th {
      background: var(--uui-color-surface-alt);
      font-weight: 600;
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--uui-color-text-alt);
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background: var(--uui-color-surface-alt);
    }
    .form-name-link {
      color: var(--uui-color-current-emphasis, #3b82f6);
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
    }
    .form-name-link:hover {
      text-decoration: underline;
    }

    .empty-state {
      padding: 60px 20px;
      text-align: center;
      color: var(--uui-color-text-alt);
    }
    .empty-state .icon {
      font-size: 3rem;
      margin-bottom: 12px;
    }
    .empty-state h3 {
      margin: 0 0 8px;
      font-weight: 600;
      color: var(--uui-color-text);
    }
    .empty-state p {
      margin: 0 0 20px;
      font-size: 0.875rem;
    }

    .loading-state {
      padding: 40px 20px;
      text-align: center;
      color: var(--uui-color-text-alt);
      font-size: 0.875rem;
    }

    .back-row {
      margin-bottom: 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
    .fieldset {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 6px);
      padding: 20px;
    }
    .fieldset h2 {
      margin: 0 0 16px;
      font-size: 1rem;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 14px;
    }
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-size: 0.8125rem;
      font-weight: 500;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 6px);
      background: var(--uui-color-surface);
      color: var(--uui-color-text);
      font-size: 0.875rem;
      box-sizing: border-box;
    }
    .form-group textarea {
      resize: vertical;
      min-height: 60px;
    }

    .field-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
      padding: 8px;
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 6px);
      background: var(--uui-color-surface-alt);
      flex-wrap: wrap;
    }
    .field-row .field-info {
      flex: 1;
      min-width: 150px;
    }
    .field-row .field-name {
      font-weight: 600;
      font-size: 0.8125rem;
    }
    .field-row .field-type {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt);
    }
    .field-row .field-controls {
      display: flex;
      gap: 4px;
    }

    .add-field-row {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .add-field-row select {
      min-width: 140px;
    }
    .add-field-row input {
      min-width: 160px;
      flex: 1;
    }

    .options-list {
      margin-top: 8px;
      padding-left: 16px;
    }
    .option-row {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-bottom: 6px;
    }
    .option-row input {
      flex: 1;
      padding: 5px 8px;
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 4px);
      font-size: 0.8125rem;
      background: var(--uui-color-surface);
      color: var(--uui-color-text);
    }
    .option-row .btn {
      padding: 4px 8px;
      font-size: 0.75rem;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 600;
    }
    .badge.active {
      background: var(--uui-color-positive, #ecfdf5);
      color: var(--uui-color-positive-emphasis, #10b981);
    }
    .badge.inactive {
      background: var(--uui-color-surface-alt);
      color: var(--uui-color-text-alt);
    }
  `;

  // ── state ────────────────────────────────────────────────────────────────

  @state() private _forms: FormEntity[] = [];
  @state() private _loading = false;
  @state() private _message = "";
  @state() private _messageType: MessageType = "";
  @state() private _searchTerm = "";
  @state() private _viewMode: ViewMode = "list";

  @state() private _editingForm: FormEntity | null = null;
  @state() private _formName = "";
  @state() private _formCategory = "";
  @state() private _fields: FormField[] = [];
  @state() private _isSaving = false;

  @state() private _stats: FormStats | null = null;
  @state() private _showStats = false;

  // ── new-field form ──────────────────────────────────────────────────────

  @state() private _newFieldType = "TextBox";
  @state() private _newFieldLabel = "";
  @state() private _newFieldAlias = "";
  @state() private _editingFieldIndex: number | null = null;
  @state() private _editField: FormField | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this._loadForms();
  }

  // ── helpers ─────────────────────────────────────────────────────────────

  private _showMessage(text: string, type: MessageType = "success") {
    this._message = text;
    this._messageType = type;
    setTimeout(() => {
      this._message = "";
      this._messageType = "";
    }, 5000);
  }

  private async _api<T>(url: string, init?: RequestInit): Promise<T | null> {
    try {
      const r = await fetch(`${API_BASE}${url}`, {
        headers: { "Content-Type": "application/json", ...init?.headers },
        ...init,
      });
      if (r.status === 204) return null;
      if (r.ok) return r.json();
      const err = await r.text();
      this._showMessage(err || `Request failed (${r.status})`, "error");
      return null;
    } catch {
      this._showMessage("Network error — please try again.", "error");
      return null;
    }
  }

  private get _filteredForms(): FormEntity[] {
    if (!this._searchTerm) return this._forms;
    const q = this._searchTerm.toLowerCase();
    return this._forms.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }

  private _formatDate(iso: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  private _goBack() {
    this._viewMode = "list";
    this._editingForm = null;
    this._stats = null;
    this._showStats = false;
    this._fields = [];
    this._loadForms();
  }

  // ── forms CRUD ──────────────────────────────────────────────────────────

  private async _loadForms() {
    this._loading = true;
    const data = await this._api<FormEntity[]>("/forms");
    this._forms = data ?? [];
    this._loading = false;
  }

  private async _createForm() {
    if (!this._formName.trim()) {
      this._showMessage("Form name is required.", "error");
      return;
    }
    this._isSaving = true;
    const created = await this._api<FormEntity>("/forms", {
      method: "POST",
      body: JSON.stringify({
        name: this._formName.trim(),
        category: this._formCategory.trim(),
        fields: this._fields,
        workflows: [],
      }),
    });
    if (created) {
      this._showMessage("Form created successfully.");
      this._goBack();
    }
    this._isSaving = false;
  }

  private async _updateForm() {
    if (!this._editingForm || !this._formName.trim()) {
      this._showMessage("Form name is required.", "error");
      return;
    }
    this._isSaving = true;
    const updated = await this._api<FormEntity>(
      `/forms/${this._editingForm.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          id: this._editingForm.id,
          name: this._formName.trim(),
          category: this._formCategory.trim(),
          fields: this._fields,
          workflows: this._editingForm.workflows ?? [],
        }),
      }
    );
    if (updated) {
      this._showMessage("Form updated successfully.");
      this._goBack();
    }
    this._isSaving = false;
  }

  private async _deleteForm(form: FormEntity) {
    if (
      !confirm(
        `Are you sure you want to delete "${form.name}"? This cannot be undone if the form has no submissions.`
      )
    )
      return;
    const res = await this._api<void>(`/forms/${form.id}`, {
      method: "DELETE",
    });
    if (res !== undefined) {
      this._showMessage("Form deleted.");
      this._loadForms();
    }
  }

  private async _viewStats(form: FormEntity) {
    this._showStats = true;
    const data = await this._api<FormStats>(`/forms/${form.id}/stats`);
    this._stats = data;
  }

  // ── edit flow ───────────────────────────────────────────────────────────

  private _openEditor(form?: FormEntity) {
    if (form) {
      this._editingForm = form;
      this._formName = form.name;
      this._formCategory = form.category;
      this._fields = [...(form.fields ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
    } else {
      this._editingForm = null;
      this._formName = "";
      this._formCategory = "";
      this._fields = [];
    }
    this._viewMode = "editor";
    this._stats = null;
    this._showStats = false;
  }

  // ── field management ────────────────────────────────────────────────────

  private _addField() {
    const label = this._newFieldLabel.trim();
    if (!label) {
      this._showMessage("Field label is required.", "error");
      return;
    }
    const alias =
      this._newFieldAlias.trim() ||
      label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
    const newField: FormField = {
      id: 0,
      formId: this._editingForm?.id ?? 0,
      alias,
      label,
      placeholder: "",
      type: this._newFieldType,
      isRequired: false,
      minLength: 0,
      regex: null,
      sortOrder: this._fields.length + 1,
      dropdownValues: [],
    };
    this._fields = [...this._fields, newField];
    this._newFieldLabel = "";
    this._newFieldAlias = "";
    this._newFieldType = "TextBox";
    this.requestUpdate();
  }

  private _removeField(index: number) {
    this._fields = this._fields.filter((_, i) => i !== index);
    this._fields = this._fields.map((f, i) => ({ ...f, sortOrder: i + 1 }));
    this.requestUpdate();
  }

  private _moveField(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this._fields.length) return;
    const fields = [...this._fields];
    [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
    this._fields = fields.map((f, i) => ({ ...f, sortOrder: i + 1 }));
    this.requestUpdate();
  }

  private _startEditField(index: number) {
    this._editingFieldIndex = index;
    this._editField = { ...this._fields[index] };
  }

  private _saveFieldEdit() {
    if (this._editingFieldIndex === null || !this._editField) return;
    const fields = [...this._fields];
    fields[this._editingFieldIndex] = { ...this._editField };
    this._fields = fields;
    this._editingFieldIndex = null;
    this._editField = null;
    this.requestUpdate();
  }

  private _cancelFieldEdit() {
    this._editingFieldIndex = null;
    this._editField = null;
  }

  private _addOptionValue(fieldIndex: number) {
    const fields = [...this._fields];
    fields[fieldIndex].dropdownValues = [
      ...(fields[fieldIndex].dropdownValues ?? []),
      { id: 0, fieldId: fields[fieldIndex].id, value: "" },
    ];
    this._fields = fields;
    this.requestUpdate();
  }

  private _updateOptionValue(
    fieldIndex: number,
    optionIndex: number,
    value: string
  ) {
    const fields = [...this._fields];
    const opts = [...(fields[fieldIndex].dropdownValues ?? [])];
    opts[optionIndex] = { ...opts[optionIndex], value };
    fields[fieldIndex].dropdownValues = opts;
    this._fields = fields;
    this.requestUpdate();
  }

  private _removeOptionValue(fieldIndex: number, optionIndex: number) {
    const fields = [...this._fields];
    fields[fieldIndex].dropdownValues = (
      fields[fieldIndex].dropdownValues ?? []
    ).filter((_, i) => i !== optionIndex);
    this._fields = fields;
    this.requestUpdate();
  }

  private _hasOptionsType(type: string): boolean {
    return OPTION_FIELD_TYPES.includes(type);
  }

  // ── render ──────────────────────────────────────────────────────────────

  override render() {
    if (this._viewMode === "editor") return this._renderEditor();
    return this._renderList();
  }

  private _renderList() {
    return html`
      <div class="page-header">
        <h1>Form Builder</h1>
        <button class="btn btn-primary" @click=${() => this._openEditor()}>
          + New Form
        </button>
      </div>

      ${this._message
        ? html`<div class="message ${this._messageType}">${this._message}</div>`
        : nothing}

      <div class="toolbar">
        <input
          class="search-box"
          type="text"
          placeholder="Search forms by name or category..."
          .value=${this._searchTerm}
          @input=${(e: InputEvent) =>
            (this._searchTerm = (e.target as HTMLInputElement).value)}
        />
      </div>

      ${this._showStats && this._stats ? this._renderStatsPanel() : nothing}

      ${this._loading
        ? html`<div class="loading-state">Loading forms...</div>`
        : this._filteredForms.length === 0
          ? this._renderEmpty()
          : html`
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Fields</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this._filteredForms.map(
                      (f) => html`
                        <tr>
                          <td>
                            <span
                              class="form-name-link"
                              @click=${() => this._openEditor(f)}
                              >${f.name}</span
                            >
                          </td>
                          <td>${f.category || "—"}</td>
                          <td>${f.fields?.length ?? 0}</td>
                          <td>${this._formatDate(f.createdDate)}</td>
                          <td>
                            <button
                              class="btn btn-secondary btn-sm"
                              @click=${() => this._openEditor(f)}
                            >
                              Edit
                            </button>
                            <button
                              class="btn btn-secondary btn-sm"
                              @click=${() => this._viewStats(f)}
                            >
                              Stats
                            </button>
                            <button
                              class="btn btn-danger btn-sm"
                              @click=${() => this._deleteForm(f)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `}
    `;
  }

  private _renderEmpty() {
    return html`
      <div class="empty-state">
        <div class="icon">📋</div>
        <h3>No forms yet</h3>
        <p>Create your first form to start collecting submissions.</p>
        <button class="btn btn-primary" @click=${() => this._openEditor()}>
          + Create Form
        </button>
      </div>
    `;
  }

  private _renderStatsPanel() {
    if (!this._stats) return nothing;
    return html`
      <div
        style="background:var(--uui-color-surface);border:1px solid var(--uui-color-border);border-radius:6px;padding:16px;margin-bottom:16px;"
      >
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong style="font-size:0.9375rem;"
            >Stats — ${this._stats.name}</strong
          >
          <button
            class="btn btn-secondary btn-sm"
            @click=${() => (this._showStats = false)}
          >
            Close
          </button>
        </div>
        <div style="margin-top:12px;display:flex;gap:20px;flex-wrap:wrap;">
          <div>
            <span style="font-size:1.25rem;font-weight:700;"
              >${this._stats.fieldCount}</span
            >
            <br /><span style="color:var(--uui-color-text-alt);">Fields</span>
          </div>
          <div>
            <span style="font-size:1.25rem;font-weight:700;"
              >${this._stats.workflowCount}</span
            >
            <br /><span style="color:var(--uui-color-text-alt);">Workflows</span>
          </div>
          <div>
            <span
              class="badge ${this._stats.hasSubmissions ? "active" : "inactive"}"
              >${this._stats.hasSubmissions
                ? "Has Submissions"
                : "No Submissions"}</span
            >
          </div>
        </div>
      </div>
    `;
  }

  private _renderEditor() {
    const isNew = !this._editingForm;
    return html`
      <div class="back-row">
        <button class="btn btn-secondary" @click=${this._goBack}>
          ← Back to Forms
        </button>
      </div>

      <div class="page-header">
        <h1>${isNew ? "Create Form" : "Edit Form"}</h1>
      </div>

      ${this._message
        ? html`<div class="message ${this._messageType}">${this._message}</div>`
        : nothing}

      <div class="form-grid">
        <div class="fieldset">
          <h2>Form Details</h2>
          <div class="form-group">
            <label>Name *</label>
            <input
              type="text"
              .value=${this._formName}
              @input=${(e: InputEvent) =>
                (this._formName = (e.target as HTMLInputElement).value)}
              placeholder="e.g. Contact Us"
            />
          </div>
          <div class="form-group">
            <label>Category</label>
            <input
              type="text"
              .value=${this._formCategory}
              @input=${(e: InputEvent) =>
                (this._formCategory = (e.target as HTMLInputElement).value)}
              placeholder="e.g. General, Support"
            />
          </div>
          <div style="margin-top: 20px; display: flex; gap: 8px;">
            <button
              class="btn btn-primary"
              ?disabled=${this._isSaving}
              @click=${isNew ? this._createForm : this._updateForm}
            >
              ${this._isSaving
                ? "Saving..."
                : isNew
                  ? "Create Form"
                  : "Save Changes"}
            </button>
            <button class="btn btn-secondary" @click=${this._goBack}>
              Cancel
            </button>
          </div>
        </div>

        <div class="fieldset">
          <h2>Fields (${this._fields.length})</h2>
          ${this._fields.length === 0
            ? html`<p style="color:var(--uui-color-text-alt);margin:0 0 16px;"
                  >No fields yet. Add fields below.</p
                >`
            : nothing}
          ${this._fields.map(
            (field, idx) => html`
              ${this._editingFieldIndex === idx
                ? this._renderFieldEditForm(idx, field)
                : html`
                    <div class="field-row">
                      <div class="field-info">
                        <div class="field-name">${field.label}</div>
                        <div class="field-type">
                          ${field.type} &middot; ${field.alias}
                          ${field.isRequired ? " · Required" : ""}
                        </div>
                        ${this._hasOptionsType(field.type) &&
                        field.dropdownValues?.length
                          ? html`<div style="font-size:0.75rem;color:var(--uui-color-text-alt);">
                              Options: ${field.dropdownValues
                                .map((d) => d.value)
                                .join(", ")}
                            </div>`
                          : nothing}
                      </div>
                      <div class="field-controls">
                        <button
                          class="btn btn-secondary btn-sm"
                          @click=${() => this._moveField(idx, -1)}
                          ?disabled=${idx === 0}
                        >
                          ↑
                        </button>
                        <button
                          class="btn btn-secondary btn-sm"
                          @click=${() =>
                            this._moveField(idx, 1)}
                          ?disabled=${idx === this._fields.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          class="btn btn-secondary btn-sm"
                          @click=${() => this._startEditField(idx)}
                        >
                          ✎
                        </button>
                        <button
                          class="btn btn-danger btn-sm"
                          @click=${() => this._removeField(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  `}
            `
          )}

          <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--uui-color-border);">
            <strong style="font-size:0.8125rem;">Add Field</strong>
            <div class="add-field-row">
              <select
                .value=${this._newFieldType}
                @change=${(e: Event) =>
                  (this._newFieldType = (e.target as HTMLSelectElement).value)}
              >
                ${FIELD_TYPES.map(
                  (ft) =>
                    html`<option value=${ft.value}>${ft.label}</option>`
                )}
              </select>
              <input
                type="text"
                placeholder="Label (e.g. Your Name)"
                .value=${this._newFieldLabel}
                @input=${(e: InputEvent) =>
                  (this._newFieldLabel = (e.target as HTMLInputElement).value)}
              />
              <input
                type="text"
                placeholder="Alias (auto-generated)"
                .value=${this._newFieldAlias}
                @input=${(e: InputEvent) =>
                  (this._newFieldAlias = (e.target as HTMLInputElement).value)}
              />
              <button class="btn btn-primary btn-sm" @click=${this._addField}>
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderFieldEditForm(idx: number, field: FormField) {
    if (!this._editField) return nothing;
    return html`
      <div
        style="border:1px solid var(--uui-color-current-emphasis, #3b82f6);border-radius:6px;padding:14px;margin-bottom:8px;background:var(--uui-color-surface);"
      >
        <div class="form-grid">
          <div>
            <div class="form-group">
              <label>Label</label>
              <input
                type="text"
                .value=${this._editField.label}
                @input=${(e: InputEvent) =>
                  (this._editField = {
                    ...this._editField!,
                    label: (e.target as HTMLInputElement).value,
                  })}
              />
            </div>
            <div class="form-group">
              <label>Alias</label>
              <input
                type="text"
                .value=${this._editField.alias}
                @input=${(e: InputEvent) =>
                  (this._editField = {
                    ...this._editField!,
                    alias: (e.target as HTMLInputElement).value,
                  })}
              />
            </div>
            <div class="form-group">
              <label>Type</label>
              <select
                .value=${this._editField.type}
                @change=${(e: Event) =>
                  (this._editField = {
                    ...this._editField!,
                    type: (e.target as HTMLSelectElement).value,
                  })}
              >
                ${FIELD_TYPES.map(
                  (ft) =>
                    html`<option value=${ft.value}>${ft.label}</option>`
                )}
              </select>
            </div>
          </div>
          <div>
            <div class="form-group">
              <label>Placeholder</label>
              <input
                type="text"
                .value=${this._editField.placeholder ?? ""}
                @input=${(e: InputEvent) =>
                  (this._editField = {
                    ...this._editField!,
                    placeholder: (e.target as HTMLInputElement).value,
                  })}
              />
            </div>
            <div class="form-group">
              <label>Min Length</label>
              <input
                type="number"
                .value=${String(this._editField.minLength ?? 0)}
                @input=${(e: InputEvent) =>
                  (this._editField = {
                    ...this._editField!,
                    minLength: parseInt(
                      (e.target as HTMLInputElement).value
                    ) || 0,
                  })}
              />
            </div>
            <div class="form-group" style="display:flex;align-items:center;gap:8px;margin-top:4px;">
              <input
                type="checkbox"
                .checked=${this._editField.isRequired}
                @change=${(e: Event) =>
                  (this._editField = {
                    ...this._editField!,
                    isRequired: (e.target as HTMLInputElement).checked,
                  })}
                id="field-required"
              />
              <label for="field-required" style="margin:0;font-size:0.875rem;">Required</label>
            </div>
          </div>
        </div>

        ${this._hasOptionsType(this._editField.type)
          ? html`
              <div style="margin-top:12px;">
                <strong style="font-size:0.8125rem;">Options</strong>
                <div class="options-list">
                  ${(this._editField.dropdownValues ?? []).map(
                    (opt, oi) => html`
                      <div class="option-row">
                        <input
                          type="text"
                          .value=${opt.value}
                          @input=${(e: InputEvent) => {
                            const vals = [
                              ...(this._editField?.dropdownValues ?? []),
                            ];
                            vals[oi] = {
                              ...vals[oi],
                              value: (e.target as HTMLInputElement).value,
                            };
                            this._editField = {
                              ...this._editField!,
                              dropdownValues: vals,
                            };
                          }}
                          placeholder="Option value"
                        />
                        <button
                          class="btn btn-danger btn-sm"
                          @click=${() => {
                            const vals = (
                              this._editField?.dropdownValues ?? []
                            ).filter((_, i) => i !== oi);
                            this._editField = {
                              ...this._editField!,
                              dropdownValues: vals,
                            };
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    `
                  )}
                </div>
                <button
                  class="btn btn-secondary btn-sm"
                  @click=${() => {
                    const vals = [
                      ...(this._editField?.dropdownValues ?? []),
                      { id: 0, fieldId: this._editField?.id ?? 0, value: "" },
                    ];
                    this._editField = {
                      ...this._editField!,
                      dropdownValues: vals,
                    };
                  }}
                >
                  + Add Option
                </button>
              </div>
            `
          : nothing}

        <div style="margin-top:12px;display:flex;gap:8px;">
          <button class="btn btn-primary btn-sm" @click=${this._saveFieldEdit}>
            Save
          </button>
          <button
            class="btn btn-secondary btn-sm"
            @click=${this._cancelFieldEdit}
          >
            Cancel
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "formbuilder-dashboard": FormBuilderDashboardElement;
  }
}

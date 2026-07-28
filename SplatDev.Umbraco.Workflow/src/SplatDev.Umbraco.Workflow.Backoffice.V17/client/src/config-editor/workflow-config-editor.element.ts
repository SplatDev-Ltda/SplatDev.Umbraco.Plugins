import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  WorkflowContext,
  WORKFLOW_CONTEXT_TOKEN,
  type WorkflowDefinitionDto,
  type WorkflowStepDisplay,
} from "../context/workflow.context.js";
import "./workflow-step-editor.element.js";

@customElement("workflow-config-editor")
export class WorkflowConfigEditorElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 16px; }
    .def-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .def-card {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px; border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 4px; cursor: pointer;
    }
    .def-card:hover { background: var(--uui-color-surface-alt, #f9fafb); }
    .def-card .name { font-weight: 600; }
    .def-card .meta { font-size: 0.8rem; color: var(--uui-color-text-alt, #6b7280); }
    .editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .editor-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-size: 0.8rem; font-weight: 500; }
    .steps-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .steps-header h3 { margin: 0; font-size: 1rem; }
    .button-row { display: flex; gap: 8px; margin-top: 16px; }
    .success-msg { color: #065f46; background: #d1fae5; padding: 8px 12px; border-radius: 4px; margin-top: 12px; }
  `;

  @state() private _definitions: WorkflowDefinitionDto[] = [];
  @state() private _editing: WorkflowDefinitionDto | null = null;
  @state() private _steps: WorkflowStepDisplay[] = [];
  @state() private _saving = false;
  @state() private _saved = false;
  @state() private _loading = false;

  #context?: WorkflowContext;

  override connectedCallback(): void {
    super.connectedCallback();
    this.consumeContext(WORKFLOW_CONTEXT_TOKEN, (ctx) => {
      this.#context = ctx;
      this.#loadDefinitions();
    });
  }

  async #loadDefinitions(): Promise<void> {
    if (!this.#context) return;
    this._loading = true;
    try {
      this._definitions = await this.#context.getDefinitions();
    } catch {
      this._definitions = [];
    }
    this._loading = false;
  }

  #selectDefinition(def: WorkflowDefinitionDto): void {
    this._editing = { ...def };
    const parsed = this.#context?.parseDefinition(def.definitionJson);
    this._steps = parsed?.steps ?? [];
    this._saved = false;
  }

  #back(): void {
    this._editing = null;
    this._steps = [];
    this._saved = false;
  }

  #addStep(): void {
    this._steps = [...this._steps, { key: "", label: "", actions: [] }];
  }

  #handleStepChanged(e: CustomEvent<{ index: number; step: WorkflowStepDisplay }>): void {
    const steps = [...this._steps];
    steps[e.detail.index] = e.detail.step;
    this._steps = steps;
  }

  #handleStepRemoved(e: CustomEvent<{ index: number }>): void {
    this._steps = this._steps.filter((_, i) => i !== e.detail.index);
  }

  async #save(): Promise<void> {
    if (!this.#context || !this._editing) return;
    this._saving = true;
    try {
      const dto: WorkflowDefinitionDto = {
        ...this._editing,
        version: this._editing.version + 1,
        definitionJson: JSON.stringify({ steps: this._steps }),
      };
      await this.#context.saveDefinition(dto);
      this._saved = true;
      await this.#loadDefinitions();
    } catch {
      // deferred to notification context
    }
    this._saving = false;
  }

  override render() {
    if (this._loading) return html`<uui-loader-bar></uui-loader-bar>`;

    if (this._editing) return this.#renderEditor();
    return this.#renderList();
  }

  #renderList() {
    return html`
      <h2>Workflow Definitions</h2>
      ${this._definitions.length === 0
        ? html`<p>No workflow definitions found.</p>`
        : html`
            <div class="def-list">
              ${this._definitions.map(
                (def) => html`
                  <div class="def-card" @click=${() => this.#selectDefinition(def)}>
                    <div>
                      <div class="name">${def.label}</div>
                      <div class="meta">Key: ${def.key} · Version ${def.version}</div>
                    </div>
                    <uui-badge color=${def.isActive ? "positive" : "default"}>
                      ${def.isActive ? "Active" : "Inactive"}
                    </uui-badge>
                  </div>
                `,
              )}
            </div>
          `}
    `;
  }

  #renderEditor() {
    const def = this._editing!;
    const allStepKeys = this._steps.map((s) => s.key).filter(Boolean);

    return html`
      <div class="editor-header">
        <h2>Edit: ${def.label}</h2>
        <uui-button look="secondary" label="Back" @click=${this.#back}>← Back</uui-button>
      </div>

      <div class="editor-fields">
        <div class="field">
          <label>Key</label>
          <uui-input .value=${def.key} disabled></uui-input>
        </div>
        <div class="field">
          <label>Label</label>
          <uui-input .value=${def.label} @input=${(e: InputEvent) => { this._editing = { ...def, label: (e.target as HTMLInputElement).value }; }}></uui-input>
        </div>
      </div>

      <div class="steps-header">
        <h3>Steps (${this._steps.length})</h3>
        <uui-button look="outline" label="Add Step" @click=${this.#addStep}>+ Step</uui-button>
      </div>

      ${this._steps.map(
        (step, i) => html`
          <workflow-step-editor
            .step=${step}
            .index=${i}
            .allStepKeys=${allStepKeys}
            @step-changed=${this.#handleStepChanged}
            @step-removed=${this.#handleStepRemoved}
          ></workflow-step-editor>
        `,
      )}

      <div class="button-row">
        <uui-button look="primary" label="Save as Version ${def.version + 1}" ?disabled=${this._saving} @click=${this.#save}>
          ${this._saving ? "Saving…" : `Save as Version ${def.version + 1}`}
        </uui-button>
      </div>

      ${this._saved ? html`<div class="success-msg">Definition saved successfully.</div>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-config-editor": WorkflowConfigEditorElement;
  }
}

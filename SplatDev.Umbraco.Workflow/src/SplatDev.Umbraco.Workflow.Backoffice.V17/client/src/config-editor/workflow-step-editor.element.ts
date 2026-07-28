import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property } from "@umbraco-cms/backoffice/external/lit";
import type { WorkflowStepDisplay, WorkflowActionDisplay } from "../context/workflow.context.js";
import "./workflow-action-editor.element.js";

@customElement("workflow-step-editor")
export class WorkflowStepEditorElement extends LitElement {
  static override styles = css`
    :host { display: block; padding: 12px; border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; margin-bottom: 12px; background: var(--uui-color-surface-alt, #f9fafb); }
    .step-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .step-header h4 { margin: 0; font-size: 0.95rem; font-weight: 600; }
    .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .field { display: flex; flex-direction: column; gap: 2px; }
    .field label { font-size: 0.75rem; font-weight: 500; color: var(--uui-color-text-alt, #6b7280); }
    .actions-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .actions-header h5 { margin: 0; font-size: 0.85rem; font-weight: 500; }
  `;

  @property({ type: Object }) step: WorkflowStepDisplay = { key: "", label: "", actions: [] };
  @property({ type: Number }) index = 0;
  @property({ type: Array }) allStepKeys: string[] = [];

  #emit(): void {
    this.dispatchEvent(new CustomEvent("step-changed", {
      detail: { index: this.index, step: { ...this.step } },
      bubbles: true, composed: true,
    }));
  }

  #removeStep(): void {
    this.dispatchEvent(new CustomEvent("step-removed", {
      detail: { index: this.index },
      bubbles: true, composed: true,
    }));
  }

  #addAction(): void {
    const newAction: WorkflowActionDisplay = { key: "", label: "", nextStepKey: "", assignment: 0 };
    this.step = { ...this.step, actions: [...this.step.actions, newAction] };
    this.#emit();
  }

  #handleActionChanged(e: CustomEvent<{ index: number; action: WorkflowActionDisplay }>): void {
    const actions = [...this.step.actions];
    actions[e.detail.index] = e.detail.action;
    this.step = { ...this.step, actions };
    this.#emit();
  }

  #handleActionRemoved(e: CustomEvent<{ index: number }>): void {
    const actions = this.step.actions.filter((_, i) => i !== e.detail.index);
    this.step = { ...this.step, actions };
    this.#emit();
  }

  override render() {
    return html`
      <div class="step-header">
        <h4>Step: ${this.step.label || this.step.key || "(new)"}</h4>
        <uui-button look="secondary" compact label="Remove Step" @click=${this.#removeStep}>
          <uui-icon name="icon-delete"></uui-icon>
        </uui-button>
      </div>

      <div class="fields">
        <div class="field">
          <label>Key</label>
          <uui-input .value=${this.step.key} @input=${(e: InputEvent) => { this.step = { ...this.step, key: (e.target as HTMLInputElement).value }; this.#emit(); }}></uui-input>
        </div>
        <div class="field">
          <label>Label</label>
          <uui-input .value=${this.step.label} @input=${(e: InputEvent) => { this.step = { ...this.step, label: (e.target as HTMLInputElement).value }; this.#emit(); }}></uui-input>
        </div>
        <div class="field">
          <label>Department</label>
          <uui-input .value=${this.step.department ?? ""} @input=${(e: InputEvent) => { this.step = { ...this.step, department: (e.target as HTMLInputElement).value }; this.#emit(); }}></uui-input>
        </div>
        <div class="field">
          <label>Group</label>
          <uui-input .value=${this.step.group ?? ""} @input=${(e: InputEvent) => { this.step = { ...this.step, group: (e.target as HTMLInputElement).value }; this.#emit(); }}></uui-input>
        </div>
      </div>

      <div class="actions-header">
        <h5>Actions</h5>
        <uui-button look="outline" compact label="Add Action" @click=${this.#addAction}>+ Action</uui-button>
      </div>

      ${this.step.actions.map(
        (action, i) => html`
          <workflow-action-editor
            .action=${action}
            .index=${i}
            .stepKeys=${this.allStepKeys}
            @action-changed=${this.#handleActionChanged}
            @action-removed=${this.#handleActionRemoved}
          ></workflow-action-editor>
        `,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-step-editor": WorkflowStepEditorElement;
  }
}

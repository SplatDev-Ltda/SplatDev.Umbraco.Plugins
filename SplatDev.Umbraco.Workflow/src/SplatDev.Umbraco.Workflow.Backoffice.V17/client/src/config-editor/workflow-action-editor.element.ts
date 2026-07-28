import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property } from "@umbraco-cms/backoffice/external/lit";
import type { WorkflowActionDisplay } from "../context/workflow.context.js";

@customElement("workflow-action-editor")
export class WorkflowActionEditorElement extends LitElement {
  static override styles = css`
    :host { display: block; padding: 8px; border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 4px; margin-bottom: 8px; background: var(--uui-color-surface, #fff); }
    .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 120px; }
    .field label { font-size: 0.7rem; font-weight: 500; color: var(--uui-color-text-alt, #6b7280); }
    .remove { align-self: flex-end; }
  `;

  @property({ type: Object }) action: WorkflowActionDisplay = { key: "", label: "", nextStepKey: "", assignment: 0 };
  @property({ type: Number }) index = 0;
  @property({ type: Array }) stepKeys: string[] = [];

  #emit(): void {
    this.dispatchEvent(new CustomEvent("action-changed", {
      detail: { index: this.index, action: { ...this.action } },
      bubbles: true, composed: true,
    }));
  }

  #remove(): void {
    this.dispatchEvent(new CustomEvent("action-removed", {
      detail: { index: this.index },
      bubbles: true, composed: true,
    }));
  }

  override render() {
    const assignmentOptions = [
      { name: "Assign to Group", value: "0", selected: this.action.assignment === 0 },
      { name: "Assign to Submitter", value: "1", selected: this.action.assignment === 1 },
      { name: "Manual", value: "2", selected: this.action.assignment === 2 },
    ];

    const nextStepOptions = [
      { name: "(none)", value: "", selected: !this.action.nextStepKey },
      ...this.stepKeys.map((k) => ({ name: k, value: k, selected: k === this.action.nextStepKey })),
    ];

    return html`
      <div class="row">
        <div class="field">
          <label>Key</label>
          <uui-input .value=${this.action.key} @input=${(e: InputEvent) => { this.action = { ...this.action, key: (e.target as HTMLInputElement).value }; this.#emit(); }}></uui-input>
        </div>
        <div class="field">
          <label>Label</label>
          <uui-input .value=${this.action.label} @input=${(e: InputEvent) => { this.action = { ...this.action, label: (e.target as HTMLInputElement).value }; this.#emit(); }}></uui-input>
        </div>
        <div class="field">
          <label>Next Step</label>
          <uui-select .options=${nextStepOptions} @change=${(e: Event) => { this.action = { ...this.action, nextStepKey: (e.target as HTMLSelectElement).value }; this.#emit(); }}></uui-select>
        </div>
        <div class="field">
          <label>Assignment</label>
          <uui-select .options=${assignmentOptions} @change=${(e: Event) => { this.action = { ...this.action, assignment: Number((e.target as HTMLSelectElement).value) }; this.#emit(); }}></uui-select>
        </div>
        <uui-button class="remove" look="secondary" compact label="Remove" @click=${this.#remove}>
          <uui-icon name="icon-delete"></uui-icon>
        </uui-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-action-editor": WorkflowActionEditorElement;
  }
}

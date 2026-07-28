import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property } from "@umbraco-cms/backoffice/external/lit";
import type { WorkflowStepDisplay } from "../../context/workflow.context.js";

@customElement("workflow-horizontal-stepper")
export class WorkflowHorizontalStepperElement extends LitElement {
  static override styles = css`
    :host { display: block; }
    .stepper { display: flex; align-items: center; gap: 0; width: 100%; }
    .step {
      display: flex; flex-direction: column; align-items: center; flex: 1;
      position: relative;
    }
    .step-indicator {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700; color: #fff;
      background: var(--swf-chart-step-pending-bg, #d1d5db);
      z-index: 1;
    }
    .step.completed .step-indicator {
      background: var(--swf-chart-step-completed-bg, #22c55e);
    }
    .step.active .step-indicator {
      background: var(--swf-chart-step-active-bg, #2563eb);
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
    }
    .step-label {
      margin-top: 6px; font-size: 0.7rem; text-align: center;
      color: var(--uui-color-text-alt, #6b7280);
      max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .step.active .step-label { color: var(--uui-color-text, #111); font-weight: 600; }
    .connector {
      flex: 1; height: 3px; min-width: 16px;
      background: var(--swf-chart-step-pending-bg, #d1d5db);
      margin-top: -16px; align-self: flex-start; margin-top: 16px;
    }
    .connector.completed { background: var(--swf-chart-step-completed-bg, #22c55e); }
  `;

  @property({ type: Array }) steps: WorkflowStepDisplay[] = [];
  @property({ type: String, attribute: "current-step" }) currentStep = "";

  override render() {
    const currentIdx = this.steps.findIndex((s) => s.key === this.currentStep);
    return html`
      <div class="stepper">
        ${this.steps.map((step, i) => {
          const completed = i < currentIdx;
          const active = i === currentIdx;
          const cls = completed ? "step completed" : active ? "step active" : "step";
          return html`
            ${i > 0 ? html`<div class="connector ${i <= currentIdx ? "completed" : ""}"></div>` : ""}
            <div class="${cls}">
              <div class="step-indicator">
                ${completed ? html`&#10003;` : html`${i + 1}`}
              </div>
              <div class="step-label">${step.label}</div>
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-horizontal-stepper": WorkflowHorizontalStepperElement;
  }
}

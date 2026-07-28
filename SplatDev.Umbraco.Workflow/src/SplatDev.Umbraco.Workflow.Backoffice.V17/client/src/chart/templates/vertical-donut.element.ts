import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property } from "@umbraco-cms/backoffice/external/lit";
import type { WorkflowStepDisplay } from "../../context/workflow.context.js";

@customElement("workflow-vertical-donut")
export class WorkflowVerticalDonutElement extends LitElement {
  static override styles = css`
    :host { display: block; }
    .timeline { display: flex; flex-direction: column; gap: 0; padding-left: 16px; }
    .step-row { display: flex; align-items: flex-start; gap: 12px; position: relative; }
    .step-row:not(:last-child) { padding-bottom: 24px; }
    .step-row:not(:last-child)::before {
      content: ""; position: absolute; left: 11px; top: 28px; bottom: 0; width: 2px;
      background: var(--swf-chart-step-pending-bg, #d1d5db);
    }
    .step-row.completed:not(:last-child)::before {
      background: var(--swf-chart-step-completed-bg, #22c55e);
    }
    .donut {
      width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
      border: 3px solid var(--swf-chart-step-pending-bg, #d1d5db);
      background: #fff; z-index: 1;
    }
    .step-row.completed .donut {
      border-color: var(--swf-chart-step-completed-bg, #22c55e);
      background: var(--swf-chart-step-completed-bg, #22c55e);
    }
    .step-row.active .donut {
      border-color: var(--swf-chart-step-active-bg, #2563eb);
      background: var(--swf-chart-step-active-bg, #2563eb);
    }
    .step-info { padding-top: 2px; }
    .step-label { font-size: 0.85rem; font-weight: 500; }
    .step-row.active .step-label { font-weight: 700; color: var(--swf-chart-step-active-bg, #2563eb); }
    .step-detail { font-size: 0.7rem; color: var(--uui-color-text-alt, #6b7280); }
  `;

  @property({ type: Array }) steps: WorkflowStepDisplay[] = [];
  @property({ type: String, attribute: "current-step" }) currentStep = "";

  override render() {
    const currentIdx = this.steps.findIndex((s) => s.key === this.currentStep);
    return html`
      <div class="timeline">
        ${this.steps.map((step, i) => {
          const completed = i < currentIdx;
          const active = i === currentIdx;
          const cls = completed ? "step-row completed" : active ? "step-row active" : "step-row";
          return html`
            <div class="${cls}">
              <div class="donut"></div>
              <div class="step-info">
                <div class="step-label">${step.label}</div>
                ${step.department ? html`<div class="step-detail">${step.department}</div>` : ""}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-vertical-donut": WorkflowVerticalDonutElement;
  }
}

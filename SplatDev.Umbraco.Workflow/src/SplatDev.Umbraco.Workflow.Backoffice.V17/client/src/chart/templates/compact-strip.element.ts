import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property } from "@umbraco-cms/backoffice/external/lit";
import type { WorkflowStepDisplay } from "../../context/workflow.context.js";

@customElement("workflow-compact-strip")
export class WorkflowCompactStripElement extends LitElement {
  static override styles = css`
    :host { display: block; }
    .strip { display: flex; border-radius: 4px; overflow: hidden; height: 28px; }
    .segment {
      flex: 1; display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 600; color: #fff;
      background: var(--swf-chart-step-pending-bg, #d1d5db);
      transition: background 0.2s;
    }
    .segment.completed { background: var(--swf-chart-step-completed-bg, #22c55e); }
    .segment.active { background: var(--swf-chart-step-active-bg, #2563eb); }
    .segment + .segment { border-left: 1px solid rgba(255, 255, 255, 0.3); }
  `;

  @property({ type: Array }) steps: WorkflowStepDisplay[] = [];
  @property({ type: String, attribute: "current-step" }) currentStep = "";

  override render() {
    const currentIdx = this.steps.findIndex((s) => s.key === this.currentStep);
    return html`
      <div class="strip">
        ${this.steps.map((step, i) => {
          const completed = i < currentIdx;
          const active = i === currentIdx;
          const cls = completed ? "segment completed" : active ? "segment active" : "segment";
          return html`<div class="${cls}" title="${step.label}">${step.label.substring(0, 3)}</div>`;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-compact-strip": WorkflowCompactStripElement;
  }
}

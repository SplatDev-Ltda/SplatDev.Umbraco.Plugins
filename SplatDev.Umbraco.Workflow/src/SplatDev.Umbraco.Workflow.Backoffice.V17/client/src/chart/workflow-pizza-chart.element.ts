import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property } from "@umbraco-cms/backoffice/external/lit";
import type { WorkflowStepDisplay } from "../context/workflow.context.js";
import "./templates/horizontal-stepper.element.js";
import "./templates/vertical-donut.element.js";
import "./templates/compact-strip.element.js";

@customElement("workflow-pizza-chart")
export class WorkflowPizzaChartElement extends LitElement {
  static override styles = css`
    :host { display: block; }
  `;

  @property({ type: Array }) steps: WorkflowStepDisplay[] = [];
  @property({ type: String, attribute: "current-step" }) currentStep = "";
  @property({ type: String }) variant: "horizontal-stepper" | "vertical-donut" | "compact-strip" = "horizontal-stepper";

  override render() {
    switch (this.variant) {
      case "vertical-donut":
        return html`<workflow-vertical-donut .steps=${this.steps} current-step=${this.currentStep}></workflow-vertical-donut>`;
      case "compact-strip":
        return html`<workflow-compact-strip .steps=${this.steps} current-step=${this.currentStep}></workflow-compact-strip>`;
      default:
        return html`<workflow-horizontal-stepper .steps=${this.steps} current-step=${this.currentStep}></workflow-horizontal-stepper>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-pizza-chart": WorkflowPizzaChartElement;
  }
}

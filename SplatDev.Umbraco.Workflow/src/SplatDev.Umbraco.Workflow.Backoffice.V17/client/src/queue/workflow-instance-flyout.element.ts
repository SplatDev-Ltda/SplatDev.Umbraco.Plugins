import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  WorkflowContext,
  WORKFLOW_CONTEXT_TOKEN,
  type WorkflowInstanceDto,
  type WorkflowStepDisplay,
} from "../context/workflow.context.js";
import "../chart/workflow-pizza-chart.element.js";

@customElement("workflow-instance-flyout")
export class WorkflowInstanceFlyoutElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
    .meta-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      margin-bottom: 16px; font-size: 0.85rem;
    }
    .meta-label { color: var(--uui-color-text-alt, #6b7280); font-size: 0.75rem; text-transform: uppercase; }
    .chart-section { margin: 16px 0; }
    .actions-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
    .status-badge {
      display: inline-block; padding: 2px 8px; border-radius: 9999px;
      font-size: 0.7rem; font-weight: 600;
    }
    .status-0 { background: #dbeafe; color: #1e40af; }
    .status-1 { background: #d1fae5; color: #065f46; }
    .status-2 { background: #fee2e2; color: #991b1b; }
  `;

  @property({ type: Number, attribute: "instance-id" }) instanceId = 0;
  @state() private _instance: WorkflowInstanceDto | null = null;
  @state() private _steps: WorkflowStepDisplay[] = [];
  @state() private _currentActions: { key: string; label: string }[] = [];
  @state() private _loading = false;
  @state() private _transitioning = false;

  #context?: WorkflowContext;

  override connectedCallback(): void {
    super.connectedCallback();
    this.consumeContext(WORKFLOW_CONTEXT_TOKEN, (ctx) => {
      this.#context = ctx;
      if (this.instanceId) this.#load();
    });
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has("instanceId") && this.instanceId && this.#context) {
      this.#load();
    }
  }

  async #load(): Promise<void> {
    if (!this.#context || !this.instanceId) return;
    this._loading = true;
    try {
      this._instance = await this.#context.getInstance(this.instanceId);
      const def = await this.#context.getDefinition(this._instance.workflowKey);
      const parsed = this.#context.parseDefinition(def.definitionJson);
      this._steps = parsed.steps;
      const currentStep = this._steps.find((s) => s.key === this._instance!.currentStepKey);
      this._currentActions = currentStep?.actions?.map((a) => ({ key: a.key, label: a.label })) ?? [];
    } catch {
      this._instance = null;
      this._steps = [];
    }
    this._loading = false;
  }

  async #handleTransition(actionKey: string): Promise<void> {
    if (!this.#context || !this._instance) return;
    this._transitioning = true;
    try {
      const result = await this.#context.transition(this._instance.id, actionKey);
      if (result.success) {
        this.dispatchEvent(new CustomEvent("transition-complete", { bubbles: true, composed: true }));
        await this.#load();
      }
    } catch {
      // error handling deferred to notification context
    }
    this._transitioning = false;
  }

  #statusLabel(status: number): string {
    switch (status) {
      case 0: return "Open";
      case 1: return "Completed";
      case 2: return "Cancelled";
      default: return `Status ${status}`;
    }
  }

  #close(): void {
    this.dispatchEvent(new CustomEvent("close-flyout", { bubbles: true, composed: true }));
  }

  override render() {
    if (this._loading) return html`<uui-loader-bar></uui-loader-bar>`;
    if (!this._instance) return html`<p>No instance selected.</p>`;

    const inst = this._instance;
    return html`
      <div class="header">
        <h3>Instance #${inst.id}</h3>
        <uui-button look="secondary" compact label="Close" @click=${this.#close}>
          <uui-icon name="icon-wrong"></uui-icon>
        </uui-button>
      </div>

      <div class="meta-grid">
        <div><span class="meta-label">Workflow</span><br>${inst.workflowKey}</div>
        <div><span class="meta-label">Version</span><br>${inst.workflowVersion}</div>
        <div><span class="meta-label">Current Step</span><br>${inst.currentStepKey}</div>
        <div>
          <span class="meta-label">Status</span><br>
          <span class="status-badge status-${inst.status}">${this.#statusLabel(inst.status)}</span>
        </div>
        <div><span class="meta-label">Created</span><br>${new Date(inst.createdAt).toLocaleString()}</div>
        <div><span class="meta-label">Created By</span><br>${inst.createdBy}</div>
      </div>

      <div class="chart-section">
        <workflow-pizza-chart
          .steps=${this._steps}
          current-step=${inst.currentStepKey}
        ></workflow-pizza-chart>
      </div>

      ${inst.status === 0 && this._currentActions.length > 0
        ? html`
            <div class="actions-row">
              ${this._currentActions.map(
                (a) => html`
                  <uui-button
                    look="primary"
                    label=${a.label}
                    ?disabled=${this._transitioning}
                    @click=${() => this.#handleTransition(a.key)}
                  >${a.label}</uui-button>
                `,
              )}
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-instance-flyout": WorkflowInstanceFlyoutElement;
  }
}

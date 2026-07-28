import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  WorkflowContext,
  WORKFLOW_CONTEXT_TOKEN,
  type WorkflowQueueFilter,
  type WorkflowDefinitionDto,
} from "../context/workflow.context.js";
import "./workflow-queue-table.element.js";
import "./workflow-instance-flyout.element.js";

@customElement("workflow-queue-workspace")
export class WorkflowQueueWorkspaceElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 16px; }
    .filter-bar {
      display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
      margin-bottom: 16px; padding: 12px; border-radius: 4px;
      background: var(--uui-color-surface-alt, #f9fafb);
      border: 1px solid var(--uui-color-border, #e5e7eb);
    }
    .filter-bar uui-select, .filter-bar uui-input { min-width: 160px; }
    .flyout-panel {
      position: fixed; right: 0; top: 0; bottom: 0; width: 480px; z-index: 1000;
      background: var(--uui-color-surface, #fff);
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
      overflow-y: auto;
    }
    .flyout-backdrop {
      position: fixed; inset: 0; z-index: 999;
      background: rgba(0, 0, 0, 0.3);
    }
  `;

  @state() private _definitions: WorkflowDefinitionDto[] = [];
  @state() private _filter: WorkflowQueueFilter = {};
  @state() private _selectedInstanceId: number | null = null;

  #context!: WorkflowContext;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#context = new WorkflowContext(this);
    this.provideContext(WORKFLOW_CONTEXT_TOKEN, this.#context);
    this.#loadDefinitions();
  }

  async #loadDefinitions(): Promise<void> {
    try {
      this._definitions = await this.#context.getDefinitions();
    } catch {
      this._definitions = [];
    }
  }

  #handleRowClicked(e: CustomEvent<{ instanceId: number }>): void {
    this._selectedInstanceId = e.detail.instanceId;
  }

  #closeFlyout(): void {
    this._selectedInstanceId = null;
  }

  #handleTransitionComplete(): void {
    this.renderRoot.querySelector("workflow-queue-table")?.refresh();
  }

  override render() {
    const workflowOptions = [
      { name: "All Workflows", value: "", selected: !this._filter.workflowKey },
      ...this._definitions.map((d) => ({
        name: d.label,
        value: d.key,
        selected: d.key === this._filter.workflowKey,
      })),
    ];

    const statusOptions = [
      { name: "All Statuses", value: "", selected: this._filter.status === undefined },
      { name: "Open", value: "0", selected: this._filter.status === 0 },
      { name: "Completed", value: "1", selected: this._filter.status === 1 },
      { name: "Cancelled", value: "2", selected: this._filter.status === 2 },
    ];

    return html`
      <h2>Workflow Queue</h2>

      <div class="filter-bar">
        <uui-select
          .options=${workflowOptions}
          @change=${(e: Event) => {
            const val = (e.target as HTMLSelectElement).value;
            this._filter = { ...this._filter, workflowKey: val || undefined };
          }}
        ></uui-select>

        <uui-select
          .options=${statusOptions}
          @change=${(e: Event) => {
            const val = (e.target as HTMLSelectElement).value;
            this._filter = { ...this._filter, status: val ? Number(val) : undefined };
          }}
        ></uui-select>

        <uui-toggle
          label="Assigned to me"
          ?checked=${this._filter.assignedToMe}
          @change=${(e: Event) => {
            this._filter = { ...this._filter, assignedToMe: (e.target as HTMLInputElement).checked };
          }}
        ></uui-toggle>

        <uui-input
          placeholder="Search…"
          @input=${(e: InputEvent) => {
            this._filter = { ...this._filter, freeText: (e.target as HTMLInputElement).value || undefined };
          }}
        ></uui-input>
      </div>

      <workflow-queue-table
        .filter=${this._filter}
        @row-clicked=${this.#handleRowClicked}
      ></workflow-queue-table>

      ${this._selectedInstanceId !== null
        ? html`
            <div class="flyout-backdrop" @click=${this.#closeFlyout}></div>
            <div class="flyout-panel">
              <workflow-instance-flyout
                instance-id=${this._selectedInstanceId}
                @close-flyout=${this.#closeFlyout}
                @transition-complete=${this.#handleTransitionComplete}
              ></workflow-instance-flyout>
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-queue-workspace": WorkflowQueueWorkspaceElement;
  }
}

import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import {
  WorkflowContext,
  WORKFLOW_CONTEXT_TOKEN,
  type WorkflowDisplayRow,
  type WorkflowQueueFilter,
} from "../context/workflow.context.js";

@customElement("workflow-queue-table")
export class WorkflowQueueTableElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; }
    uui-table { width: 100%; }
    .empty { text-align: center; padding: 24px; color: var(--uui-color-text-alt, #6b7280); }
    .status-badge {
      display: inline-block; padding: 2px 8px; border-radius: 9999px;
      font-size: 0.7rem; font-weight: 600;
    }
    .status-0 { background: #dbeafe; color: #1e40af; }
    .status-1 { background: #d1fae5; color: #065f46; }
    .status-2 { background: #fee2e2; color: #991b1b; }
    .pagination { display: flex; justify-content: center; margin-top: 16px; }
  `;

  @property({ type: Object }) filter: WorkflowQueueFilter = {};
  @state() private _rows: WorkflowDisplayRow[] = [];
  @state() private _total = 0;
  @state() private _page = 1;
  @state() private _loading = false;

  #context?: WorkflowContext;

  override connectedCallback(): void {
    super.connectedCallback();
    this.consumeContext(WORKFLOW_CONTEXT_TOKEN, (ctx) => {
      this.#context = ctx;
      this.#load();
    });
  }

  async #load(): Promise<void> {
    if (!this.#context) return;
    this._loading = true;
    try {
      const result = await this.#context.getInstances({
        ...this.filter,
        page: this._page,
        pageSize: 25,
      });
      this._rows = result.items;
      this._total = result.totalCount;
    } catch {
      this._rows = [];
      this._total = 0;
    }
    this._loading = false;
  }

  public async refresh(): Promise<void> {
    await this.#load();
  }

  #handleRowClick(row: WorkflowDisplayRow): void {
    this.dispatchEvent(
      new CustomEvent("row-clicked", { detail: { instanceId: row.instanceId }, bubbles: true, composed: true }),
    );
  }

  #handlePageChange(e: CustomEvent): void {
    this._page = e.detail?.page ?? 1;
    this.#load();
  }

  #statusLabel(status: unknown): string {
    switch (Number(status)) {
      case 0: return "Open";
      case 1: return "Completed";
      case 2: return "Cancelled";
      default: return String(status);
    }
  }

  override render() {
    if (this._loading) return html`<uui-loader-bar></uui-loader-bar>`;

    if (this._rows.length === 0) {
      return html`<div class="empty">No workflow instances found.</div>`;
    }

    const columns = this._rows.length > 0 ? Object.keys(this._rows[0].values) : [];
    const totalPages = Math.ceil(this._total / 25);

    return html`
      <uui-table>
        <uui-table-head>
          <uui-table-head-cell>ID</uui-table-head-cell>
          ${columns.map((col) => html`<uui-table-head-cell>${col}</uui-table-head-cell>`)}
        </uui-table-head>
        ${this._rows.map(
          (row) => html`
            <uui-table-row @click=${() => this.#handleRowClick(row)} style="cursor:pointer">
              <uui-table-cell>${row.instanceId}</uui-table-cell>
              ${columns.map((col) => {
                const val = row.values[col];
                if (col.toLowerCase() === "status") {
                  return html`<uui-table-cell>
                    <span class="status-badge status-${val}">${this.#statusLabel(val)}</span>
                  </uui-table-cell>`;
                }
                return html`<uui-table-cell>${val ?? ""}</uui-table-cell>`;
              })}
            </uui-table-row>
          `,
        )}
      </uui-table>
      ${totalPages > 1
        ? html`<div class="pagination">
            <uui-pagination .total=${totalPages} .current=${this._page} @change=${this.#handlePageChange}></uui-pagination>
          </div>`
        : ""}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "workflow-queue-table": WorkflowQueueTableElement;
  }
}

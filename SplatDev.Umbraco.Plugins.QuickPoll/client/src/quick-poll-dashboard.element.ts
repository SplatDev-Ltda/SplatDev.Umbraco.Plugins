import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface PollOption {
  id: number;
  optionText: string;
  sortOrder: number;
  voteCount: number;
}

interface Poll {
  id: number;
  question: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
  options: PollOption[];
}

interface PollResults {
  pollId: number;
  question: string;
  totalVotes: number;
  options: Array<{
    optionId: number;
    optionText: string;
    voteCount: number;
    percentage: number;
  }>;
}

@customElement("quick-poll-dashboard")
export class QuickPollDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 8px;
      color: var(--uui-color-text);
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 24px;
    }

    .toolbar {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .section {
      margin-bottom: 24px;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-active { background: #d1fae5; color: #065f46; }
    .badge-inactive { background: #fee2e2; color: #991b1b; }

    .result-bar-wrap {
      flex: 1;
      height: 12px;
      background: var(--uui-color-surface-alt, #f3f4f6);
      border-radius: 6px;
      overflow: hidden;
      min-width: 80px;
    }

    .result-bar {
      height: 100%;
      background: var(--uui-color-interactive, #1a56db);
      border-radius: 6px;
    }

    .result-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 0.9rem;
    }

    .option-label { min-width: 120px; }
    .option-pct { min-width: 60px; text-align: right; color: var(--uui-color-text-alt); }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--uui-color-text-alt);
    }
  `;

  @state() private _polls: Poll[] = [];
  @state() private _loading = false;
  @state() private _error: string | null = null;
  @state() private _selectedPollResults: PollResults | null = null;

  private readonly _apiBase = "/umbraco/api/quickpoll";

  override connectedCallback() {
    super.connectedCallback();
    this._loadPolls();
  }

  private async _loadPolls() {
    this._loading = true;
    this._error = null;
    try {
      const res = await this.#fetch(`${this._apiBase}/getall`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this._polls = await res.json();
    } catch (e) {
      this._error = `Failed to load polls: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._loading = false;
    }
  }

  private async _viewResults(pollId: number) {
    try {
      const res = await this.#fetch(`${this._apiBase}/results?pollId=${pollId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this._selectedPollResults = await res.json();
    } catch (e) {
      this._error = `Failed to load results: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  private async _deletePoll(id: number) {
    if (!confirm("Delete this poll and all votes?")) return;
    try {
      await this.#fetch(`${this._apiBase}/delete?id=${id}`, { method: "DELETE" });
      this._polls = this._polls.filter((p) => p.id !== id);
      if (this._selectedPollResults?.pollId === id) {
        this._selectedPollResults = null;
      }
    } catch (e) {
      this._error = `Delete failed: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  override render() {
    return html`
      <h1>Quick Poll</h1>
      <p class="description">
        Manage single-question polls, track votes, and view real-time results.
      </p>

      ${this._error
        ? html`<uui-box style="margin-bottom:16px">
            <p style="color:var(--uui-color-danger)">${this._error}</p>
          </uui-box>`
        : ""}

      <div class="toolbar">
        <uui-button
          look="secondary"
          label="Refresh"
          ?disabled=${this._loading}
          @click=${this._loadPolls}
        >${this._loading ? "Loading…" : "Refresh"}</uui-button>
      </div>

      <div class="section">
        <uui-box headline="Polls">
          ${this._polls.length > 0
            ? html`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Question</uui-table-head-cell>
                    <uui-table-head-cell>Status</uui-table-head-cell>
                    <uui-table-head-cell>Options</uui-table-head-cell>
                    <uui-table-head-cell>Created</uui-table-head-cell>
                    <uui-table-head-cell>Actions</uui-table-head-cell>
                  </uui-table-head>
                  ${this._polls.map(
                    (poll) => html`
                      <uui-table-row>
                        <uui-table-cell>${poll.question}</uui-table-cell>
                        <uui-table-cell>
                          <span class="badge ${poll.isActive ? "badge-active" : "badge-inactive"}">
                            ${poll.isActive ? "Active" : "Inactive"}
                          </span>
                        </uui-table-cell>
                        <uui-table-cell>${poll.options?.length ?? 0}</uui-table-cell>
                        <uui-table-cell>${new Date(poll.createdAt).toLocaleDateString()}</uui-table-cell>
                        <uui-table-cell>
                          <uui-button look="secondary" compact label="Results"
                            @click=${() => this._viewResults(poll.id)}>Results</uui-button>
                          <uui-button look="danger" compact label="Delete"
                            @click=${() => this._deletePoll(poll.id)}>Delete</uui-button>
                        </uui-table-cell>
                      </uui-table-row>
                    `
                  )}
                </uui-table>
              `
            : html`<div class="empty-state"><p>No polls found.</p></div>`}
        </uui-box>
      </div>

      ${this._selectedPollResults
        ? html`
            <div class="section">
              <uui-box headline="Results: ${this._selectedPollResults.question}">
                <p>Total votes: <strong>${this._selectedPollResults.totalVotes}</strong></p>
                ${this._selectedPollResults.options.map(
                  (opt) => html`
                    <div class="result-row">
                      <span class="option-label">${opt.optionText}</span>
                      <div class="result-bar-wrap">
                        <div class="result-bar" style="width:${opt.percentage}%"></div>
                      </div>
                      <span class="option-pct">${opt.percentage.toFixed(1)}% (${opt.voteCount})</span>
                    </div>
                  `
                )}
                <uui-button look="secondary" @click=${() => (this._selectedPollResults = null)}>
                  Close Results
                </uui-button>
              </uui-box>
            </div>
          `
        : ""}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "quick-poll-dashboard": QuickPollDashboardElement;
  }
}

import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface Survey {
  id: number;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
  expiresAt: string | null;
  responses: { length: number } | unknown[];
}

@customElement("surveys-dashboard")
export class SurveysDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    .dashboard-header {
      margin-bottom: var(--uui-size-layout-2, 32px);
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
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      color: var(--uui-color-text-alt);
      gap: 12px;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-published {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-draft {
      background: #fee2e2;
      color: #991b1b;
    }
  `;

  @state() private _surveys: Survey[] = [];
  @state() private _loading = false;
  @state() private _error: string | null = null;

  private readonly _apiBase = "/umbraco/api/surveys";

  override connectedCallback() {
    super.connectedCallback();
    this._loadSurveys();
  }

  private async _loadSurveys() {
    this._loading = true;
    this._error = null;
    try {
      const response = await this.#fetch(`${this._apiBase}/getall`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this._surveys = await response.json();
    } catch (e) {
      this._error = `Failed to load surveys: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._loading = false;
    }
  }

  private async _deleteSurvey(id: number) {
    if (!confirm("Delete this survey and all its responses?")) return;
    try {
      await this.#fetch(`${this._apiBase}/delete?id=${id}`, { method: "DELETE" });
      this._surveys = this._surveys.filter((s) => s.id !== id);
    } catch (e) {
      this._error = `Delete failed: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  private _getResponseCount(survey: Survey): number {
    if (!survey.responses) return 0;
    if (Array.isArray(survey.responses)) return survey.responses.length;
    return 0;
  }

  override render() {
    return html`
      <div class="dashboard-header">
        <h1>Surveys</h1>
        <p class="description">
          Build and manage surveys, collect responses, and view results from the Umbraco backoffice.
        </p>
      </div>

      <div class="toolbar">
        <uui-button
          look="secondary"
          label="Refresh"
          ?disabled=${this._loading}
          @click=${this._loadSurveys}
        >
          ${this._loading ? "Loading…" : "Refresh"}
        </uui-button>
      </div>

      ${this._error
        ? html`<uui-box>
            <p style="color:var(--uui-color-danger)">${this._error}</p>
          </uui-box>`
        : ""}

      <uui-box headline="Survey List">
        ${this._surveys.length > 0
          ? html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Title</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Responses</uui-table-head-cell>
                  <uui-table-head-cell>Created</uui-table-head-cell>
                  <uui-table-head-cell>Expires</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._surveys.map(
                  (survey) => html`
                    <uui-table-row>
                      <uui-table-cell>${survey.title}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${survey.isPublished ? "badge-published" : "badge-draft"}">
                          ${survey.isPublished ? "Published" : "Draft"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>${this._getResponseCount(survey)}</uui-table-cell>
                      <uui-table-cell>
                        ${new Date(survey.createdAt).toLocaleDateString()}
                      </uui-table-cell>
                      <uui-table-cell>
                        ${survey.expiresAt
                          ? new Date(survey.expiresAt).toLocaleDateString()
                          : "—"}
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button
                          look="danger"
                          label="Delete"
                          compact
                          @click=${() => this._deleteSurvey(survey.id)}
                        >Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>
            `
          : html`
              <div class="empty-state">
                <uui-icon name="document"></uui-icon>
                <p>No surveys found. Create your first survey via the API.</p>
              </div>
            `}
      </uui-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "surveys-dashboard": SurveysDashboardElement;
  }
}

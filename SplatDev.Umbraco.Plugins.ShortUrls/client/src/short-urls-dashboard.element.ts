import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

// NOTE: CRUD API endpoints under /umbraco/management/api/v1/short-urls are
// pending Phase 3 backend deployment. All mutating actions (create, edit,
// delete) are wired up in the UI but guarded behind an _apiAvailable flag.
// Short URLs follow the pattern /s/{randomCode} on the public site.

interface ShortUrl {
  id: string;
  shortCode: string;
  targetUrl: string;
  created: string;
}

type FormMode = "create" | "edit";

@customElement("short-urls-dashboard")
export class ShortUrlsDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .dashboard-header {
      margin-bottom: var(--uui-size-layout-2);
    }

    .dashboard-header h1 {
      margin: 0 0 var(--uui-size-4) 0;
      font-size: var(--uui-size-10);
      font-weight: 700;
      color: var(--uui-color-text);
    }

    .dashboard-header p {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-size-5);
    }

    .section {
      margin-bottom: var(--uui-size-layout-2);
    }

    .toolbar {
      display: flex;
      gap: var(--uui-size-4);
      align-items: center;
      margin-bottom: var(--uui-size-4);
      flex-wrap: wrap;
    }

    .toolbar uui-input {
      flex: 1;
      min-width: 240px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--uui-size-layout-3) var(--uui-size-layout-1);
      color: var(--uui-color-text-alt);
      gap: var(--uui-size-4);
    }

    .empty-state uui-icon {
      font-size: 3rem;
      opacity: 0.4;
    }

    .empty-state p {
      margin: 0;
      font-size: var(--uui-size-5);
    }

    uui-table {
      width: 100%;
    }

    uui-table-head-cell {
      font-weight: 600;
    }

    .action-cell {
      display: flex;
      gap: var(--uui-size-2);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-4);
      margin-bottom: var(--uui-size-4);
    }

    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    .form-actions {
      display: flex;
      gap: var(--uui-size-3);
      justify-content: flex-end;
    }

    .pending-notice {
      display: flex;
      align-items: flex-start;
      gap: var(--uui-size-3);
      font-size: var(--uui-size-5);
      color: var(--uui-color-text-alt);
      line-height: 1.6;
    }

    .pending-notice uui-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .short-url-chip {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-emphasis);
      padding: 2px 6px;
      border-radius: var(--uui-border-radius);
      font-size: 0.9em;
    }
  
    .splatdev-load-error {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0 0 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem;
      border-radius: 3px;
    }
  `;

  // Phase 3 BE: set this to true once backend CRUD endpoints are deployed.
  private readonly _apiAvailable = false;
  private readonly _apiBase = "/umbraco/management/api/v1/short-urls";

  @state()
  private _shortUrls: ShortUrl[] = [];

  @state()
  private _filter = "";

  @state()
  private _loading = false;

  @state()
  private _showForm = false;

  @state()
  private _formMode: FormMode = "create";

  @state()
  private _editingId: string | null = null;

  @state()
  private _formShortCode = "";

  @state()
  private _formTargetUrl = "";

  @state()
  private _formSaving = false;


  @state() private _loadError: string | null = null;

  private _handleFilterInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this._filter = input.value;
  }

  private async _load(): Promise<void> {
    // TODO (Phase 3 BE): Remove the guard below once the API is deployed.
    if (!this._apiAvailable) return;

    this._loading = true;
    try {
      const response = await this.#fetch(this._apiBase, {
        headers: { "Content-Type": "application/json" },
      });
      if (this.#responseOk(response)) {
        const data = (await response.json()) as ShortUrl[];
        this._shortUrls = data;
      }
    } catch (_err) {
      // Silently fail until Phase 3 BE is available.
    } finally {
      this._loading = false;
    }
  }

  private _openCreateForm(): void {
    this._formMode = "create";
    this._formShortCode = "";
    this._formTargetUrl = "";
    this._editingId = null;
    this._showForm = true;
  }

  private _openEditForm(entry: ShortUrl): void {
    this._formMode = "edit";
    this._formShortCode = entry.shortCode;
    this._formTargetUrl = entry.targetUrl;
    this._editingId = entry.id;
    this._showForm = true;
  }

  private _cancelForm(): void {
    this._showForm = false;
    this._editingId = null;
  }

  private async _saveForm(): Promise<void> {
    if (!this._formShortCode.trim() || !this._formTargetUrl.trim()) return;

    // TODO (Phase 3 BE): Remove the guard below once the API is deployed.
    if (!this._apiAvailable) {
      this._showForm = false;
      return;
    }

    this._formSaving = true;
    try {
      const payload = {
        shortCode: this._formShortCode.trim(),
        targetUrl: this._formTargetUrl.trim(),
      };

      const url =
        this._formMode === "edit" && this._editingId
          ? `${this._apiBase}/${this._editingId}`
          : this._apiBase;

      const method = this._formMode === "edit" ? "PUT" : "POST";

      const response = await this.#fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (this.#responseOk(response)) {
        await this._load();
        this._showForm = false;
      }
    } catch (_err) {
      // Silently fail until Phase 3 BE is available.
    } finally {
      this._formSaving = false;
    }
  }

  private async _delete(id: string): Promise<void> {
    // TODO (Phase 3 BE): Remove the guard below once the API is deployed.
    if (!this._apiAvailable) return;

    try {
      const response = await this.#fetch(`${this._apiBase}/${id}`, {
        method: "DELETE",
      });
      if (this.#responseOk(response)) {
        this._shortUrls = this._shortUrls.filter((s) => s.id !== id);
      }
    } catch (_err) {
      // Silently fail until Phase 3 BE is available.
    }
  }

  private get _filteredShortUrls(): ShortUrl[] {
    if (!this._filter.trim()) return this._shortUrls;
    const q = this._filter.toLowerCase();
    return this._shortUrls.filter(
      (s) =>
        s.shortCode.toLowerCase().includes(q) ||
        s.targetUrl.toLowerCase().includes(q)
    );
  }

  private _renderForm() {
    return html`
      <div class="section">
        <uui-box
          headline=${this._formMode === "create"
            ? "Create Short URL"
            : "Edit Short URL"}
        >
          <div class="form-grid">
            <uui-form-layout-item>
              <uui-label slot="label" for="shortCode">Short Code</uui-label>
              <uui-input
                id="shortCode"
                placeholder="e.g. abc123"
                label="Short code"
                .value=${this._formShortCode}
                @input=${(e: Event) => {
                  this._formShortCode = (e.target as HTMLInputElement).value;
                }}
              ></uui-input>
              <span slot="description">
                The URL will be accessible at <code>/s/{shortCode}</code>
              </span>
            </uui-form-layout-item>

            <uui-form-layout-item>
              <uui-label slot="label" for="targetUrl">Target URL</uui-label>
              <uui-input
                id="targetUrl"
                type="url"
                placeholder="https://example.com/some/long/path"
                label="Target URL"
                .value=${this._formTargetUrl}
                @input=${(e: Event) => {
                  this._formTargetUrl = (e.target as HTMLInputElement).value;
                }}
              ></uui-input>
              <span slot="description">
                The destination URL that visitors will be redirected to.
              </span>
            </uui-form-layout-item>
          </div>

          <div class="form-actions">
            <uui-button
              look="secondary"
              label="Cancel"
              @click=${this._cancelForm}
            >
              Cancel
            </uui-button>
            <uui-button
              look="primary"
              color="positive"
              label="Save"
              ?disabled=${this._formSaving ||
                !this._formShortCode.trim() ||
                !this._formTargetUrl.trim()}
              @click=${this._saveForm}
            >
              ${this._formSaving ? "Saving…" : "Save"}
            </uui-button>
          </div>
        </uui-box>
      </div>
    `;
  }

  /**
   * Guards a response and records why it failed.
   *
   * This used to be a bare `response.ok` check with no else branch, so a failed request
   * left the previous (usually empty) state on screen and read as "there is no data"
   * rather than "the request did not succeed".
   */
  #responseOk(response: Response): boolean {
    if (response.ok) {
      this._loadError = null;
      return true;
    }

    this._loadError =
      response.status === 401 || response.status === 403
        ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }


  override render() {
    const filtered = this._filteredShortUrls;

    return html`
      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : ""}
      <div class="dashboard-header">
        <h1>Short URLs</h1>
        <p>
          Manage short URL redirects. Each short URL follows the pattern
          <code>/s/{code}</code> and redirects visitors to the configured target
          URL.
        </p>
      </div>

      <div class="section">
        <uui-box headline="API Status">
          <div class="pending-notice">
            <uui-icon name="alert"></uui-icon>
            <span>
              The Short URLs CRUD API
              (<code>/umbraco/management/api/v1/short-urls</code>) will be
              available once the <strong>Phase 3 backend</strong> is deployed.
              The create, edit, and delete actions are ready in the UI and will
              become functional after the backend is in place.
            </span>
          </div>
        </uui-box>
      </div>

      ${this._showForm ? this._renderForm() : ""}

      <div class="section">
        <uui-box headline="Short URL List">
          <div class="toolbar">
            <uui-input
              type="search"
              placeholder="Search by short code or target URL…"
              label="Search short URLs"
              .value=${this._filter}
              @input=${this._handleFilterInput}
            ></uui-input>
            <uui-button
              look="primary"
              label="Create Short URL"
              ?disabled=${this._showForm}
              @click=${this._openCreateForm}
            >
              + Create Short URL
            </uui-button>
            <uui-button
              look="secondary"
              label="Refresh"
              ?disabled=${this._loading || !this._apiAvailable}
              @click=${this._load}
            >
              ${this._loading ? "Loading…" : "Refresh"}
            </uui-button>
          </div>

          ${filtered.length > 0
            ? html`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Short URL</uui-table-head-cell>
                    <uui-table-head-cell>Target URL</uui-table-head-cell>
                    <uui-table-head-cell>Created</uui-table-head-cell>
                    <uui-table-head-cell>Actions</uui-table-head-cell>
                  </uui-table-head>
                  ${filtered.map(
                    (entry) => html`
                      <uui-table-row>
                        <uui-table-cell>
                          <span class="short-url-chip"
                            >/s/${entry.shortCode}</span
                          >
                        </uui-table-cell>
                        <uui-table-cell>${entry.targetUrl}</uui-table-cell>
                        <uui-table-cell>${entry.created}</uui-table-cell>
                        <uui-table-cell>
                          <div class="action-cell">
                            <uui-button
                              look="secondary"
                              label="Edit"
                              @click=${() => this._openEditForm(entry)}
                            >
                              Edit
                            </uui-button>
                            <uui-button
                              look="secondary"
                              color="danger"
                              label="Delete"
                              @click=${() => this._delete(entry.id)}
                            >
                              Delete
                            </uui-button>
                          </div>
                        </uui-table-cell>
                      </uui-table-row>
                    `
                  )}
                </uui-table>
              `
            : html`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Short URL</uui-table-head-cell>
                    <uui-table-head-cell>Target URL</uui-table-head-cell>
                    <uui-table-head-cell>Created</uui-table-head-cell>
                    <uui-table-head-cell>Actions</uui-table-head-cell>
                  </uui-table-head>
                </uui-table>
                <div class="empty-state">
                  <uui-icon name="link"></uui-icon>
                  <p>No short URLs configured.</p>
                </div>
              `}
        </uui-box>
      </div>
    `;
  }
}

export default ShortUrlsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "short-urls-dashboard": ShortUrlsDashboardElement;
  }
}

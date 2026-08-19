import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface SearchField {
  [key: string]: unknown;
}

interface SearchResultItem {
  id: string;
  score: number;
  fields: SearchField;
}

interface SearchResults {
  totalItems: number;
  items: SearchResultItem[];
}

@customElement("examine-dashboard")
export class ExamineDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-layout-2, 24px);
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    .section-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 12px;
      padding: 0;
    }

    .section-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .results-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }

    .results-table th,
    .results-table td {
      border: 1px solid var(--uui-color-border, #e5e7eb);
      padding: 8px 12px;
      text-align: left;
      vertical-align: top;
      word-break: break-word;
    }

    .results-table th {
      background: var(--uui-color-surface-emphasis, #f3f4f6);
      font-weight: 600;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 24px;
    }

    .no-results {
      margin-top: 16px;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .page-size-input {
      width: 80px;
    }
  `;

  private _baseUrl = "/umbraco/api/examineextensions/";

  @state() private _indexes: string[] = [];
  @state() private _selectedIndex = "";
  @state() private _rebuildIndex = "";
  @state() private _query = "";
  @state() private _pageSize = 20;
  @state() private _results: SearchResults | null = null;
  @state() private _rebuildMsg = "";
  @state() private _loading = true;
  @state() private _searching = false;
  @state() private _rebuilding = false;
  @state() private _error = "";

  override connectedCallback() {
    super.connectedCallback();
    this._loadIndexes();
  }

  private async _loadIndexes() {
    this._loading = true;
    this._error = "";
    try {
      const resp = await this.#fetch(`${this._baseUrl}GetIndexes`);
      if (!resp.ok) throw new Error(await resp.text());
      this._indexes = (await resp.json()) as string[];
      if (this._indexes.length > 0) {
        this._selectedIndex = this._indexes[0];
        this._rebuildIndex = this._indexes[0];
      }
    } catch (e: unknown) {
      this._error = e instanceof Error ? e.message : "Failed to load indexes.";
    } finally {
      this._loading = false;
    }
  }

  private async _search() {
    if (!this._query.trim()) return;
    this._results = null;
    this._searching = true;
    this._error = "";
    try {
      const resp = await this.#fetch(`${this._baseUrl}Search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: this._query,
          indexName: this._selectedIndex,
          page: 1,
          pageSize: this._pageSize,
        }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      this._results = (await resp.json()) as SearchResults;
    } catch (e: unknown) {
      this._error = e instanceof Error ? e.message : "Search failed.";
    } finally {
      this._searching = false;
    }
  }

  private async _rebuild() {
    if (!this._rebuildIndex) return;
    this._rebuildMsg = "";
    this._rebuilding = true;
    this._error = "";
    try {
      const resp = await this.#fetch(`${this._baseUrl}RebuildIndex`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._rebuildIndex),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = (await resp.json()) as { success: boolean; message: string };
      this._rebuildMsg = data.message ?? "Done";
    } catch (e: unknown) {
      this._error = e instanceof Error ? e.message : "Rebuild failed.";
    } finally {
      this._rebuilding = false;
    }
  }

  private _handleQueryInput(e: Event) {
    this._query = (e.target as HTMLInputElement).value;
  }

  private _handlePageSizeInput(e: Event) {
    const v = parseInt((e.target as HTMLInputElement).value, 10);
    this._pageSize = isNaN(v) || v < 1 ? 1 : v > 100 ? 100 : v;
  }

  private _handleSelectedIndexChange(e: Event) {
    this._selectedIndex = (e.target as HTMLSelectElement).value;
  }

  private _handleRebuildIndexChange(e: Event) {
    this._rebuildIndex = (e.target as HTMLSelectElement).value;
  }

  private _handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      this._search();
    }
  }

  private _renderResults() {
    if (!this._results) return html``;

    return html`
      <div class="results-header">
        <h3 class="section-title">Results (${this._results.totalItems} total)</h3>
      </div>
      ${this._results.items.length === 0
        ? html`<p class="no-results">No results found.</p>`
        : html`
            <table class="results-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Score</th>
                  <th>Fields</th>
                </tr>
              </thead>
              <tbody>
                ${this._results.items.map(
                  (item) => html`
                    <tr>
                      <td>${item.id}</td>
                      <td>${item.score.toFixed(4)}</td>
                      <td>
                        ${Object.entries(item.fields).map(
                          ([k, v]) => html`<strong>${k}</strong>: ${String(v)}<br />`
                        )}
                      </td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
          `}
    `;
  }

  override render() {
    if (this._loading) {
      return html`<uui-loader></uui-loader>`;
    }

    const indexOptions = this._indexes.map((i) => ({ name: i, value: i }));

    return html`
      <uui-box headline="Examine Extensions">
        ${this._error
          ? html`<uui-alert look="danger" style="margin-bottom:16px;">${this._error}</uui-alert>`
          : ""}

        <div class="dashboard-grid">
          <div>
            <h3 class="section-title">Search</h3>
            <div class="section-form">
              <uui-form-layout-item>
                <uui-label slot="label">Query</uui-label>
                <uui-input
                  .value=${this._query}
                  @input=${this._handleQueryInput}
                  @keydown=${this._handleSearchKeyDown}
                  placeholder="Enter search query..."
                ></uui-input>
              </uui-form-layout-item>
              <uui-form-layout-item>
                <uui-label slot="label">Index</uui-label>
                <uui-select
                  .options=${indexOptions}
                  .value=${this._selectedIndex}
                  @change=${this._handleSelectedIndexChange}
                ></uui-select>
              </uui-form-layout-item>
              <uui-form-layout-item>
                <uui-label slot="label">Page Size</uui-label>
                <uui-input
                  class="page-size-input"
                  type="number"
                  min="1"
                  max="100"
                  .value=${String(this._pageSize)}
                  @input=${this._handlePageSizeInput}
                ></uui-input>
              </uui-form-layout-item>
              <uui-button
                look="primary"
                label="Search"
                @click=${this._search}
                ?disabled=${this._searching || !this._query.trim()}
              >
                ${this._searching ? "Searching..." : "Search"}
              </uui-button>
            </div>
          </div>

          <div>
            <h3 class="section-title">Index Management</h3>
            <div class="section-form">
              <uui-form-layout-item>
                <uui-label slot="label">Index to Rebuild</uui-label>
                <uui-select
                  .options=${indexOptions}
                  .value=${this._rebuildIndex}
                  @change=${this._handleRebuildIndexChange}
                ></uui-select>
              </uui-form-layout-item>
              <div class="section-controls">
                <uui-button
                  look="warning"
                  label="Rebuild Index"
                  @click=${this._rebuild}
                  ?disabled=${this._rebuilding || !this._rebuildIndex}
                >
                  ${this._rebuilding ? "Rebuilding..." : "Rebuild Index"}
                </uui-button>
                ${this._rebuildMsg
                  ? html`<uui-badge color="positive">${this._rebuildMsg}</uui-badge>`
                  : ""}
              </div>
            </div>
          </div>
        </div>

        ${this._renderResults()}
      </uui-box>
    `;
  }
}

export default ExamineDashboardElement;

import { LitElement as h, html as a, css as c, state as r, customElement as p } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as _ } from "@umbraco-cms/backoffice/element-api";
var b = Object.defineProperty, g = Object.getOwnPropertyDescriptor, s = (e, t, n, u) => {
  for (var l = u > 1 ? void 0 : u ? g(t, n) : t, o = e.length - 1, d; o >= 0; o--)
    (d = e[o]) && (l = (u ? d(t, n, l) : d(l)) || l);
  return u && l && b(t, n, l), l;
};
let i = class extends _(h) {
  constructor() {
    super(...arguments), this._baseUrl = "/umbraco/api/examineextensions/", this._indexes = [], this._selectedIndex = "", this._rebuildIndex = "", this._query = "", this._pageSize = 20, this._results = null, this._rebuildMsg = "", this._loading = !0, this._searching = !1, this._rebuilding = !1, this._error = "";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadIndexes();
  }
  async _loadIndexes() {
    this._loading = !0, this._error = "";
    try {
      const e = await fetch(`${this._baseUrl}GetIndexes`);
      if (!e.ok) throw new Error(await e.text());
      this._indexes = await e.json(), this._indexes.length > 0 && (this._selectedIndex = this._indexes[0], this._rebuildIndex = this._indexes[0]);
    } catch (e) {
      this._error = e instanceof Error ? e.message : "Failed to load indexes.";
    } finally {
      this._loading = !1;
    }
  }
  async _search() {
    if (this._query.trim()) {
      this._results = null, this._searching = !0, this._error = "";
      try {
        const e = await fetch(`${this._baseUrl}Search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: this._query,
            indexName: this._selectedIndex,
            page: 1,
            pageSize: this._pageSize
          })
        });
        if (!e.ok) throw new Error(await e.text());
        this._results = await e.json();
      } catch (e) {
        this._error = e instanceof Error ? e.message : "Search failed.";
      } finally {
        this._searching = !1;
      }
    }
  }
  async _rebuild() {
    if (this._rebuildIndex) {
      this._rebuildMsg = "", this._rebuilding = !0, this._error = "";
      try {
        const e = await fetch(`${this._baseUrl}RebuildIndex`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this._rebuildIndex)
        });
        if (!e.ok) throw new Error(await e.text());
        const t = await e.json();
        this._rebuildMsg = t.message ?? "Done";
      } catch (e) {
        this._error = e instanceof Error ? e.message : "Rebuild failed.";
      } finally {
        this._rebuilding = !1;
      }
    }
  }
  _handleQueryInput(e) {
    this._query = e.target.value;
  }
  _handlePageSizeInput(e) {
    const t = parseInt(e.target.value, 10);
    this._pageSize = isNaN(t) || t < 1 ? 1 : t > 100 ? 100 : t;
  }
  _handleSelectedIndexChange(e) {
    this._selectedIndex = e.target.value;
  }
  _handleRebuildIndexChange(e) {
    this._rebuildIndex = e.target.value;
  }
  _handleSearchKeyDown(e) {
    e.key === "Enter" && this._search();
  }
  _renderResults() {
    return this._results ? a`
      <div class="results-header">
        <h3 class="section-title">Results (${this._results.totalItems} total)</h3>
      </div>
      ${this._results.items.length === 0 ? a`<p class="no-results">No results found.</p>` : a`
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
      (e) => a`
                    <tr>
                      <td>${e.id}</td>
                      <td>${e.score.toFixed(4)}</td>
                      <td>
                        ${Object.entries(e.fields).map(
        ([t, n]) => a`<strong>${t}</strong>: ${String(n)}<br />`
      )}
                      </td>
                    </tr>
                  `
    )}
              </tbody>
            </table>
          `}
    ` : a``;
  }
  render() {
    if (this._loading)
      return a`<uui-loader></uui-loader>`;
    const e = this._indexes.map((t) => ({ name: t, value: t }));
    return a`
      <uui-box headline="Examine Extensions">
        ${this._error ? a`<uui-alert look="danger" style="margin-bottom:16px;">${this._error}</uui-alert>` : ""}

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
                  .options=${e}
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
                  .options=${e}
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
                ${this._rebuildMsg ? a`<uui-badge color="positive">${this._rebuildMsg}</uui-badge>` : ""}
              </div>
            </div>
          </div>
        </div>

        ${this._renderResults()}
      </uui-box>
    `;
  }
};
i.styles = c`
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
s([
  r()
], i.prototype, "_indexes", 2);
s([
  r()
], i.prototype, "_selectedIndex", 2);
s([
  r()
], i.prototype, "_rebuildIndex", 2);
s([
  r()
], i.prototype, "_query", 2);
s([
  r()
], i.prototype, "_pageSize", 2);
s([
  r()
], i.prototype, "_results", 2);
s([
  r()
], i.prototype, "_rebuildMsg", 2);
s([
  r()
], i.prototype, "_loading", 2);
s([
  r()
], i.prototype, "_searching", 2);
s([
  r()
], i.prototype, "_rebuilding", 2);
s([
  r()
], i.prototype, "_error", 2);
i = s([
  p("examine-dashboard")
], i);
const f = i;
export {
  i as ExamineDashboardElement,
  f as default
};

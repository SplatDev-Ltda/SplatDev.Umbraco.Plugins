import { LitElement as _, html as u, css as b, state as l, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as f } from "@umbraco-cms/backoffice/auth";
function y(e) {
  let t = null;
  const a = new Promise((n) => {
    e.consumeContext(f, async (i) => {
      var o;
      try {
        t = await ((o = i == null ? void 0 : i.getLatestToken) == null ? void 0 : o.call(i)) ?? null;
      } catch {
        t = null;
      }
      n();
    }), setTimeout(n, 3e3);
  });
  return async (n, i = {}) => {
    await a;
    const o = new Headers(i.headers);
    t && !o.has("Authorization") && o.set("Authorization", `Bearer ${t}`);
    const d = await fetch(n, { ...i, credentials: "same-origin", headers: o });
    return (d.status === 401 || d.status === 403) && console.error(
      `[SplatDev] ${d.status} from ${String(n)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), d;
  };
}
var x = Object.defineProperty, v = Object.getOwnPropertyDescriptor, p = (e) => {
  throw TypeError(e);
}, r = (e, t, a, n) => {
  for (var i = n > 1 ? void 0 : n ? v(t, a) : t, o = e.length - 1, d; o >= 0; o--)
    (d = e[o]) && (i = (n ? d(t, a, i) : d(i)) || i);
  return n && i && x(t, a, i), i;
}, w = (e, t, a) => t.has(e) || p("Cannot " + a), c = (e, t, a) => (w(e, t, "read from private field"), a ? a.call(e) : t.get(e)), $ = (e, t, a) => t.has(e) ? p("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), h;
let s = class extends m(_) {
  constructor() {
    super(...arguments), $(this, h, y(this)), this._baseUrl = "/umbraco/api/examineextensions/", this._indexes = [], this._selectedIndex = "", this._rebuildIndex = "", this._query = "", this._pageSize = 20, this._results = null, this._rebuildMsg = "", this._loading = !0, this._searching = !1, this._rebuilding = !1, this._error = "";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadIndexes();
  }
  async _loadIndexes() {
    this._loading = !0, this._error = "";
    try {
      const e = await c(this, h).call(this, `${this._baseUrl}GetIndexes`);
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
        const e = await c(this, h).call(this, `${this._baseUrl}Search`, {
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
        const e = await c(this, h).call(this, `${this._baseUrl}RebuildIndex`, {
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
    return this._results ? u`
      <div class="results-header">
        <h3 class="section-title">Results (${this._results.totalItems} total)</h3>
      </div>
      ${this._results.items.length === 0 ? u`<p class="no-results">No results found.</p>` : u`
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
      (e) => u`
                    <tr>
                      <td>${e.id}</td>
                      <td>${e.score.toFixed(4)}</td>
                      <td>
                        ${Object.entries(e.fields).map(
        ([t, a]) => u`<strong>${t}</strong>: ${String(a)}<br />`
      )}
                      </td>
                    </tr>
                  `
    )}
              </tbody>
            </table>
          `}
    ` : u``;
  }
  render() {
    if (this._loading)
      return u`<uui-loader></uui-loader>`;
    const e = this._indexes.map((t) => ({ name: t, value: t }));
    return u`
      <uui-box headline="Examine Extensions">
        ${this._error ? u`<uui-alert look="danger" style="margin-bottom:16px;">${this._error}</uui-alert>` : ""}

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
                ${this._rebuildMsg ? u`<uui-badge color="positive">${this._rebuildMsg}</uui-badge>` : ""}
              </div>
            </div>
          </div>
        </div>

        ${this._renderResults()}
      </uui-box>
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
s.styles = b`
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
r([
  l()
], s.prototype, "_indexes", 2);
r([
  l()
], s.prototype, "_selectedIndex", 2);
r([
  l()
], s.prototype, "_rebuildIndex", 2);
r([
  l()
], s.prototype, "_query", 2);
r([
  l()
], s.prototype, "_pageSize", 2);
r([
  l()
], s.prototype, "_results", 2);
r([
  l()
], s.prototype, "_rebuildMsg", 2);
r([
  l()
], s.prototype, "_loading", 2);
r([
  l()
], s.prototype, "_searching", 2);
r([
  l()
], s.prototype, "_rebuilding", 2);
r([
  l()
], s.prototype, "_error", 2);
s = r([
  g("examine-dashboard")
], s);
const k = s;
export {
  s as ExamineDashboardElement,
  k as default
};

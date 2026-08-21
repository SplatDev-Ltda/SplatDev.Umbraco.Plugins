import { LitElement as y, html as o, css as x, state as n, customElement as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as w } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as $ } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as I } from "@umbraco-cms/backoffice/notification";
function S(e) {
  let t = null, i = null;
  const d = e.consumeContext.bind(e), u = new Promise((l) => {
    d($, async (a) => {
      var c;
      try {
        t = await ((c = a == null ? void 0 : a.getLatestToken) == null ? void 0 : c.call(a)) ?? null;
      } catch {
        t = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return d(I, (l) => {
    i = l;
  }), async (l, a = {}) => {
    await u;
    const c = new Headers(a.headers);
    t && !c.has("Authorization") && c.set("Authorization", `Bearer ${t}`);
    const h = await fetch(l, { ...a, credentials: "same-origin", headers: c });
    if (!h.ok) {
      const b = h.status === 401 || h.status === 403, f = b ? "Not authorised" : "Could not load data", g = b ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${h.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${h.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${h.status} from ${String(l)} — ${g}`), i == null || i.peek("danger", { data: { headline: f, message: g } });
    }
    return h;
  };
}
var E = Object.defineProperty, k = Object.getOwnPropertyDescriptor, m = (e) => {
  throw TypeError(e);
}, r = (e, t, i, d) => {
  for (var u = d > 1 ? void 0 : d ? k(t, i) : t, l = e.length - 1, a; l >= 0; l--)
    (a = e[l]) && (u = (d ? a(t, i, u) : a(u)) || u);
  return d && u && E(t, i, u), u;
}, C = (e, t, i) => t.has(e) || m("Cannot " + i), _ = (e, t, i) => (C(e, t, "read from private field"), i ? i.call(e) : t.get(e)), z = (e, t, i) => t.has(e) ? m("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), p;
let s = class extends w(y) {
  constructor() {
    super(...arguments), z(this, p, S(this)), this._baseUrl = "/umbraco/api/examineextensions/", this._indexes = [], this._selectedIndex = "", this._rebuildIndex = "", this._query = "", this._pageSize = 20, this._results = null, this._rebuildMsg = "", this._loading = !0, this._searching = !1, this._rebuilding = !1, this._error = "";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadIndexes();
  }
  async _loadIndexes() {
    this._loading = !0, this._error = "";
    try {
      const e = await _(this, p).call(this, `${this._baseUrl}GetIndexes`);
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
        const e = await _(this, p).call(this, `${this._baseUrl}Search`, {
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
        const e = await _(this, p).call(this, `${this._baseUrl}RebuildIndex`, {
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
    return this._results ? o`
      <div class="results-header">
        <h3 class="section-title">Results (${this._results.totalItems} total)</h3>
      </div>
      ${this._results.items.length === 0 ? o`<p class="no-results">No results found.</p>` : o`
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
      (e) => o`
                    <tr>
                      <td>${e.id}</td>
                      <td>${e.score.toFixed(4)}</td>
                      <td>
                        ${Object.entries(e.fields).map(
        ([t, i]) => o`<strong>${t}</strong>: ${String(i)}<br />`
      )}
                      </td>
                    </tr>
                  `
    )}
              </tbody>
            </table>
          `}
    ` : o``;
  }
  render() {
    if (this._loading)
      return o`<uui-loader></uui-loader>`;
    const e = this._indexes.map((t) => ({ name: t, value: t }));
    return o`
      <uui-box headline="Examine Extensions">
        ${this._error ? o`<uui-alert look="danger" style="margin-bottom:16px;">${this._error}</uui-alert>` : ""}

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
                ${this._rebuildMsg ? o`<uui-badge color="positive">${this._rebuildMsg}</uui-badge>` : ""}
              </div>
            </div>
          </div>
        </div>

        ${this._renderResults()}
      </uui-box>
    `;
  }
};
p = /* @__PURE__ */ new WeakMap();
s.styles = x`
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
  n()
], s.prototype, "_indexes", 2);
r([
  n()
], s.prototype, "_selectedIndex", 2);
r([
  n()
], s.prototype, "_rebuildIndex", 2);
r([
  n()
], s.prototype, "_query", 2);
r([
  n()
], s.prototype, "_pageSize", 2);
r([
  n()
], s.prototype, "_results", 2);
r([
  n()
], s.prototype, "_rebuildMsg", 2);
r([
  n()
], s.prototype, "_loading", 2);
r([
  n()
], s.prototype, "_searching", 2);
r([
  n()
], s.prototype, "_rebuilding", 2);
r([
  n()
], s.prototype, "_error", 2);
s = r([
  v("examine-dashboard")
], s);
const N = s;
export {
  s as ExamineDashboardElement,
  N as default
};

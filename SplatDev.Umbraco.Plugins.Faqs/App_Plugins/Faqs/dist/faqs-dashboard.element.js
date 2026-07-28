import { LitElement as b, html as t, nothing as n, css as d, state as r, customElement as p } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
var m = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, l = (e, a, i, o) => {
  for (var u = o > 1 ? void 0 : o ? _(a, i) : a, c = e.length - 1, h; c >= 0; c--)
    (h = e[c]) && (u = (o ? h(a, i, u) : h(u)) || u);
  return o && u && m(a, i, u), u;
};
let s = class extends g(b) {
  constructor() {
    super(...arguments), this._activeTab = "overview", this._categories = [], this._allItems = [], this._totalItems = 0, this._searchQuery = "", this._searchResults = [], this._loading = !1, this._apiBase = "/umbraco/api/faqs";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadData();
  }
  async _loadData() {
    this._loading = !0;
    try {
      const [e, a] = await Promise.all([
        fetch(`${this._apiBase}/GetCategories?publishedOnly=false`),
        fetch(`${this._apiBase}/GetItems?publishedOnly=false`)
      ]);
      if (e.ok && (this._categories = await e.json()), a.ok) {
        const i = await a.json();
        this._allItems = i.items ?? [], this._totalItems = i.total ?? 0;
      }
    } catch {
      this._categories = [], this._allItems = [];
    } finally {
      this._loading = !1;
    }
  }
  async _search() {
    if (!this._searchQuery.trim()) {
      this._searchResults = [];
      return;
    }
    try {
      const e = await fetch(
        `${this._apiBase}/Search?q=${encodeURIComponent(this._searchQuery)}&publishedOnly=false`
      );
      e.ok && (this._searchResults = await e.json(), this._activeTab = "search");
    } catch {
      this._searchResults = [];
    }
  }
  async _togglePublish(e) {
    await fetch(`${this._apiBase}/PublishItem?id=${e.id}&publish=${!e.isPublished}`, {
      method: "POST"
    }), e.isPublished = !e.isPublished, this.requestUpdate();
  }
  async _deleteItem(e) {
    confirm("Delete this FAQ item?") && (await fetch(`${this._apiBase}/DeleteItem?id=${e}`, { method: "DELETE" }), this._allItems = this._allItems.filter((a) => a.id !== e), this._totalItems--, this.requestUpdate());
  }
  async _deleteCategory(e) {
    confirm("Delete this category and all its FAQ items?") && (await fetch(`${this._apiBase}/DeleteCategory?categoryId=${e}`, { method: "DELETE" }), await this._loadData());
  }
  _getCategoryName(e) {
    var a;
    return ((a = this._categories.find((i) => i.id === e)) == null ? void 0 : a.name) ?? "—";
  }
  _handleSearchInput(e) {
    this._searchQuery = e.target.value;
  }
  async _handleSearchKey(e) {
    e.key === "Enter" && await this._search();
  }
  _renderOverviewTab() {
    return this._loading ? t`<p>Loading...</p>` : t`
      <div class="stats-grid">
        <uui-box>
          <p class="stat-label">Categories</p>
          <p class="stat-value">${this._categories.length}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Total FAQs</p>
          <p class="stat-value">${this._totalItems}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Published</p>
          <p class="stat-value">${this._allItems.filter((e) => e.isPublished).length}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Unpublished</p>
          <p class="stat-value">${this._allItems.filter((e) => !e.isPublished).length}</p>
        </uui-box>
      </div>

      <!-- Accordion preview grouped by category -->
      <uui-box headline="FAQ Preview (accordion)">
        ${this._categories.length === 0 ? t`<p class="empty">No categories or FAQs yet.</p>` : this._categories.map((e) => {
      const a = this._allItems.filter((i) => i.categoryId === e.id && i.isPublished);
      return a.length === 0 ? n : t`
                <div class="accordion-section">
                  <h3>${e.name}</h3>
                  ${a.map(
        (i) => t`
                      <details class="faq-item">
                        <summary class="faq-question">
                          <span>${i.question}</span>
                          <span>&rsaquo;</span>
                        </summary>
                        <div class="faq-answer">${i.answer}</div>
                      </details>
                    `
      )}
                </div>
              `;
    })}
      </uui-box>
    `;
  }
  _renderItemsTab() {
    return this._loading ? t`<p>Loading...</p>` : t`
      <uui-box headline="All FAQ Items (${this._totalItems})">
        ${this._allItems.length === 0 ? t`<p class="empty">No FAQ items found.</p>` : t`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Question</uui-table-head-cell>
                  <uui-table-head-cell>Category</uui-table-head-cell>
                  <uui-table-head-cell>Sort</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._allItems.map(
      (e) => t`
                    <uui-table-row>
                      <uui-table-cell style="max-width: 400px;">
                        <strong>${e.question}</strong>
                      </uui-table-cell>
                      <uui-table-cell>${this._getCategoryName(e.categoryId)}</uui-table-cell>
                      <uui-table-cell>${e.sortOrder}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${e.isPublished ? "published" : "unpublished"}">
                          ${e.isPublished ? "Published" : "Unpublished"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button
                          look="secondary"
                          label="${e.isPublished ? "Unpublish" : "Publish"}"
                          @click=${() => this._togglePublish(e)}
                        >${e.isPublished ? "Unpublish" : "Publish"}</uui-button>
                        <uui-button
                          look="danger"
                          label="Delete"
                          @click=${() => this._deleteItem(e.id)}
                        >Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
  _renderCategoriesTab() {
    return this._loading ? t`<p>Loading...</p>` : t`
      <uui-box headline="Categories (${this._categories.length})">
        ${this._categories.length === 0 ? t`<p class="empty">No categories found.</p>` : t`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Slug</uui-table-head-cell>
                  <uui-table-head-cell>Sort Order</uui-table-head-cell>
                  <uui-table-head-cell>Items</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._categories.map(
      (e) => t`
                    <uui-table-row>
                      <uui-table-cell><strong>${e.name}</strong></uui-table-cell>
                      <uui-table-cell><code>${e.slug}</code></uui-table-cell>
                      <uui-table-cell>${e.sortOrder}</uui-table-cell>
                      <uui-table-cell>
                        ${this._allItems.filter((a) => a.categoryId === e.id).length}
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button
                          look="danger"
                          label="Delete Category"
                          @click=${() => this._deleteCategory(e.id)}
                        >Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
  _renderSearchTab() {
    return t`
      <p class="search-result-count">
        ${this._searchResults.length} result${this._searchResults.length !== 1 ? "s" : ""}
        for <strong>"${this._searchQuery}"</strong>
      </p>

      ${this._searchResults.length === 0 ? t`<p class="empty">No FAQ items match your search.</p>` : t`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Question</uui-table-head-cell>
                <uui-table-head-cell>Category</uui-table-head-cell>
                <uui-table-head-cell>Status</uui-table-head-cell>
              </uui-table-head>
              ${this._searchResults.map(
      (e) => t`
                  <uui-table-row>
                    <uui-table-cell>${e.question}</uui-table-cell>
                    <uui-table-cell>${this._getCategoryName(e.categoryId)}</uui-table-cell>
                    <uui-table-cell>
                      <span class="badge ${e.isPublished ? "published" : "unpublished"}">
                        ${e.isPublished ? "Published" : "Unpublished"}
                      </span>
                    </uui-table-cell>
                  </uui-table-row>
                `
    )}
            </uui-table>
          `}
    `;
  }
  render() {
    return t`
      <h1>FAQs Manager</h1>
      <p class="description">
        Manage frequently asked questions, categories and accordion display from the Umbraco backoffice.
      </p>

      <div class="search-bar">
        <uui-input
          type="search"
          placeholder="Search FAQs..."
          label="Search FAQs"
          .value=${this._searchQuery}
          @input=${this._handleSearchInput}
          @keydown=${this._handleSearchKey}
        ></uui-input>
        <uui-button look="secondary" label="Search" @click=${this._search}>Search</uui-button>
      </div>

      <uui-tab-group>
        <uui-tab
          label="Overview"
          ?active=${this._activeTab === "overview"}
          @click=${() => this._activeTab = "overview"}
        >Overview</uui-tab>
        <uui-tab
          label="All Items"
          ?active=${this._activeTab === "items"}
          @click=${() => this._activeTab = "items"}
        >All Items (${this._totalItems})</uui-tab>
        <uui-tab
          label="Categories"
          ?active=${this._activeTab === "categories"}
          @click=${() => this._activeTab = "categories"}
        >Categories</uui-tab>
        ${this._searchResults.length > 0 || this._activeTab === "search" ? t`
              <uui-tab
                label="Search Results"
                ?active=${this._activeTab === "search"}
                @click=${() => this._activeTab = "search"}
              >Search Results</uui-tab>
            ` : n}
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "overview" ? this._renderOverviewTab() : this._activeTab === "items" ? this._renderItemsTab() : this._activeTab === "categories" ? this._renderCategoriesTab() : this._renderSearchTab()}
      </div>
    `;
  }
};
s.styles = d`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 var(--uui-size-space-3, 8px);
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 var(--uui-size-space-6, 24px);
    }

    uui-tab-group {
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .tab-content {
      margin-top: var(--uui-size-space-5, 16px);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--uui-size-space-4, 12px);
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 4px;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .search-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .search-bar uui-input {
      flex: 1;
      max-width: 400px;
    }

    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge.published { background: #d1fae5; color: #065f46; }
    .badge.unpublished { background: #fef3c7; color: #92400e; }

    .accordion-section {
      margin-bottom: 24px;
    }

    .accordion-section h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 8px;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--uui-color-border, #e5e7eb);
    }

    details.faq-item {
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 6px;
      margin-bottom: 4px;
      overflow: hidden;
    }

    details.faq-item[open] {
      border-color: #3b82f6;
    }

    summary.faq-question {
      padding: 12px 16px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      justify-content: space-between;
      align-items: center;
      list-style: none;
      gap: 8px;
    }

    summary.faq-question::-webkit-details-marker {
      display: none;
    }

    details[open] summary.faq-question {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .faq-answer {
      padding: 0 16px 12px;
      font-size: 0.9rem;
      color: var(--uui-color-text, #374151);
      border-top: 1px solid var(--uui-color-border, #e5e7eb);
    }

    uui-table { width: 100%; }

    .empty {
      color: var(--uui-color-text-alt, #6b7280);
      padding: 24px 0;
    }

    .search-result-count {
      font-size: 0.875rem;
      color: var(--uui-color-text-alt, #6b7280);
      margin-bottom: 12px;
    }
  `;
l([
  r()
], s.prototype, "_activeTab", 2);
l([
  r()
], s.prototype, "_categories", 2);
l([
  r()
], s.prototype, "_allItems", 2);
l([
  r()
], s.prototype, "_totalItems", 2);
l([
  r()
], s.prototype, "_searchQuery", 2);
l([
  r()
], s.prototype, "_searchResults", 2);
l([
  r()
], s.prototype, "_loading", 2);
s = l([
  p("faqs-dashboard")
], s);
const y = s;
export {
  s as FaqsDashboardElement,
  y as default
};

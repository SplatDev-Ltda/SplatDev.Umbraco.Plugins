import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface FaqCategory {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  items: FaqItem[];
}

interface FaqItem {
  id: number;
  categoryId: number;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
  category?: FaqCategory;
}

@customElement("faqs-dashboard")
export class FaqsDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
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

  @state() private _activeTab: string = "overview";
  @state() private _categories: FaqCategory[] = [];
  @state() private _allItems: FaqItem[] = [];
  @state() private _totalItems: number = 0;
  @state() private _searchQuery: string = "";
  @state() private _searchResults: FaqItem[] = [];
  @state() private _loading: boolean = false;

  private readonly _apiBase = "/umbraco/api/faqs";

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadData();
  }

  private async _loadData(): Promise<void> {
    this._loading = true;
    try {
      const [catResp, itemResp] = await Promise.all([
        this.#fetch(`${this._apiBase}/GetCategories?publishedOnly=false`),
        this.#fetch(`${this._apiBase}/GetItems?publishedOnly=false`),
      ]);

      if (catResp.ok) this._categories = await catResp.json();
      if (itemResp.ok) {
        const data = await itemResp.json();
        this._allItems = data.items ?? [];
        this._totalItems = data.total ?? 0;
      }
    } catch {
      this._categories = [];
      this._allItems = [];
    } finally {
      this._loading = false;
    }
  }

  private async _search(): Promise<void> {
    if (!this._searchQuery.trim()) {
      this._searchResults = [];
      return;
    }
    try {
      const response = await this.#fetch(
        `${this._apiBase}/Search?q=${encodeURIComponent(this._searchQuery)}&publishedOnly=false`
      );
      if (response.ok) {
        this._searchResults = await response.json();
        this._activeTab = "search";
      }
    } catch {
      this._searchResults = [];
    }
  }

  private async _togglePublish(item: FaqItem): Promise<void> {
    await this.#fetch(`${this._apiBase}/PublishItem?id=${item.id}&publish=${!item.isPublished}`, {
      method: "POST",
    });
    item.isPublished = !item.isPublished;
    this.requestUpdate();
  }

  private async _deleteItem(id: number): Promise<void> {
    if (!confirm("Delete this FAQ item?")) return;
    await this.#fetch(`${this._apiBase}/DeleteItem?id=${id}`, { method: "DELETE" });
    this._allItems = this._allItems.filter((i) => i.id !== id);
    this._totalItems--;
    this.requestUpdate();
  }

  private async _deleteCategory(categoryId: number): Promise<void> {
    if (!confirm("Delete this category and all its FAQ items?")) return;
    await this.#fetch(`${this._apiBase}/DeleteCategory?categoryId=${categoryId}`, { method: "DELETE" });
    await this._loadData();
  }

  private _getCategoryName(categoryId: number): string {
    return this._categories.find((c) => c.id === categoryId)?.name ?? "—";
  }

  private _handleSearchInput(e: Event): void {
    this._searchQuery = (e.target as HTMLInputElement).value;
  }

  private async _handleSearchKey(e: KeyboardEvent): Promise<void> {
    if (e.key === "Enter") await this._search();
  }

  private _renderOverviewTab() {
    if (this._loading) return html`<p>Loading...</p>`;

    return html`
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
          <p class="stat-value">${this._allItems.filter((i) => i.isPublished).length}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Unpublished</p>
          <p class="stat-value">${this._allItems.filter((i) => !i.isPublished).length}</p>
        </uui-box>
      </div>

      <!-- Accordion preview grouped by category -->
      <uui-box headline="FAQ Preview (accordion)">
        ${this._categories.length === 0
          ? html`<p class="empty">No categories or FAQs yet.</p>`
          : this._categories.map((cat) => {
              const items = this._allItems.filter((i) => i.categoryId === cat.id && i.isPublished);
              if (items.length === 0) return nothing;
              return html`
                <div class="accordion-section">
                  <h3>${cat.name}</h3>
                  ${items.map(
                    (item) => html`
                      <details class="faq-item">
                        <summary class="faq-question">
                          <span>${item.question}</span>
                          <span>&rsaquo;</span>
                        </summary>
                        <div class="faq-answer">${item.answer}</div>
                      </details>
                    `
                  )}
                </div>
              `;
            })}
      </uui-box>
    `;
  }

  private _renderItemsTab() {
    if (this._loading) return html`<p>Loading...</p>`;

    return html`
      <uui-box headline="All FAQ Items (${this._totalItems})">
        ${this._allItems.length === 0
          ? html`<p class="empty">No FAQ items found.</p>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Question</uui-table-head-cell>
                  <uui-table-head-cell>Category</uui-table-head-cell>
                  <uui-table-head-cell>Sort</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._allItems.map(
                  (item) => html`
                    <uui-table-row>
                      <uui-table-cell style="max-width: 400px;">
                        <strong>${item.question}</strong>
                      </uui-table-cell>
                      <uui-table-cell>${this._getCategoryName(item.categoryId)}</uui-table-cell>
                      <uui-table-cell>${item.sortOrder}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${item.isPublished ? "published" : "unpublished"}">
                          ${item.isPublished ? "Published" : "Unpublished"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button
                          look="secondary"
                          label="${item.isPublished ? "Unpublish" : "Publish"}"
                          @click=${() => this._togglePublish(item)}
                        >${item.isPublished ? "Unpublish" : "Publish"}</uui-button>
                        <uui-button
                          look="danger"
                          label="Delete"
                          @click=${() => this._deleteItem(item.id)}
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

  private _renderCategoriesTab() {
    if (this._loading) return html`<p>Loading...</p>`;

    return html`
      <uui-box headline="Categories (${this._categories.length})">
        ${this._categories.length === 0
          ? html`<p class="empty">No categories found.</p>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Slug</uui-table-head-cell>
                  <uui-table-head-cell>Sort Order</uui-table-head-cell>
                  <uui-table-head-cell>Items</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._categories.map(
                  (cat) => html`
                    <uui-table-row>
                      <uui-table-cell><strong>${cat.name}</strong></uui-table-cell>
                      <uui-table-cell><code>${cat.slug}</code></uui-table-cell>
                      <uui-table-cell>${cat.sortOrder}</uui-table-cell>
                      <uui-table-cell>
                        ${this._allItems.filter((i) => i.categoryId === cat.id).length}
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button
                          look="danger"
                          label="Delete Category"
                          @click=${() => this._deleteCategory(cat.id)}
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

  private _renderSearchTab() {
    return html`
      <p class="search-result-count">
        ${this._searchResults.length} result${this._searchResults.length !== 1 ? "s" : ""}
        for <strong>"${this._searchQuery}"</strong>
      </p>

      ${this._searchResults.length === 0
        ? html`<p class="empty">No FAQ items match your search.</p>`
        : html`
            <uui-table>
              <uui-table-head>
                <uui-table-head-cell>Question</uui-table-head-cell>
                <uui-table-head-cell>Category</uui-table-head-cell>
                <uui-table-head-cell>Status</uui-table-head-cell>
              </uui-table-head>
              ${this._searchResults.map(
                (item) => html`
                  <uui-table-row>
                    <uui-table-cell>${item.question}</uui-table-cell>
                    <uui-table-cell>${this._getCategoryName(item.categoryId)}</uui-table-cell>
                    <uui-table-cell>
                      <span class="badge ${item.isPublished ? "published" : "unpublished"}">
                        ${item.isPublished ? "Published" : "Unpublished"}
                      </span>
                    </uui-table-cell>
                  </uui-table-row>
                `
              )}
            </uui-table>
          `}
    `;
  }

  override render() {
    return html`
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
          @click=${() => (this._activeTab = "overview")}
        >Overview</uui-tab>
        <uui-tab
          label="All Items"
          ?active=${this._activeTab === "items"}
          @click=${() => (this._activeTab = "items")}
        >All Items (${this._totalItems})</uui-tab>
        <uui-tab
          label="Categories"
          ?active=${this._activeTab === "categories"}
          @click=${() => (this._activeTab = "categories")}
        >Categories</uui-tab>
        ${this._searchResults.length > 0 || this._activeTab === "search"
          ? html`
              <uui-tab
                label="Search Results"
                ?active=${this._activeTab === "search"}
                @click=${() => (this._activeTab = "search")}
              >Search Results</uui-tab>
            `
          : nothing}
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "overview"
          ? this._renderOverviewTab()
          : this._activeTab === "items"
          ? this._renderItemsTab()
          : this._activeTab === "categories"
          ? this._renderCategoriesTab()
          : this._renderSearchTab()}
      </div>
    `;
  }
}

export default FaqsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "faqs-dashboard": FaqsDashboardElement;
  }
}

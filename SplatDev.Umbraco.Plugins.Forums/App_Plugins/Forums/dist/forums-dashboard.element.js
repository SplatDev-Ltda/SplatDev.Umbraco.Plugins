import { LitElement as p, html as a, nothing as n, css as h, state as r, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
var _ = Object.defineProperty, m = Object.getOwnPropertyDescriptor, o = (e, i, t, u) => {
  for (var l = u > 1 ? void 0 : u ? m(i, t) : i, c = e.length - 1, d; c >= 0; c--)
    (d = e[c]) && (l = (u ? d(i, t, l) : d(l)) || l);
  return u && l && _(i, t, l), l;
};
let s = class extends b(p) {
  constructor() {
    super(...arguments), this._activeTab = "categories", this._categories = [], this._selectedCategory = null, this._threads = [], this._totalThreads = 0, this._page = 1, this._loading = !1, this._pageSize = 20, this._apiBase = "/umbraco/api/forums";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadCategories();
  }
  async _loadCategories() {
    this._loading = !0;
    try {
      const e = await fetch(`${this._apiBase}/GetCategories`);
      e.ok && (this._categories = await e.json());
    } catch {
      this._categories = [];
    } finally {
      this._loading = !1;
    }
  }
  async _selectCategory(e) {
    this._selectedCategory = e, this._page = 1, this._activeTab = "threads", await this._loadThreads();
  }
  async _loadThreads() {
    if (this._selectedCategory) {
      this._loading = !0;
      try {
        const e = await fetch(
          `${this._apiBase}/GetThreads?categoryId=${this._selectedCategory.id}&page=${this._page}&pageSize=${this._pageSize}`
        );
        if (e.ok) {
          const i = await e.json();
          this._threads = i.threads ?? [], this._totalThreads = i.total ?? 0;
        }
      } catch {
        this._threads = [];
      } finally {
        this._loading = !1;
      }
    }
  }
  async _lockThread(e) {
    await fetch(`${this._apiBase}/LockThread?threadId=${e.id}&locked=${!e.isLocked}`, {
      method: "POST"
    }), e.isLocked = !e.isLocked, this.requestUpdate();
  }
  async _pinThread(e) {
    await fetch(`${this._apiBase}/PinThread?threadId=${e.id}&pinned=${!e.isPinned}`, {
      method: "POST"
    }), e.isPinned = !e.isPinned, this.requestUpdate();
  }
  async _deleteThread(e) {
    confirm("Delete this thread and all its replies?") && (await fetch(`${this._apiBase}/DeleteThread?threadId=${e}`, { method: "DELETE" }), this._threads = this._threads.filter((i) => i.id !== e), this._totalThreads--, this.requestUpdate());
  }
  _formatDate(e) {
    return new Date(e).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }
  async _prevPage() {
    this._page > 1 && (this._page--, await this._loadThreads());
  }
  async _nextPage() {
    this._page * this._pageSize < this._totalThreads && (this._page++, await this._loadThreads());
  }
  _renderCategoriesTab() {
    return this._loading ? a`<p>Loading categories...</p>` : a`
      <div class="stats-grid">
        <uui-box>
          <p class="stat-label">Categories</p>
          <p class="stat-value">${this._categories.length}</p>
        </uui-box>
      </div>

      <uui-box headline="Forum Categories">
        ${this._categories.length === 0 ? a`<p class="empty">No categories found.</p>` : a`
              <div class="categories-grid">
                ${this._categories.map(
      (e) => a`
                    <div class="category-card" @click=${() => this._selectCategory(e)}>
                      <h3>${e.name}</h3>
                      <p>${e.description || "No description"}</p>
                      <small style="color: var(--uui-color-text-alt);">
                        Slug: <code>${e.slug}</code> &middot; Sort: ${e.sortOrder}
                      </small>
                    </div>
                  `
    )}
              </div>
            `}
      </uui-box>
    `;
  }
  _renderThreadsTab() {
    var e, i;
    return this._loading ? a`<p>Loading threads...</p>` : a`
      <div class="breadcrumb">
        <a @click=${() => {
      this._activeTab = "categories";
    }}>Categories</a>
        &rsaquo; ${((e = this._selectedCategory) == null ? void 0 : e.name) ?? ""}
      </div>

      <div class="stats-grid">
        <uui-box>
          <p class="stat-label">Total Threads</p>
          <p class="stat-value">${this._totalThreads}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Pinned</p>
          <p class="stat-value">${this._threads.filter((t) => t.isPinned).length}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Locked</p>
          <p class="stat-value">${this._threads.filter((t) => t.isLocked).length}</p>
        </uui-box>
      </div>

      <uui-box headline="Threads in ${((i = this._selectedCategory) == null ? void 0 : i.name) ?? ""}">
        ${this._threads.length === 0 ? a`<p class="empty">No threads in this category.</p>` : a`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Title</uui-table-head-cell>
                  <uui-table-head-cell>Author</uui-table-head-cell>
                  <uui-table-head-cell>Replies</uui-table-head-cell>
                  <uui-table-head-cell>Views</uui-table-head-cell>
                  <uui-table-head-cell>Created</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._threads.map(
      (t) => a`
                    <uui-table-row>
                      <uui-table-cell>
                        ${t.isPinned ? a`<span title="Pinned">&#128204;</span> ` : n}
                        <strong>${t.title}</strong>
                      </uui-table-cell>
                      <uui-table-cell>${t.authorName}</uui-table-cell>
                      <uui-table-cell>${t.replyCount}</uui-table-cell>
                      <uui-table-cell>${t.viewCount}</uui-table-cell>
                      <uui-table-cell>${this._formatDate(t.createdAt)}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${t.isLocked ? "locked" : "open"}">
                          ${t.isLocked ? "Locked" : "Open"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button
                          look="secondary"
                          label="${t.isLocked ? "Unlock" : "Lock"}"
                          @click=${() => this._lockThread(t)}
                        >${t.isLocked ? "Unlock" : "Lock"}</uui-button>
                        <uui-button
                          look="secondary"
                          label="${t.isPinned ? "Unpin" : "Pin"}"
                          @click=${() => this._pinThread(t)}
                        >${t.isPinned ? "Unpin" : "Pin"}</uui-button>
                        <uui-button
                          look="danger"
                          label="Delete"
                          @click=${() => this._deleteThread(t.id)}
                        >Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>

              ${this._totalThreads > this._pageSize ? a`
                    <div class="pagination">
                      <uui-button
                        look="secondary"
                        label="Previous"
                        ?disabled=${this._page === 1}
                        @click=${this._prevPage}
                      >Previous</uui-button>
                      <span>Page ${this._page}</span>
                      <uui-button
                        look="secondary"
                        label="Next"
                        ?disabled=${this._page * this._pageSize >= this._totalThreads}
                        @click=${this._nextPage}
                      >Next</uui-button>
                    </div>
                  ` : n}
            `}
      </uui-box>
    `;
  }
  render() {
    return a`
      <h1>Forums Manager</h1>
      <p class="description">
        Manage discussion forum categories, threads, replies and moderation from the Umbraco backoffice.
      </p>

      <uui-tab-group>
        <uui-tab
          label="Categories"
          ?active=${this._activeTab === "categories"}
          @click=${() => this._activeTab = "categories"}
        >Categories</uui-tab>
        ${this._selectedCategory ? a`
              <uui-tab
                label="Threads"
                ?active=${this._activeTab === "threads"}
                @click=${() => this._activeTab = "threads"}
              >Threads: ${this._selectedCategory.name}</uui-tab>
            ` : n}
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "categories" ? this._renderCategoriesTab() : this._renderThreadsTab()}
      </div>
    `;
  }
};
s.styles = h`
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

    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge.locked { background: #fee2e2; color: #991b1b; }
    .badge.open { background: #d1fae5; color: #065f46; }
    .badge.pinned { background: #dbeafe; color: #1e40af; }

    .category-card {
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 6px;
      padding: 16px;
      background: var(--uui-color-surface, #fff);
      cursor: pointer;
      transition: border-color 0.15s;
    }

    .category-card:hover {
      border-color: var(--uui-color-focus, #6366f1);
    }

    .category-card h3 {
      margin: 0 0 4px;
      font-size: 1rem;
      font-weight: 600;
    }

    .category-card p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
    }

    uui-table {
      width: 100%;
    }

    .pagination {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      font-size: 0.875rem;
    }

    .empty {
      color: var(--uui-color-text-alt, #6b7280);
      padding: 24px 0;
    }

    .breadcrumb {
      font-size: 0.875rem;
      color: var(--uui-color-text-alt, #6b7280);
      margin-bottom: 12px;
    }

    .breadcrumb a {
      cursor: pointer;
      text-decoration: underline;
    }
  `;
o([
  r()
], s.prototype, "_activeTab", 2);
o([
  r()
], s.prototype, "_categories", 2);
o([
  r()
], s.prototype, "_selectedCategory", 2);
o([
  r()
], s.prototype, "_threads", 2);
o([
  r()
], s.prototype, "_totalThreads", 2);
o([
  r()
], s.prototype, "_page", 2);
o([
  r()
], s.prototype, "_loading", 2);
s = o([
  g("forums-dashboard")
], s);
const $ = s;
export {
  s as ForumsDashboardElement,
  $ as default
};

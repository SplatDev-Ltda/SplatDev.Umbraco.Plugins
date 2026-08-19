import { LitElement as b, html as s, nothing as p, css as _, state as d, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as f } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as v } from "@umbraco-cms/backoffice/auth";
function y(e) {
  let a = null;
  const t = new Promise((o) => {
    e.consumeContext(v, async (i) => {
      var l;
      try {
        a = await ((l = i == null ? void 0 : i.getLatestToken) == null ? void 0 : l.call(i)) ?? null;
      } catch {
        a = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return async (o, i = {}) => {
    await t;
    const l = new Headers(i.headers);
    a && !l.has("Authorization") && l.set("Authorization", `Bearer ${a}`);
    const u = await fetch(o, { ...i, credentials: "same-origin", headers: l });
    return (u.status === 401 || u.status === 403) && console.error(
      `[SplatDev] ${u.status} from ${String(o)} — the backoffice token was ${a ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), u;
  };
}
var $ = Object.defineProperty, T = Object.getOwnPropertyDescriptor, g = (e) => {
  throw TypeError(e);
}, c = (e, a, t, o) => {
  for (var i = o > 1 ? void 0 : o ? T(a, t) : a, l = e.length - 1, u; l >= 0; l--)
    (u = e[l]) && (i = (o ? u(a, t, i) : u(i)) || i);
  return o && i && $(a, t, i), i;
}, k = (e, a, t) => a.has(e) || g("Cannot " + t), h = (e, a, t) => (k(e, a, "read from private field"), t ? t.call(e) : a.get(e)), x = (e, a, t) => a.has(e) ? g("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(e) : a.set(e, t), n;
let r = class extends f(b) {
  constructor() {
    super(...arguments), x(this, n, y(this)), this._activeTab = "categories", this._categories = [], this._selectedCategory = null, this._threads = [], this._totalThreads = 0, this._page = 1, this._loading = !1, this._pageSize = 20, this._apiBase = "/umbraco/api/forums";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadCategories();
  }
  async _loadCategories() {
    this._loading = !0;
    try {
      const e = await h(this, n).call(this, `${this._apiBase}/GetCategories`);
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
        const e = await h(this, n).call(this, `${this._apiBase}/GetThreads?categoryId=${this._selectedCategory.id}&page=${this._page}&pageSize=${this._pageSize}`);
        if (e.ok) {
          const a = await e.json();
          this._threads = a.threads ?? [], this._totalThreads = a.total ?? 0;
        }
      } catch {
        this._threads = [];
      } finally {
        this._loading = !1;
      }
    }
  }
  async _lockThread(e) {
    await h(this, n).call(this, `${this._apiBase}/LockThread?threadId=${e.id}&locked=${!e.isLocked}`, {
      method: "POST"
    }), e.isLocked = !e.isLocked, this.requestUpdate();
  }
  async _pinThread(e) {
    await h(this, n).call(this, `${this._apiBase}/PinThread?threadId=${e.id}&pinned=${!e.isPinned}`, {
      method: "POST"
    }), e.isPinned = !e.isPinned, this.requestUpdate();
  }
  async _deleteThread(e) {
    confirm("Delete this thread and all its replies?") && (await h(this, n).call(this, `${this._apiBase}/DeleteThread?threadId=${e}`, { method: "DELETE" }), this._threads = this._threads.filter((a) => a.id !== e), this._totalThreads--, this.requestUpdate());
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
    return this._loading ? s`<p>Loading categories...</p>` : s`
      <div class="stats-grid">
        <uui-box>
          <p class="stat-label">Categories</p>
          <p class="stat-value">${this._categories.length}</p>
        </uui-box>
      </div>

      <uui-box headline="Forum Categories">
        ${this._categories.length === 0 ? s`<p class="empty">No categories found.</p>` : s`
              <div class="categories-grid">
                ${this._categories.map(
      (e) => s`
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
    var e, a;
    return this._loading ? s`<p>Loading threads...</p>` : s`
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

      <uui-box headline="Threads in ${((a = this._selectedCategory) == null ? void 0 : a.name) ?? ""}">
        ${this._threads.length === 0 ? s`<p class="empty">No threads in this category.</p>` : s`
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
      (t) => s`
                    <uui-table-row>
                      <uui-table-cell>
                        ${t.isPinned ? s`<span title="Pinned">&#128204;</span> ` : p}
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

              ${this._totalThreads > this._pageSize ? s`
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
                  ` : p}
            `}
      </uui-box>
    `;
  }
  render() {
    return s`
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
        ${this._selectedCategory ? s`
              <uui-tab
                label="Threads"
                ?active=${this._activeTab === "threads"}
                @click=${() => this._activeTab = "threads"}
              >Threads: ${this._selectedCategory.name}</uui-tab>
            ` : p}
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "categories" ? this._renderCategoriesTab() : this._renderThreadsTab()}
      </div>
    `;
  }
};
n = /* @__PURE__ */ new WeakMap();
r.styles = _`
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
c([
  d()
], r.prototype, "_activeTab", 2);
c([
  d()
], r.prototype, "_categories", 2);
c([
  d()
], r.prototype, "_selectedCategory", 2);
c([
  d()
], r.prototype, "_threads", 2);
c([
  d()
], r.prototype, "_totalThreads", 2);
c([
  d()
], r.prototype, "_page", 2);
c([
  d()
], r.prototype, "_loading", 2);
r = c([
  m("forums-dashboard")
], r);
const z = r;
export {
  r as ForumsDashboardElement,
  z as default
};

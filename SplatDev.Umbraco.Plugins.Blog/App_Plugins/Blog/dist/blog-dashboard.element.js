import { LitElement as T, html as s, nothing as P, css as z, state as n, customElement as k } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as C } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as S } from "@umbraco-cms/backoffice/notification";
function D(e) {
  let t = null, a = null;
  const c = e.consumeContext.bind(e), r = new Promise((o) => {
    c(E, async (i) => {
      var d;
      try {
        t = await ((d = i == null ? void 0 : i.getLatestToken) == null ? void 0 : d.call(i)) ?? null;
      } catch {
        t = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return c(S, (o) => {
    a = o;
  }), async (o, i = {}) => {
    await r;
    const d = new Headers(i.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const h = await fetch(o, { ...i, credentials: "same-origin", headers: d });
    if (!h.ok) {
      const m = h.status === 401 || h.status === 403, w = m ? "Not authorised" : "Could not load data", v = m ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${h.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${h.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${h.status} from ${String(o)} — ${v}`), a == null || a.peek("danger", { data: { headline: w, message: v } });
    }
    return h;
  };
}
var B = Object.defineProperty, N = Object.getOwnPropertyDescriptor, y = (e) => {
  throw TypeError(e);
}, u = (e, t, a, c) => {
  for (var r = c > 1 ? void 0 : c ? N(t, a) : t, o = e.length - 1, i; o >= 0; o--)
    (i = e[o]) && (r = (c ? i(t, a, r) : i(r)) || r);
  return c && r && B(t, a, r), r;
}, $ = (e, t, a) => t.has(e) || y("Cannot " + a), _ = (e, t, a) => ($(e, t, "read from private field"), a ? a.call(e) : t.get(e)), x = (e, t, a) => t.has(e) ? y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), f = (e, t, a) => ($(e, t, "access private method"), a), p, g, b;
let l = class extends C(T) {
  constructor() {
    super(...arguments), x(this, g), x(this, p, D(this)), this._activeTab = "posts", this._posts = [], this._categories = [], this._tags = [], this._totalPosts = 0, this._page = 1, this._loading = !1, this._loadError = null, this._pageSize = 10, this._apiBase = "/umbraco/api/blog";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPosts(), this._loadCategories(), this._loadTags();
  }
  async _loadPosts() {
    this._loading = !0;
    try {
      const e = await _(this, p).call(this, `${this._apiBase}/GetPosts?page=${this._page}&pageSize=${this._pageSize}&publishedOnly=false`);
      if (f(this, g, b).call(this, e)) {
        const t = await e.json();
        this._posts = t.posts ?? [], this._totalPosts = t.total ?? 0;
      }
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._posts = [];
    } finally {
      this._loading = !1;
    }
  }
  async _loadCategories() {
    try {
      const e = await _(this, p).call(this, `${this._apiBase}/GetCategories`);
      f(this, g, b).call(this, e) && (this._categories = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._categories = [];
    }
  }
  async _loadTags() {
    try {
      const e = await _(this, p).call(this, `${this._apiBase}/GetTags`);
      f(this, g, b).call(this, e) && (this._tags = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._tags = [];
    }
  }
  _formatDate(e) {
    return new Date(e).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }
  async _prevPage() {
    this._page > 1 && (this._page--, await this._loadPosts());
  }
  async _nextPage() {
    this._page * this._pageSize < this._totalPosts && (this._page++, await this._loadPosts());
  }
  _renderPostsTab() {
    return this._loading ? s`<p>Loading posts...</p>` : s`
      <div class="stats-grid">
        <uui-box>
          <p class="stat-label">Total Posts</p>
          <p class="stat-value">${this._totalPosts}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Published</p>
          <p class="stat-value">${this._posts.filter((e) => e.isPublished).length}</p>
        </uui-box>
        <uui-box>
          <p class="stat-label">Drafts</p>
          <p class="stat-value">${this._posts.filter((e) => !e.isPublished).length}</p>
        </uui-box>
      </div>

      <uui-box headline="Blog Posts">
        ${this._posts.length === 0 ? s`<p class="empty">No posts found.</p>` : s`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Title</uui-table-head-cell>
                  <uui-table-head-cell>Author</uui-table-head-cell>
                  <uui-table-head-cell>Category</uui-table-head-cell>
                  <uui-table-head-cell>Published</uui-table-head-cell>
                  <uui-table-head-cell>Views</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                </uui-table-head>
                ${this._posts.map(
      (e) => {
        var t;
        return s`
                    <uui-table-row>
                      <uui-table-cell><strong>${e.title}</strong></uui-table-cell>
                      <uui-table-cell>${e.authorName}</uui-table-cell>
                      <uui-table-cell>${((t = e.category) == null ? void 0 : t.name) ?? "—"}</uui-table-cell>
                      <uui-table-cell>${this._formatDate(e.publishedAt)}</uui-table-cell>
                      <uui-table-cell>${e.viewCount}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${e.isPublished ? "published" : "draft"}">
                          ${e.isPublished ? "Published" : "Draft"}
                        </span>
                      </uui-table-cell>
                    </uui-table-row>
                  `;
      }
    )}
              </uui-table>

              ${this._totalPosts > this._pageSize ? s`
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
                        ?disabled=${this._page * this._pageSize >= this._totalPosts}
                        @click=${this._nextPage}
                      >Next</uui-button>
                    </div>
                  ` : P}
            `}
      </uui-box>
    `;
  }
  _renderCategoriesTab() {
    return s`
      <uui-box headline="Categories (${this._categories.length})">
        ${this._categories.length === 0 ? s`<p class="empty">No categories found.</p>` : s`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Slug</uui-table-head-cell>
                  <uui-table-head-cell>Description</uui-table-head-cell>
                </uui-table-head>
                ${this._categories.map(
      (e) => s`
                    <uui-table-row>
                      <uui-table-cell><strong>${e.name}</strong></uui-table-cell>
                      <uui-table-cell><code>${e.slug}</code></uui-table-cell>
                      <uui-table-cell>${e.description}</uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
  _renderTagsTab() {
    return s`
      <uui-box headline="Tags (${this._tags.length})">
        ${this._tags.length === 0 ? s`<p class="empty">No tags found.</p>` : s`
              <div class="tag-cloud">
                ${this._tags.map((e) => s`<span class="tag-chip">${e.name}</span>`)}
              </div>
            `}
      </uui-box>
    `;
  }
  render() {
    return s`
      ${this._loadError ? s`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>Blog Manager</h1>
      <p class="description">
        Manage blog posts, categories, tags and comments from the Umbraco backoffice.
      </p>

      <uui-tab-group>
        ${["posts", "categories", "tags"].map(
      (e) => s`
            <uui-tab
              label=${e.charAt(0).toUpperCase() + e.slice(1)}
              ?active=${this._activeTab === e}
              @click=${() => this._activeTab = e}
            >
              ${{ posts: "Posts", categories: "Categories", tags: "Tags" }[e]}
            </uui-tab>
          `
    )}
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "posts" ? this._renderPostsTab() : this._activeTab === "categories" ? this._renderCategoriesTab() : this._renderTagsTab()}
      </div>
    `;
  }
};
p = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakSet();
b = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
l.styles = z`
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
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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

    .badge.published { background: #d1fae5; color: #065f46; }
    .badge.draft { background: #fef3c7; color: #92400e; }

    .tag-cloud {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tag-chip {
      background: var(--uui-color-surface-alt, #f3f4f6);
      padding: 3px 12px;
      border-radius: 9999px;
      font-size: 0.8rem;
      color: var(--uui-color-text, #374151);
    }

    uui-table {
      width: 100%;
    }

    .toolbar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: var(--uui-size-space-3, 8px);
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
u([
  n()
], l.prototype, "_activeTab", 2);
u([
  n()
], l.prototype, "_posts", 2);
u([
  n()
], l.prototype, "_categories", 2);
u([
  n()
], l.prototype, "_tags", 2);
u([
  n()
], l.prototype, "_totalPosts", 2);
u([
  n()
], l.prototype, "_page", 2);
u([
  n()
], l.prototype, "_loading", 2);
u([
  n()
], l.prototype, "_loadError", 2);
l = u([
  k("blog-dashboard")
], l);
const U = l;
export {
  l as BlogDashboardElement,
  U as default
};

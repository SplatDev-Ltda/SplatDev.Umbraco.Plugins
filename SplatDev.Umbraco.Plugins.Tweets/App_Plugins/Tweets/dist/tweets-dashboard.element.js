import { LitElement as b, html as i, css as _, state as p, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as y } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as $ } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as C } from "@umbraco-cms/backoffice/notification";
function T(e) {
  let t = null, a = null;
  const n = e.consumeContext.bind(e), o = new Promise((r) => {
    n($, async (s) => {
      var d;
      try {
        t = await ((d = s == null ? void 0 : s.getLatestToken) == null ? void 0 : d.call(s)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return n(C, (r) => {
    a = r;
  }), async (r, s = {}) => {
    await o;
    const d = new Headers(s.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const l = await fetch(r, { ...s, credentials: "same-origin", headers: d });
    if (!l.ok) {
      const f = l.status === 401 || l.status === 403, v = f ? "Not authorised" : "Could not load data", g = f ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${l.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${l.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${l.status} from ${String(r)} — ${g}`), a == null || a.peek("danger", { data: { headline: v, message: g } });
    }
    return l;
  };
}
var k = Object.defineProperty, z = Object.getOwnPropertyDescriptor, m = (e) => {
  throw TypeError(e);
}, h = (e, t, a, n) => {
  for (var o = n > 1 ? void 0 : n ? z(t, a) : t, r = e.length - 1, s; r >= 0; r--)
    (s = e[r]) && (o = (n ? s(t, a, o) : s(o)) || o);
  return n && o && k(t, a, o), o;
}, A = (e, t, a) => t.has(e) || m("Cannot " + a), w = (e, t, a) => (A(e, t, "read from private field"), a ? a.call(e) : t.get(e)), R = (e, t, a) => t.has(e) ? m("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), u;
let c = class extends y(b) {
  constructor() {
    super(...arguments), R(this, u, T(this)), this._tweets = [], this._loading = !1, this._refreshing = !1, this._lastRefresh = null, this._apiBase = "/umbraco/api/tweets";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadTweets();
  }
  async _loadTweets() {
    this._loading = !0;
    try {
      const e = await w(this, u).call(this, `${this._apiBase}/feed`);
      e.ok && (this._tweets = await e.json(), this._tweets.length > 0 && (this._lastRefresh = this._tweets[0].cachedAt));
    } finally {
      this._loading = !1;
    }
  }
  async _refreshCache() {
    this._refreshing = !0;
    try {
      (await (await w(this, u).call(this, `${this._apiBase}/refresh`, { method: "POST" })).json()).success && await this._loadTweets();
    } finally {
      this._refreshing = !1;
    }
  }
  _renderTweetCard(e) {
    const t = new Date(e.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    return i`
      <div class="tweet-card">
        <div class="tweet-header">
          ${e.authorAvatarUrl ? i`<img src="${e.authorAvatarUrl}" alt="${e.authorName}" class="tweet-avatar" />` : i`<div class="tweet-avatar">${e.authorHandle.charAt(0).toUpperCase()}</div>`}
          <div style="flex:1;">
            <div class="tweet-author-name">${e.authorName}</div>
            <div class="tweet-author-handle">@${e.authorHandle}</div>
          </div>
          <a
            href="${e.tweetUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="tweet-link"
            title="View on X"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.904-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>

        <div class="tweet-content">${e.content}</div>

        <div class="tweet-footer">
          <span class="tweet-stat">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"/>
            </svg>
            ${e.likeCount.toLocaleString()}
          </span>
          <span class="tweet-stat">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"/>
            </svg>
            ${e.retweetCount.toLocaleString()}
          </span>
          <span class="tweet-time">${t}</span>
        </div>
      </div>
    `;
  }
  render() {
    return i`
      <h1>Tweets</h1>
      <p class="description">
        Preview and manage the locally cached Twitter/X feed displayed on your site.
      </p>

      <div class="settings-note">
        Configure <code>UmbracoCms:Tweets:BearerToken</code> and
        <code>UmbracoCms:Tweets:TwitterHandle</code> in <code>appsettings.json</code> to enable
        live API refresh. The cache refreshes automatically every
        ${60} minutes (configurable via <code>RefreshIntervalMinutes</code>).
      </div>

      <div class="toolbar">
        <uui-button
          look="primary"
          label="Refresh from API"
          ?disabled=${this._refreshing || this._loading}
          @click=${this._refreshCache}
        >
          ${this._refreshing ? "Refreshing…" : "Refresh from API"}
        </uui-button>
        <uui-button
          look="secondary"
          label="Reload"
          ?disabled=${this._loading}
          @click=${this._loadTweets}
        >
          Reload
        </uui-button>
        ${this._lastRefresh ? i`
              <span style="font-size:0.8rem; color: var(--uui-color-text-alt);">
                Last cached: ${new Date(this._lastRefresh).toLocaleString()}
              </span>
            ` : ""}
      </div>

      <uui-box headline="Cached Feed (${this._tweets.length} tweet${this._tweets.length !== 1 ? "s" : ""})">
        ${this._loading ? i`<uui-loader></uui-loader>` : this._tweets.length === 0 ? i`
              <div class="empty-state">
                <p>No cached tweets. Click <strong>Refresh from API</strong> to fetch the latest tweets.</p>
              </div>
            ` : i`<div class="tweet-grid">${this._tweets.map((e) => this._renderTweetCard(e))}</div>`}
      </uui-box>
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
c.styles = _`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 8px;
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 24px;
    }

    .toolbar {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 24px;
    }

    .tweet-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }

    .tweet-card {
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 12px;
      padding: 16px;
      background: var(--uui-color-surface, #fff);
    }

    .tweet-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .tweet-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      background: #1d9bf0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1rem;
    }

    .tweet-author-name {
      font-weight: 700;
      font-size: 0.875rem;
    }

    .tweet-author-handle {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .tweet-content {
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 12px;
      word-break: break-word;
      white-space: pre-wrap;
    }

    .tweet-footer {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.75rem;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .tweet-stat {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .tweet-time {
      margin-left: auto;
    }

    .tweet-link {
      color: inherit;
      text-decoration: none;
      display: flex;
      align-items: center;
    }

    .tweet-link:hover {
      color: var(--uui-color-text, #0f172a);
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .settings-note {
      background: var(--uui-color-surface-alt, #f9fafb);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 0.875rem;
      margin-bottom: 24px;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .settings-note code {
      background: rgba(0,0,0,0.06);
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 0.8rem;
    }
  `;
h([
  p()
], c.prototype, "_tweets", 2);
h([
  p()
], c.prototype, "_loading", 2);
h([
  p()
], c.prototype, "_refreshing", 2);
h([
  p()
], c.prototype, "_lastRefresh", 2);
c = h([
  x("tweets-dashboard")
], c);
export {
  c as TweetsDashboardElement
};

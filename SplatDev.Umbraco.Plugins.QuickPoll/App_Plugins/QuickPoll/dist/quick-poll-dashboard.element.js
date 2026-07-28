import { LitElement as d, html as s, css as p, state as u, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as h } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, o = (e, t, l, r) => {
  for (var i = r > 1 ? void 0 : r ? _(t, l) : t, c = e.length - 1, n; c >= 0; c--)
    (n = e[c]) && (i = (r ? n(t, l, i) : n(i)) || i);
  return r && i && g(t, l, i), i;
};
let a = class extends h(d) {
  constructor() {
    super(...arguments), this._polls = [], this._loading = !1, this._error = null, this._selectedPollResults = null, this._apiBase = "/umbraco/api/quickpoll";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPolls();
  }
  async _loadPolls() {
    this._loading = !0, this._error = null;
    try {
      const e = await fetch(`${this._apiBase}/getall`);
      if (!e.ok) throw new Error(`HTTP ${e.status}`);
      this._polls = await e.json();
    } catch (e) {
      this._error = `Failed to load polls: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._loading = !1;
    }
  }
  async _viewResults(e) {
    try {
      const t = await fetch(`${this._apiBase}/results?pollId=${e}`);
      if (!t.ok) throw new Error(`HTTP ${t.status}`);
      this._selectedPollResults = await t.json();
    } catch (t) {
      this._error = `Failed to load results: ${t instanceof Error ? t.message : String(t)}`;
    }
  }
  async _deletePoll(e) {
    var t;
    if (confirm("Delete this poll and all votes?"))
      try {
        await fetch(`${this._apiBase}/delete?id=${e}`, { method: "DELETE" }), this._polls = this._polls.filter((l) => l.id !== e), ((t = this._selectedPollResults) == null ? void 0 : t.pollId) === e && (this._selectedPollResults = null);
      } catch (l) {
        this._error = `Delete failed: ${l instanceof Error ? l.message : String(l)}`;
      }
  }
  render() {
    return s`
      <h1>Quick Poll</h1>
      <p class="description">
        Manage single-question polls, track votes, and view real-time results.
      </p>

      ${this._error ? s`<uui-box style="margin-bottom:16px">
            <p style="color:var(--uui-color-danger)">${this._error}</p>
          </uui-box>` : ""}

      <div class="toolbar">
        <uui-button
          look="secondary"
          label="Refresh"
          ?disabled=${this._loading}
          @click=${this._loadPolls}
        >${this._loading ? "Loading…" : "Refresh"}</uui-button>
      </div>

      <div class="section">
        <uui-box headline="Polls">
          ${this._polls.length > 0 ? s`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Question</uui-table-head-cell>
                    <uui-table-head-cell>Status</uui-table-head-cell>
                    <uui-table-head-cell>Options</uui-table-head-cell>
                    <uui-table-head-cell>Created</uui-table-head-cell>
                    <uui-table-head-cell>Actions</uui-table-head-cell>
                  </uui-table-head>
                  ${this._polls.map(
      (e) => {
        var t;
        return s`
                      <uui-table-row>
                        <uui-table-cell>${e.question}</uui-table-cell>
                        <uui-table-cell>
                          <span class="badge ${e.isActive ? "badge-active" : "badge-inactive"}">
                            ${e.isActive ? "Active" : "Inactive"}
                          </span>
                        </uui-table-cell>
                        <uui-table-cell>${((t = e.options) == null ? void 0 : t.length) ?? 0}</uui-table-cell>
                        <uui-table-cell>${new Date(e.createdAt).toLocaleDateString()}</uui-table-cell>
                        <uui-table-cell>
                          <uui-button look="secondary" compact label="Results"
                            @click=${() => this._viewResults(e.id)}>Results</uui-button>
                          <uui-button look="danger" compact label="Delete"
                            @click=${() => this._deletePoll(e.id)}>Delete</uui-button>
                        </uui-table-cell>
                      </uui-table-row>
                    `;
      }
    )}
                </uui-table>
              ` : s`<div class="empty-state"><p>No polls found.</p></div>`}
        </uui-box>
      </div>

      ${this._selectedPollResults ? s`
            <div class="section">
              <uui-box headline="Results: ${this._selectedPollResults.question}">
                <p>Total votes: <strong>${this._selectedPollResults.totalVotes}</strong></p>
                ${this._selectedPollResults.options.map(
      (e) => s`
                    <div class="result-row">
                      <span class="option-label">${e.optionText}</span>
                      <div class="result-bar-wrap">
                        <div class="result-bar" style="width:${e.percentage}%"></div>
                      </div>
                      <span class="option-pct">${e.percentage.toFixed(1)}% (${e.voteCount})</span>
                    </div>
                  `
    )}
                <uui-button look="secondary" @click=${() => this._selectedPollResults = null}>
                  Close Results
                </uui-button>
              </uui-box>
            </div>
          ` : ""}
    `;
  }
};
a.styles = p`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 8px;
      color: var(--uui-color-text);
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 24px;
    }

    .toolbar {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .section {
      margin-bottom: 24px;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-active { background: #d1fae5; color: #065f46; }
    .badge-inactive { background: #fee2e2; color: #991b1b; }

    .result-bar-wrap {
      flex: 1;
      height: 12px;
      background: var(--uui-color-surface-alt, #f3f4f6);
      border-radius: 6px;
      overflow: hidden;
      min-width: 80px;
    }

    .result-bar {
      height: 100%;
      background: var(--uui-color-interactive, #1a56db);
      border-radius: 6px;
    }

    .result-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 0.9rem;
    }

    .option-label { min-width: 120px; }
    .option-pct { min-width: 60px; text-align: right; color: var(--uui-color-text-alt); }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--uui-color-text-alt);
    }
  `;
o([
  u()
], a.prototype, "_polls", 2);
o([
  u()
], a.prototype, "_loading", 2);
o([
  u()
], a.prototype, "_error", 2);
o([
  u()
], a.prototype, "_selectedPollResults", 2);
a = o([
  b("quick-poll-dashboard")
], a);
export {
  a as QuickPollDashboardElement
};

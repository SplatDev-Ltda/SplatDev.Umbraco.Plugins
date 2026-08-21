import { LitElement as m, html as u, css as w, state as p, customElement as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as y } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as x } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as k } from "@umbraco-cms/backoffice/notification";
function P(e) {
  let t = null, l = null;
  const o = e.consumeContext.bind(e), i = new Promise((s) => {
    o(x, async (a) => {
      var c;
      try {
        t = await ((c = a == null ? void 0 : a.getLatestToken) == null ? void 0 : c.call(a)) ?? null;
      } catch {
        t = null;
      }
      s();
    }), setTimeout(s, 3e3);
  });
  return o(k, (s) => {
    l = s;
  }), async (s, a = {}) => {
    await i;
    const c = new Headers(a.headers);
    t && !c.has("Authorization") && c.set("Authorization", `Bearer ${t}`);
    const r = await fetch(s, { ...a, credentials: "same-origin", headers: c });
    if (!r.ok) {
      const g = r.status === 401 || r.status === 403, f = g ? "Not authorised" : "Could not load data", _ = g ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${r.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${r.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${r.status} from ${String(s)} — ${_}`), l == null || l.peek("danger", { data: { headline: f, message: _ } });
    }
    return r;
  };
}
var T = Object.defineProperty, R = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, h = (e, t, l, o) => {
  for (var i = o > 1 ? void 0 : o ? R(t, l) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (i = (o ? a(t, l, i) : a(i)) || i);
  return o && i && T(t, l, i), i;
}, E = (e, t, l) => t.has(e) || v("Cannot " + l), b = (e, t, l) => (E(e, t, "read from private field"), l ? l.call(e) : t.get(e)), C = (e, t, l) => t.has(e) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, l), d;
let n = class extends y(m) {
  constructor() {
    super(...arguments), C(this, d, P(this)), this._polls = [], this._loading = !1, this._error = null, this._selectedPollResults = null, this._apiBase = "/umbraco/api/quickpoll";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadPolls();
  }
  async _loadPolls() {
    this._loading = !0, this._error = null;
    try {
      const e = await b(this, d).call(this, `${this._apiBase}/getall`);
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
      const t = await b(this, d).call(this, `${this._apiBase}/results?pollId=${e}`);
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
        await b(this, d).call(this, `${this._apiBase}/delete?id=${e}`, { method: "DELETE" }), this._polls = this._polls.filter((l) => l.id !== e), ((t = this._selectedPollResults) == null ? void 0 : t.pollId) === e && (this._selectedPollResults = null);
      } catch (l) {
        this._error = `Delete failed: ${l instanceof Error ? l.message : String(l)}`;
      }
  }
  render() {
    return u`
      <h1>Quick Poll</h1>
      <p class="description">
        Manage single-question polls, track votes, and view real-time results.
      </p>

      ${this._error ? u`<uui-box style="margin-bottom:16px">
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
          ${this._polls.length > 0 ? u`
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
        return u`
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
              ` : u`<div class="empty-state"><p>No polls found.</p></div>`}
        </uui-box>
      </div>

      ${this._selectedPollResults ? u`
            <div class="section">
              <uui-box headline="Results: ${this._selectedPollResults.question}">
                <p>Total votes: <strong>${this._selectedPollResults.totalVotes}</strong></p>
                ${this._selectedPollResults.options.map(
      (e) => u`
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
d = /* @__PURE__ */ new WeakMap();
n.styles = w`
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
h([
  p()
], n.prototype, "_polls", 2);
h([
  p()
], n.prototype, "_loading", 2);
h([
  p()
], n.prototype, "_error", 2);
h([
  p()
], n.prototype, "_selectedPollResults", 2);
n = h([
  $("quick-poll-dashboard")
], n);
export {
  n as QuickPollDashboardElement
};

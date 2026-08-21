import { LitElement as y, html as d, css as v, state as p, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as x } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as k } from "@umbraco-cms/backoffice/notification";
function S(e) {
  let t = null, a = null;
  const i = e.consumeContext.bind(e), r = new Promise((l) => {
    i(x, async (s) => {
      var u;
      try {
        t = await ((u = s == null ? void 0 : s.getLatestToken) == null ? void 0 : u.call(s)) ?? null;
      } catch {
        t = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return i(k, (l) => {
    a = l;
  }), async (l, s = {}) => {
    await r;
    const u = new Headers(s.headers);
    t && !u.has("Authorization") && u.set("Authorization", `Bearer ${t}`);
    const o = await fetch(l, { ...s, credentials: "same-origin", headers: u });
    if (!o.ok) {
      const b = o.status === 401 || o.status === 403, _ = b ? "Not authorised" : "Could not load data", f = b ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${o.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${o.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${o.status} from ${String(l)} — ${f}`), a == null || a.peek("danger", { data: { headline: _, message: f } });
    }
    return o;
  };
}
var T = Object.defineProperty, A = Object.getOwnPropertyDescriptor, m = (e) => {
  throw TypeError(e);
}, h = (e, t, a, i) => {
  for (var r = i > 1 ? void 0 : i ? A(t, a) : t, l = e.length - 1, s; l >= 0; l--)
    (s = e[l]) && (r = (i ? s(t, a, r) : s(r)) || r);
  return i && r && T(t, a, r), r;
}, C = (e, t, a) => t.has(e) || m("Cannot " + a), g = (e, t, a) => (C(e, t, "read from private field"), a ? a.call(e) : t.get(e)), E = (e, t, a) => t.has(e) ? m("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), c;
let n = class extends $(y) {
  constructor() {
    super(...arguments), E(this, c, S(this)), this._surveys = [], this._loading = !1, this._error = null, this._apiBase = "/umbraco/api/surveys";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSurveys();
  }
  async _loadSurveys() {
    this._loading = !0, this._error = null;
    try {
      const e = await g(this, c).call(this, `${this._apiBase}/getall`);
      if (!e.ok) throw new Error(`HTTP ${e.status}`);
      this._surveys = await e.json();
    } catch (e) {
      this._error = `Failed to load surveys: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._loading = !1;
    }
  }
  async _deleteSurvey(e) {
    if (confirm("Delete this survey and all its responses?"))
      try {
        await g(this, c).call(this, `${this._apiBase}/delete?id=${e}`, { method: "DELETE" }), this._surveys = this._surveys.filter((t) => t.id !== e);
      } catch (t) {
        this._error = `Delete failed: ${t instanceof Error ? t.message : String(t)}`;
      }
  }
  _getResponseCount(e) {
    return e.responses && Array.isArray(e.responses) ? e.responses.length : 0;
  }
  render() {
    return d`
      <div class="dashboard-header">
        <h1>Surveys</h1>
        <p class="description">
          Build and manage surveys, collect responses, and view results from the Umbraco backoffice.
        </p>
      </div>

      <div class="toolbar">
        <uui-button
          look="secondary"
          label="Refresh"
          ?disabled=${this._loading}
          @click=${this._loadSurveys}
        >
          ${this._loading ? "Loading…" : "Refresh"}
        </uui-button>
      </div>

      ${this._error ? d`<uui-box>
            <p style="color:var(--uui-color-danger)">${this._error}</p>
          </uui-box>` : ""}

      <uui-box headline="Survey List">
        ${this._surveys.length > 0 ? d`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Title</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Responses</uui-table-head-cell>
                  <uui-table-head-cell>Created</uui-table-head-cell>
                  <uui-table-head-cell>Expires</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._surveys.map(
      (e) => d`
                    <uui-table-row>
                      <uui-table-cell>${e.title}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge ${e.isPublished ? "badge-published" : "badge-draft"}">
                          ${e.isPublished ? "Published" : "Draft"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>${this._getResponseCount(e)}</uui-table-cell>
                      <uui-table-cell>
                        ${new Date(e.createdAt).toLocaleDateString()}
                      </uui-table-cell>
                      <uui-table-cell>
                        ${e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : "—"}
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button
                          look="danger"
                          label="Delete"
                          compact
                          @click=${() => this._deleteSurvey(e.id)}
                        >Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            ` : d`
              <div class="empty-state">
                <uui-icon name="document"></uui-icon>
                <p>No surveys found. Create your first survey via the API.</p>
              </div>
            `}
      </uui-box>
    `;
  }
};
c = /* @__PURE__ */ new WeakMap();
n.styles = v`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    .dashboard-header {
      margin-bottom: var(--uui-size-layout-2, 32px);
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
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      color: var(--uui-color-text-alt);
      gap: 12px;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-published {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-draft {
      background: #fee2e2;
      color: #991b1b;
    }
  `;
h([
  p()
], n.prototype, "_surveys", 2);
h([
  p()
], n.prototype, "_loading", 2);
h([
  p()
], n.prototype, "_error", 2);
n = h([
  w("surveys-dashboard")
], n);
export {
  n as SurveysDashboardElement
};

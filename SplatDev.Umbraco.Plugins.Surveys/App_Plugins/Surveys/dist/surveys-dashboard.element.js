import { LitElement as b, html as r, css as _, state as d, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
import { c as v } from "./chunks/auth-fetch-BzMCmNwW.js";
var y = Object.defineProperty, m = Object.getOwnPropertyDescriptor, p = (e) => {
  throw TypeError(e);
}, u = (e, t, a, s) => {
  for (var l = s > 1 ? void 0 : s ? m(t, a) : t, n = e.length - 1, c; n >= 0; n--)
    (c = e[n]) && (l = (s ? c(t, a, l) : c(l)) || l);
  return s && l && y(t, a, l), l;
}, x = (e, t, a) => t.has(e) || p("Cannot " + a), h = (e, t, a) => (x(e, t, "read from private field"), a ? a.call(e) : t.get(e)), $ = (e, t, a) => t.has(e) ? p("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), o;
let i = class extends g(b) {
  constructor() {
    super(...arguments), $(this, o, v(this)), this._surveys = [], this._loading = !1, this._error = null, this._apiBase = "/umbraco/api/surveys";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSurveys();
  }
  async _loadSurveys() {
    this._loading = !0, this._error = null;
    try {
      const e = await h(this, o).call(this, `${this._apiBase}/getall`);
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
        await h(this, o).call(this, `${this._apiBase}/delete?id=${e}`, { method: "DELETE" }), this._surveys = this._surveys.filter((t) => t.id !== e);
      } catch (t) {
        this._error = `Delete failed: ${t instanceof Error ? t.message : String(t)}`;
      }
  }
  _getResponseCount(e) {
    return e.responses && Array.isArray(e.responses) ? e.responses.length : 0;
  }
  render() {
    return r`
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

      ${this._error ? r`<uui-box>
            <p style="color:var(--uui-color-danger)">${this._error}</p>
          </uui-box>` : ""}

      <uui-box headline="Survey List">
        ${this._surveys.length > 0 ? r`
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
      (e) => r`
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
            ` : r`
              <div class="empty-state">
                <uui-icon name="document"></uui-icon>
                <p>No surveys found. Create your first survey via the API.</p>
              </div>
            `}
      </uui-box>
    `;
  }
};
o = /* @__PURE__ */ new WeakMap();
i.styles = _`
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
u([
  d()
], i.prototype, "_surveys", 2);
u([
  d()
], i.prototype, "_loading", 2);
u([
  d()
], i.prototype, "_error", 2);
i = u([
  f("surveys-dashboard")
], i);
export {
  i as SurveysDashboardElement
};

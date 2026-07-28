import { LitElement as c, html as i, css as b, state as d, customElement as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as p } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, f = Object.getOwnPropertyDescriptor, r = (e, t, u, s) => {
  for (var l = s > 1 ? void 0 : s ? f(t, u) : t, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (l = (s ? n(t, u, l) : n(l)) || l);
  return s && l && g(t, u, l), l;
};
let a = class extends p(c) {
  constructor() {
    super(...arguments), this._surveys = [], this._loading = !1, this._error = null, this._apiBase = "/umbraco/api/surveys";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSurveys();
  }
  async _loadSurveys() {
    this._loading = !0, this._error = null;
    try {
      const e = await fetch(`${this._apiBase}/getall`);
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
        await fetch(`${this._apiBase}/delete?id=${e}`, { method: "DELETE" }), this._surveys = this._surveys.filter((t) => t.id !== e);
      } catch (t) {
        this._error = `Delete failed: ${t instanceof Error ? t.message : String(t)}`;
      }
  }
  _getResponseCount(e) {
    return e.responses && Array.isArray(e.responses) ? e.responses.length : 0;
  }
  render() {
    return i`
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

      ${this._error ? i`<uui-box>
            <p style="color:var(--uui-color-danger)">${this._error}</p>
          </uui-box>` : ""}

      <uui-box headline="Survey List">
        ${this._surveys.length > 0 ? i`
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
      (e) => i`
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
            ` : i`
              <div class="empty-state">
                <uui-icon name="document"></uui-icon>
                <p>No surveys found. Create your first survey via the API.</p>
              </div>
            `}
      </uui-box>
    `;
  }
};
a.styles = b`
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
r([
  d()
], a.prototype, "_surveys", 2);
r([
  d()
], a.prototype, "_loading", 2);
r([
  d()
], a.prototype, "_error", 2);
a = r([
  h("surveys-dashboard")
], a);
export {
  a as SurveysDashboardElement
};

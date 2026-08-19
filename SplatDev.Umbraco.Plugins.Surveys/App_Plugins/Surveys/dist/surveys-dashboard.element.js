import { LitElement as b, html as u, css as f, state as c, customElement as _ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as m } from "@umbraco-cms/backoffice/auth";
function v(e) {
  let t = null;
  const l = new Promise((r) => {
    e.consumeContext(m, async (a) => {
      var s;
      try {
        t = await ((s = a == null ? void 0 : a.getLatestToken) == null ? void 0 : s.call(a)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return async (r, a = {}) => {
    await l;
    const s = new Headers(a.headers);
    t && !s.has("Authorization") && s.set("Authorization", `Bearer ${t}`);
    const i = await fetch(r, { ...a, credentials: "same-origin", headers: s });
    return (i.status === 401 || i.status === 403) && console.error(
      `[SplatDev] ${i.status} from ${String(r)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), i;
  };
}
var y = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, p = (e) => {
  throw TypeError(e);
}, d = (e, t, l, r) => {
  for (var a = r > 1 ? void 0 : r ? $(t, l) : t, s = e.length - 1, i; s >= 0; s--)
    (i = e[s]) && (a = (r ? i(t, l, a) : i(a)) || a);
  return r && a && y(t, l, a), a;
}, w = (e, t, l) => t.has(e) || p("Cannot " + l), h = (e, t, l) => (w(e, t, "read from private field"), l ? l.call(e) : t.get(e)), x = (e, t, l) => t.has(e) ? p("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, l), n;
let o = class extends g(b) {
  constructor() {
    super(...arguments), x(this, n, v(this)), this._surveys = [], this._loading = !1, this._error = null, this._apiBase = "/umbraco/api/surveys";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSurveys();
  }
  async _loadSurveys() {
    this._loading = !0, this._error = null;
    try {
      const e = await h(this, n).call(this, `${this._apiBase}/getall`);
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
        await h(this, n).call(this, `${this._apiBase}/delete?id=${e}`, { method: "DELETE" }), this._surveys = this._surveys.filter((t) => t.id !== e);
      } catch (t) {
        this._error = `Delete failed: ${t instanceof Error ? t.message : String(t)}`;
      }
  }
  _getResponseCount(e) {
    return e.responses && Array.isArray(e.responses) ? e.responses.length : 0;
  }
  render() {
    return u`
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

      ${this._error ? u`<uui-box>
            <p style="color:var(--uui-color-danger)">${this._error}</p>
          </uui-box>` : ""}

      <uui-box headline="Survey List">
        ${this._surveys.length > 0 ? u`
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
      (e) => u`
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
            ` : u`
              <div class="empty-state">
                <uui-icon name="document"></uui-icon>
                <p>No surveys found. Create your first survey via the API.</p>
              </div>
            `}
      </uui-box>
    `;
  }
};
n = /* @__PURE__ */ new WeakMap();
o.styles = f`
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
d([
  c()
], o.prototype, "_surveys", 2);
d([
  c()
], o.prototype, "_loading", 2);
d([
  c()
], o.prototype, "_error", 2);
o = d([
  _("surveys-dashboard")
], o);
export {
  o as SurveysDashboardElement
};

import { LitElement as c, nothing as p, html as l, css as h, state as r, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as _ } from "@umbraco-cms/backoffice/element-api";
var m = Object.defineProperty, b = Object.getOwnPropertyDescriptor, s = (e, o, d, i) => {
  for (var a = i > 1 ? void 0 : i ? b(o, d) : o, u = e.length - 1, n; u >= 0; u--)
    (n = e[u]) && (a = (i ? n(o, d, a) : n(a)) || a);
  return i && a && m(o, d, a), a;
};
let t = class extends _(c) {
  constructor() {
    super(...arguments), this._restrictedNodes = [], this._loading = !1, this._nodeId = "", this._loginPageNodeId = "", this._errorPageNodeId = "", this._memberGroups = "", this._statusMsg = "", this._errorMsg = "", this._apiBase = "/umbraco/api/restricted";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadRestrictedNodes();
  }
  async _loadRestrictedNodes() {
    this._loading = !0;
    try {
      const e = await fetch(`${this._apiBase}/GetRestrictedNodes`);
      e.ok && (this._restrictedNodes = await e.json());
    } finally {
      this._loading = !1;
    }
  }
  async _restrictNode() {
    if (!this._nodeId) return;
    this._statusMsg = "", this._errorMsg = "";
    const e = this._memberGroups.split(",").map((i) => i.trim()).filter(Boolean), o = {
      nodeId: parseInt(this._nodeId, 10),
      loginPageNodeId: this._loginPageNodeId,
      errorPageNodeId: this._errorPageNodeId,
      memberGroups: e
    }, d = await fetch(`${this._apiBase}/RestrictNode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(o)
    });
    if (d.ok) {
      const i = await d.json();
      this._statusMsg = i.message, this._loadRestrictedNodes();
    } else
      this._errorMsg = "Failed to restrict node.";
  }
  async _unrestrictNode(e) {
    this._statusMsg = "", this._errorMsg = "", (await fetch(`${this._apiBase}/UnrestrictNode?nodeId=${e}`, { method: "DELETE" })).ok ? (this._statusMsg = `Node ${e} unrestricted.`, this._loadRestrictedNodes()) : this._errorMsg = `Failed to unrestrict node ${e}.`;
  }
  render() {
    return l`
      <h1>Restricted Content</h1>
      <p class="description">Manage member-only content gates, role-based access and paywall restrictions.</p>

      ${this._statusMsg ? l`<p class="status">${this._statusMsg}</p>` : p}
      ${this._errorMsg ? l`<p class="err-msg">${this._errorMsg}</p>` : p}

      <uui-box headline="Restrict a Node">
        <div class="form-grid">
          <div class="field">
            <label>Content Node ID</label>
            <uui-input placeholder="e.g. 1234" .value=${this._nodeId}
              @input=${(e) => this._nodeId = e.target.value}
            ></uui-input>
          </div>
          <div class="field">
            <label>Login Page Node ID</label>
            <uui-input placeholder="e.g. 1050" .value=${this._loginPageNodeId}
              @input=${(e) => this._loginPageNodeId = e.target.value}
            ></uui-input>
          </div>
          <div class="field">
            <label>Error Page Node ID</label>
            <uui-input placeholder="e.g. 1051" .value=${this._errorPageNodeId}
              @input=${(e) => this._errorPageNodeId = e.target.value}
            ></uui-input>
          </div>
          <div class="field">
            <label>Member Groups (comma-separated)</label>
            <uui-input placeholder="e.g. Members, Premium" .value=${this._memberGroups}
              @input=${(e) => this._memberGroups = e.target.value}
            ></uui-input>
          </div>
        </div>
        <uui-button look="primary" label="Apply Restriction" @click=${this._restrictNode}>Apply Restriction</uui-button>
      </uui-box>

      <uui-box headline="Currently Restricted Nodes" style="margin-top:20px">
        ${this._loading ? l`<p>Loading...</p>` : this._restrictedNodes.length === 0 ? l`<p class="empty">No restricted nodes found.</p>` : l`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Node ID</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._restrictedNodes.map(
      (e) => l`
                    <uui-table-row>
                      <uui-table-cell><strong>${e}</strong></uui-table-cell>
                      <uui-table-cell>
                        <uui-button
                          look="secondary"
                          label="Remove Restriction"
                          @click=${() => this._unrestrictNode(e)}
                        >Remove Restriction</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            `}
      </uui-box>
    `;
  }
};
t.styles = h`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .form-grid { display: grid; gap: 14px; max-width: 480px; margin-bottom: 20px; }
    .field label { display: block; font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
    .actions { margin-top: 12px; display: flex; gap: 12px; align-items: center; }
    .status { font-size: 0.875rem; color: #065f46; }
    .err-msg { font-size: 0.875rem; color: #b91c1c; }
    uui-table { width: 100%; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 12px 0; }
  `;
s([
  r()
], t.prototype, "_restrictedNodes", 2);
s([
  r()
], t.prototype, "_loading", 2);
s([
  r()
], t.prototype, "_nodeId", 2);
s([
  r()
], t.prototype, "_loginPageNodeId", 2);
s([
  r()
], t.prototype, "_errorPageNodeId", 2);
s([
  r()
], t.prototype, "_memberGroups", 2);
s([
  r()
], t.prototype, "_statusMsg", 2);
s([
  r()
], t.prototype, "_errorMsg", 2);
t = s([
  g("restricted-dashboard")
], t);
const y = t;
export {
  t as RestrictedDashboardElement,
  y as default
};

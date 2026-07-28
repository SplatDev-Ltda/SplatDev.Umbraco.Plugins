import { LitElement as c, nothing as h, html as s, css as p, state as u, customElement as _ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as b } from "@umbraco-cms/backoffice/element-api";
var k = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (e, d, a, l) => {
  for (var i = l > 1 ? void 0 : l ? g(d, a) : d, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (i = (l ? r(d, a, i) : r(i)) || i);
  return l && i && k(d, a, i), i;
};
let t = class extends b(c) {
  constructor() {
    super(...arguments), this._hiddenNodes = [], this._loading = !1, this._checkNodeId = "", this._checkResult = null, this._bulkIds = "", this._statusMsg = "", this._errorMsg = "", this._apiBase = "/umbraco/api/hiddencontent";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadHiddenNodes();
  }
  async _loadHiddenNodes() {
    this._loading = !0;
    try {
      const e = await fetch(`${this._apiBase}/GetHiddenNodes`);
      e.ok && (this._hiddenNodes = await e.json());
    } finally {
      this._loading = !1;
    }
  }
  async _post(e, d, a) {
    this._statusMsg = "", this._errorMsg = "";
    const l = `${this._apiBase}/${e}${d ? `?${d}` : ""}`, i = await fetch(l, {
      method: "POST",
      headers: a ? { "Content-Type": "application/json" } : {},
      body: a ? JSON.stringify(a) : void 0
    });
    if (i.ok) {
      const n = await i.json();
      return this._statusMsg = n.message ?? "Done.", !0;
    }
    return this._errorMsg = `Request to ${e} failed.`, !1;
  }
  async _hideNode(e) {
    await this._post("HideNode", `nodeId=${e}`) && this._loadHiddenNodes();
  }
  async _showNode(e) {
    await this._post("ShowNode", `nodeId=${e}`) && this._loadHiddenNodes();
  }
  async _checkNode() {
    if (!this._checkNodeId) return;
    const e = await fetch(`${this._apiBase}/IsHidden?nodeId=${this._checkNodeId}`);
    e.ok && (this._checkResult = await e.json());
  }
  _parseBulkIds() {
    return this._bulkIds.split(",").map((e) => parseInt(e.trim(), 10)).filter((e) => !isNaN(e));
  }
  async _bulkHide() {
    const e = this._parseBulkIds();
    e.length && await this._post("BulkHide", void 0, { nodeIds: e }) && this._loadHiddenNodes();
  }
  async _bulkShow() {
    const e = this._parseBulkIds();
    e.length && await this._post("BulkShow", void 0, { nodeIds: e }) && this._loadHiddenNodes();
  }
  render() {
    return s`
      <h1>Hidden Content</h1>
      <p class="description">Hide nodes from navigation and sitemaps while keeping them accessible by direct URL.</p>

      ${this._statusMsg ? s`<p class="status">${this._statusMsg}</p>` : h}
      ${this._errorMsg ? s`<p class="err-msg">${this._errorMsg}</p>` : h}

      <uui-box headline="Check Node Status">
        <div class="row">
          <uui-input
            placeholder="Node ID"
            type="number"
            .value=${this._checkNodeId}
            @input=${(e) => this._checkNodeId = e.target.value}
          ></uui-input>
          <uui-button look="secondary" label="Check" @click=${this._checkNode}>Check</uui-button>
        </div>
        ${this._checkResult ? s`
              <div class="check-result">
                Node <strong>${this._checkResult.nodeId}</strong> is
                <strong>${this._checkResult.hidden ? "hidden" : "visible"}</strong>.
                ${this._checkResult.hidden ? s`<uui-button look="primary" label="Show" @click=${() => this._showNode(this._checkResult.nodeId)}>Show in Nav</uui-button>` : s`<uui-button look="secondary" label="Hide" @click=${() => this._hideNode(this._checkResult.nodeId)}>Hide from Nav</uui-button>`}
              </div>
            ` : h}
      </uui-box>

      <uui-box headline="Bulk Operations" style="margin-top:20px">
        <div class="row">
          <uui-input
            placeholder="Node IDs (comma-separated)"
            .value=${this._bulkIds}
            @input=${(e) => this._bulkIds = e.target.value}
            style="min-width:280px"
          ></uui-input>
          <uui-button look="secondary" label="Bulk Hide" @click=${this._bulkHide}>Bulk Hide</uui-button>
          <uui-button look="primary" label="Bulk Show" @click=${this._bulkShow}>Bulk Show</uui-button>
        </div>
      </uui-box>

      <uui-box headline="Currently Hidden Nodes" style="margin-top:20px">
        ${this._loading ? s`<p>Loading...</p>` : this._hiddenNodes.length === 0 ? s`<p class="empty">No hidden nodes found.</p>` : s`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Node ID</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._hiddenNodes.map(
      (e) => s`
                    <uui-table-row>
                      <uui-table-cell><strong>${e}</strong></uui-table-cell>
                      <uui-table-cell>
                        <uui-button look="primary" label="Show in Nav" @click=${() => this._showNode(e)}>Show in Nav</uui-button>
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
t.styles = p`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .row { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
    .status { font-size: 0.875rem; color: #065f46; margin-bottom: 10px; }
    .err-msg { font-size: 0.875rem; color: #b91c1c; margin-bottom: 10px; }
    .check-result { background: var(--uui-color-surface-alt, #f3f4f6); padding: 10px 14px; border-radius: 4px; font-size: 0.9rem; margin-bottom: 16px; }
    uui-table { width: 100%; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 12px 0; }
  `;
o([
  u()
], t.prototype, "_hiddenNodes", 2);
o([
  u()
], t.prototype, "_loading", 2);
o([
  u()
], t.prototype, "_checkNodeId", 2);
o([
  u()
], t.prototype, "_checkResult", 2);
o([
  u()
], t.prototype, "_bulkIds", 2);
o([
  u()
], t.prototype, "_statusMsg", 2);
o([
  u()
], t.prototype, "_errorMsg", 2);
t = o([
  _("hiddencontent-dashboard")
], t);
const N = t;
export {
  t as HiddenContentDashboardElement,
  N as default
};
